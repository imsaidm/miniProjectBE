"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const prisma_1 = require("../config/prisma");
const cloudinary_1 = require("../config/cloudinary");
const points_service_1 = __importDefault(require("./transaction/points.service"));
const discount_service_1 = __importDefault(require("./transaction/discount.service"));
const ticket_service_1 = __importDefault(require("./transaction/ticket.service"));
const notification_service_1 = __importDefault(require("./transaction/notification.service"));
const constants_1 = require("../utils/constants");
class TransactionService {
    async checkSeatAvailability(items) {
        return await ticket_service_1.default.checkSeatAvailability(items);
    }
    async createTransaction(userId, data) {
        const { eventId, items, voucherCode, couponCode, pointsUsed } = data;
        // Check if user is trying to book their own event
        const event = await prisma_1.prisma.event.findUnique({
            where: { id: eventId },
            select: { organizerId: true, title: true }
        });
        if (!event) {
            throw { status: 404, message: 'Event not found' };
        }
        if (event.organizerId === userId) {
            throw { status: 403, message: 'Organizers cannot book tickets for their own events' };
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Validate and reserve tickets
            const { subtotal, items: validatedItems } = await ticket_service_1.default.validateAndReserveTickets(items, tx);
            // Apply discounts
            const { discountAmount: discountVoucherIDR, voucherId } = await discount_service_1.default.validateAndApplyVoucher(voucherCode, eventId, subtotal, tx);
            const { discountAmount: discountCouponIDR, couponId } = await discount_service_1.default.validateAndApplyCoupon(couponCode, subtotal, userId, tx);
            // Handle points usage
            const actualPointsUsed = await points_service_1.default.validateAndUsePoints(userId, pointsUsed, tx);
            const totalPayableIDR = Math.max(subtotal - discountVoucherIDR - discountCouponIDR - actualPointsUsed, 0);
            const txn = await tx.transaction.create({
                data: {
                    userId, eventId, status: 'WAITING_PAYMENT',
                    paymentDueAt: new Date(Date.now() + constants_1.APP_CONSTANTS.PAYMENT_TIMEOUT_HOURS * 60 * 60 * 1000), // 2 hours
                    subtotalIDR: subtotal, discountVoucherIDR, discountCouponIDR,
                    pointsUsed: actualPointsUsed, totalPayableIDR,
                    usedVoucherId: voucherId ?? null, usedCouponId: couponId ?? null,
                    items: {
                        create: validatedItems.map((item) => ({
                            ticketTypeId: item.ticketTypeId,
                            quantity: item.quantity,
                            unitPriceIDR: item.__unitPriceIDR
                        }))
                    },
                }
            });
            if (actualPointsUsed > 0) {
                await points_service_1.default.updateUserPointsBalance(userId);
            }
            return txn;
        }, {
            timeout: 60000,
            maxWait: 20000
        });
    }
    async uploadPaymentProof(userId, transactionId, file) {
        const txn = await prisma_1.prisma.transaction.findFirst({ where: { id: transactionId, userId } });
        if (!txn)
            throw new Error('Transaction not found');
        if (!file || !file.buffer) {
            throw new Error('Payment proof image is required');
        }
        try {
            const imageUrl = await (0, cloudinary_1.uploadImageBuffer)(file.buffer, 'payment-proofs');
            const decisionBy = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            return await prisma_1.prisma.$transaction(async (tx) => {
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
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image: ' + error.message);
        }
    }
    async acceptTransaction(organizerId, transactionId) {
        try {
            const txn = await prisma_1.prisma.transaction.findUnique({
                where: { id: transactionId },
                include: { event: true, user: true, items: true }
            });
            if (!txn)
                throw new Error('Transaction not found');
            if (txn.event.organizerId !== organizerId)
                throw new Error('Forbidden');
            const updated = await prisma_1.prisma.$transaction(async (tx) => {
                const done = await tx.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'DONE' }
                });
                // Confirm voucher and coupon usage
                await discount_service_1.default.confirmVoucherUsage(txn.usedVoucherId, tx);
                await discount_service_1.default.confirmCouponUsage(txn.usedCouponId, transactionId, tx);
                await ticket_service_1.default.createAttendanceRecords(txn, tx);
                return done;
            }, {
                timeout: 30000,
                maxWait: 10000
            });
            await notification_service_1.default.notifyTransactionAccepted(txn);
            return updated;
        }
        catch (error) {
            console.error('Error in acceptTransaction:', error);
            throw error;
        }
    }
    async rejectTransaction(organizerId, transactionId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const txn = await tx.transaction.findUnique({
                where: { id: transactionId },
                include: { event: true, user: true, items: true }
            });
            if (!txn)
                throw new Error('Transaction not found');
            if (txn.event.organizerId !== organizerId)
                throw new Error('Forbidden');
            await ticket_service_1.default.releaseTickets(txn.items, tx);
            await discount_service_1.default.refundCoupon(txn.usedCouponId, tx);
            await discount_service_1.default.refundVoucher(txn.usedVoucherId, tx);
            if (txn.pointsUsed && txn.pointsUsed > 0) {
                await points_service_1.default.refundPoints(txn.userId, txn.pointsUsed, tx);
            }
            const updated = await tx.transaction.update({ where: { id: transactionId }, data: { status: 'REJECTED' } });
            await notification_service_1.default.notifyTransactionRejected(txn);
            if (txn.pointsUsed && txn.pointsUsed > 0) {
                await points_service_1.default.updateUserPointsBalance(txn.userId);
            }
            return updated;
        }, {
            timeout: 30000,
            maxWait: 10000
        });
    }
    async cancelTransaction(userId, transactionId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const txn = await tx.transaction.findUnique({ where: { id: transactionId, userId }, include: { items: true } });
            if (!txn)
                throw new Error('Transaction not found');
            await ticket_service_1.default.releaseTickets(txn.items, tx);
            await discount_service_1.default.refundCoupon(txn.usedCouponId, tx);
            if (txn.pointsUsed && txn.pointsUsed > 0) {
                await points_service_1.default.refundPoints(txn.userId, txn.pointsUsed, tx);
            }
            const updated = await tx.transaction.update({ where: { id: transactionId }, data: { status: 'CANCELED' } });
            if (txn.pointsUsed && txn.pointsUsed > 0) {
                await points_service_1.default.updateUserPointsBalance(txn.userId);
            }
            return updated;
        }, {
            timeout: 10000,
            maxWait: 5000
        });
    }
    async getUserTransactions(userId) {
        return prisma_1.prisma.transaction.findMany({
            where: { userId },
            include: {
                event: true,
                items: { include: { ticketType: true } },
                paymentProof: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrganizerTransactions(organizerId, eventId) {
        return prisma_1.prisma.transaction.findMany({
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
    async getTransactionDetails(transactionId, userId) {
        const where = { id: transactionId };
        if (userId)
            where.userId = userId;
        return prisma_1.prisma.transaction.findUnique({
            where,
            include: {
                event: true,
                user: { select: { name: true, email: true } },
                items: { include: { ticketType: true } },
                paymentProof: true
            }
        });
    }
    async getAttendeeList(eventId) {
        return prisma_1.prisma.attendance.findMany({
            where: { eventId },
            include: { user: { select: { id: true, name: true, email: true } }, ticketType: true }
        });
    }
    async expireOverdueTransactions() {
        const now = new Date();
        const overdue = await prisma_1.prisma.transaction.findMany({
            where: { status: 'WAITING_PAYMENT', paymentDueAt: { lt: now } },
            include: { items: true }
        });
        console.log(`[SCHEDULER] Found ${overdue.length} overdue transactions at ${now.toISOString()}`);
        for (const txn of overdue) {
            console.log(`[SCHEDULER] Expiring transaction ${txn.id}, due at ${txn.paymentDueAt}, now ${now}`);
            await this._rollbackTransaction(txn);
        }
        return { expiredCount: overdue.length };
    }
    async autoCancelStaleTransactions() {
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
        const stale = await prisma_1.prisma.transaction.findMany({
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
    async _rollbackTransaction(txn) {
        await prisma_1.prisma.$transaction(async (tx) => {
            await ticket_service_1.default.releaseTickets(txn.items, tx);
            await discount_service_1.default.refundCoupon(txn.usedCouponId, tx);
            await discount_service_1.default.refundVoucher(txn.usedVoucherId, tx);
            if (txn.pointsUsed && txn.pointsUsed > 0) {
                await points_service_1.default.refundPoints(txn.userId, txn.pointsUsed, tx);
            }
            const status = txn.status === 'WAITING_PAYMENT' ? 'EXPIRED' : 'CANCELED';
            await tx.transaction.update({ where: { id: txn.id }, data: { status } });
        }, {
            timeout: 10000,
            maxWait: 5000
        });
        if (txn.pointsUsed && txn.pointsUsed > 0) {
            await points_service_1.default.updateUserPointsBalance(txn.userId);
        }
    }
    async cleanupExpiredPoints() {
        const now = new Date();
        const expiredPoints = await prisma_1.prisma.pointEntry.findMany({
            where: {
                expiresAt: { lt: now },
                delta: { gt: 0 } // Only positive point entries
            }
        });
        for (const pointEntry of expiredPoints) {
            await prisma_1.prisma.$transaction(async (tx) => {
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
exports.TransactionService = TransactionService;
exports.default = new TransactionService();
//# sourceMappingURL=transaction.service.js.map