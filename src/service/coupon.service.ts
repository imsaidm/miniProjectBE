import { prisma } from '../config/prisma';

export class CouponService {
  async getUserCoupons(userId: number) {
    const now = new Date();
    return prisma.coupon.findMany({
      where: { userId, isUsed: false, expiresAt: { gt: now } },
      orderBy: { expiresAt: 'asc' }
    });
  }

  async validateCoupon(code: string, userId: number, transactionId?: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || coupon.userId !== userId || coupon.isUsed || coupon.expiresAt < new Date()) {
      throw { status: 400, message: 'Coupon is invalid, used, or expired.' };
    }
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { isUsed: true, usedByTxnId: transactionId || null, usedAt: new Date() },
    });
    return coupon;
  }
}

export default new CouponService();
