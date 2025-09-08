import { prisma } from '../config/prisma';
import { uploadImageBuffer } from '../config/cloudinary';
import pointsService from './transaction/points.service';
import discountService from './transaction/discount.service';
import ticketService from './transaction/ticket.service';
import notificationService from './transaction/notification.service';

export class TransactionService {
  async checkSeatAvailability(items: any[]) {
    return await ticketService.checkSeatAvailability(items);
  }

  async createTransaction(userId: number, data: any) {
    const { eventId, items, voucherCode, couponCode, pointsUsed } = data;
    
    // Check if user is trying to book their own event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true, title: true }
    });
    
    if (!event) {
      throw { status: 404, message: 'Event not found' };
    }
    
    if (event.organizerId === userId) {
      throw { status: 403, message: 'Organizers cannot book tickets for their own events' };
    }
    
    return await prisma.$transaction(async (tx) => {
      // Validate and reserve tickets
      const { subtotal, items: validatedItems } = await ticketService.validateAndReserveTickets(items, tx);
      
      // Apply discounts
      const { discountAmount: discountVoucherIDR, voucherId } = await discountService.validateAndApplyVoucher(voucherCode, eventId, subtotal, tx);
      const { discountAmount: discountCouponIDR, couponId } = await discountService.validateAndApplyCoupon(couponCode, subtotal, userId, tx);
      
      // Handle points usage
      const actualPointsUsed = await pointsService.validateAndUsePoints(userId, pointsUsed, tx);
      
      const totalPayableIDR = Math.max(subtotal - discountVoucherIDR - discountCouponIDR - actualPointsUsed, 0);
      
      const txn = await tx.transaction.create({
        data: {
          userId, eventId, status: 'WAITING_PAYMENT',
          paymentDueAt: new Date(Date.now() + 2 * 60), // 2 hours - > 2 Minutes
          subtotalIDR: subtotal, discountVoucherIDR, discountCouponIDR,
          pointsUsed: actualPointsUsed, totalPayableIDR,
          usedVoucherId: voucherId ?? null, usedCouponId: couponId ?? null,
          items: {
            create: validatedItems.map((item: any) => ({
              ticketTypeId: item.ticketTypeId, 
              quantity: item.quantity, 
              unitPriceIDR: item.__unitPriceIDR
            }))
          },
        }
      });
      
      if (actualPointsUsed > 0) {
        await pointsService.updateUserPointsBalance(userId);
      }
      
      return txn;
    }, {
      timeout: 60000,
      maxWait: 20000
    });
  }

  async uploadPaymentProof(userId: number, transactionId: number, file: Express.Multer.File) {
    const txn = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
    if (!txn) throw new Error('Transaction not found');
    
    if (!file || !file.buffer) {
      throw new Error('Payment proof image is required');
    }
    
    try {
      const imageUrl = await uploadImageBuffer(file.buffer, 'payment-proofs');
      const decisionBy = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      
      return await prisma.$transaction(async (tx) => {
        const proof = await tx.paymentProof.create({ data: { transactionId, imageUrl } });
        await tx.transaction.update({ 
          where: { id: transactionId }, 
          data: { status: 'WAITING_ADMIN_CONFIRMATION', organizerDecisionBy: decisionBy } 
        });
        return proof;
      }, {
        timeout: 30000,
        maxWait: 10000
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image: ' + (error as any).message);
    }
  }

  async acceptTransaction(organizerId: number, transactionId: number) {
    try {
      const txn = await prisma.transaction.findUnique({ 
        where: { id: transactionId }, 
        include: { event: true, user: true, items: true } 
      });
      
      if (!txn) throw new Error('Transaction not found');
      if (txn.event.organizerId !== organizerId) throw new Error('Forbidden');
      
      const updated = await prisma.$transaction(async (tx) => {
        const done = await tx.transaction.update({ 
          where: { id: transactionId }, 
          data: { status: 'DONE' } 
        });
        
        // Confirm voucher and coupon usage
        await discountService.confirmVoucherUsage(txn.usedVoucherId, tx);
        await discountService.confirmCouponUsage(txn.usedCouponId, transactionId, tx);
        
        await ticketService.createAttendanceRecords(txn, tx);
        return done;
      }, {
        timeout: 30000,
        maxWait: 10000
      });
      
      await notificationService.notifyTransactionAccepted(txn);
      return updated;
    } catch (error) {
      console.error('Error in acceptTransaction:', error);
      throw error;
    }
  }

  async rejectTransaction(organizerId: number, transactionId: number) {
    return await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.findUnique({ 
        where: { id: transactionId }, 
        include: { event: true, user: true, items: true } 
      });
      if (!txn) throw new Error('Transaction not found');
      if (txn.event.organizerId !== organizerId) throw new Error('Forbidden');

      await ticketService.releaseTickets(txn.items, tx);
      await discountService.refundCoupon(txn.usedCouponId, tx);
      await discountService.refundVoucher(txn.usedVoucherId, tx);
      
      if (txn.pointsUsed && txn.pointsUsed > 0) {
        await pointsService.refundPoints(txn.userId, txn.pointsUsed, tx);
      }
      
      const updated = await tx.transaction.update({ where: { id: transactionId }, data: { status: 'REJECTED' } });
      await notificationService.notifyTransactionRejected(txn);
      
      if (txn.pointsUsed && txn.pointsUsed > 0) {
        await pointsService.updateUserPointsBalance(txn.userId);
      }
      
      return updated;
    }, {
      timeout: 30000,
      maxWait: 10000
    });
  }

  async cancelTransaction(userId: number, transactionId: number) {
    return await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.findUnique({ where: { id: transactionId, userId }, include: { items: true } });
      if (!txn) throw new Error('Transaction not found');
      
      await ticketService.releaseTickets(txn.items, tx);
      await discountService.refundCoupon(txn.usedCouponId, tx);
      
      if (txn.pointsUsed && txn.pointsUsed > 0) {
        await pointsService.refundPoints(txn.userId, txn.pointsUsed, tx);
      }
      
      const updated = await tx.transaction.update({ where: { id: transactionId }, data: { status: 'CANCELED' } });
      
      if (txn.pointsUsed && txn.pointsUsed > 0) {
        await pointsService.updateUserPointsBalance(txn.userId);
      }
      
      return updated;
    }, {
      timeout: 10000,
      maxWait: 5000
    });
  }

  async getUserTransactions(userId: number) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { 
        event: true, 
        items: { include: { ticketType: true } }, 
        paymentProof: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getOrganizerTransactions(organizerId: number, eventId?: number) {
    return prisma.transaction.findMany({
      where: { 
        event: { 
          organizerId,
          ...(eventId ? { id: eventId } : {})
        } 
      },
      include: { 
        event: true, 
        user: { select: { name: true, email: true } },
        items: { include: { ticketType: true } },
        paymentProof: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async getTransactionDetails(transactionId: number, userId?: number) {
    const where: any = { id: transactionId };
    if (userId) where.userId = userId;
    
    return prisma.transaction.findUnique({
      where,
      include: { 
        event: true, 
        user: { select: { name: true, email: true } },
        items: { include: { ticketType: true } },
        paymentProof: true
      }
    });
  }

  async getAttendeeList(eventId: number) {
    return prisma.attendance.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, email: true } }, ticketType: true }
    });
  }

  async expireOverdueTransactions() {
    const now = new Date();
    const overdue = await prisma.transaction.findMany({
      where: { status: 'WAITING_PAYMENT', paymentDueAt: { lt: now } },
      include: { items: true }
    });
    
    for (const txn of overdue) {
      await this._rollbackTransaction(txn);
    }
    
    return { expiredCount: overdue.length };
  }

  async autoCancelStaleTransactions() {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    
    const stale = await prisma.transaction.findMany({
      where: { 
        status: 'WAITING_ADMIN_CONFIRMATION', 
        organizerDecisionBy: { lt: threeDaysAgo } 
      },
      include: { items: true }
    });
    
    for (const txn of stale) {
      await this._rollbackTransaction(txn);
    }
    
    return { canceledCount: stale.length };
  }

  private async _rollbackTransaction(txn: any) {
    await prisma.$transaction(async (tx) => {
      await ticketService.releaseTickets(txn.items, tx);
      await discountService.refundCoupon(txn.usedCouponId, tx);
      await discountService.refundVoucher(txn.usedVoucherId, tx);
      
      if (txn.pointsUsed && txn.pointsUsed > 0) {
        await pointsService.refundPoints(txn.userId, txn.pointsUsed, tx);
      }
      
      const status = txn.status === 'WAITING_PAYMENT' ? 'EXPIRED' : 'CANCELED';
      await tx.transaction.update({ where: { id: txn.id }, data: { status } });
    }, {
      timeout: 10000,
      maxWait: 5000
    });
    
    if (txn.pointsUsed && txn.pointsUsed > 0) {
      await pointsService.updateUserPointsBalance(txn.userId);
    }
  }

  async cleanupExpiredPoints() {
    const now = new Date();
    const expiredPoints = await prisma.pointEntry.findMany({
      where: { 
        expiresAt: { lt: now },
        delta: { gt: 0 } // Only positive point entries
      }
    });
    
    for (const pointEntry of expiredPoints) {
      await prisma.$transaction(async (tx) => {
        // Update user's points balance
        await tx.user.update({
          where: { id: pointEntry.userId },
          data: { pointsBalance: { decrement: pointEntry.delta } }
        });
        
        // Mark the point entry as expired by setting delta to 0
        await tx.pointEntry.update({
          where: { id: pointEntry.id },
          data: { delta: 0 }
        });
      });
    }
    
    return { cleanedCount: expiredPoints.length };
  }
}

export default new TransactionService();
