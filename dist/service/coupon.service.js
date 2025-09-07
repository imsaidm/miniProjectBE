"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const prisma_1 = require("../config/prisma");
class CouponService {
    async getUserCoupons(userId) {
        const now = new Date();
        return prisma_1.prisma.coupon.findMany({
            where: { userId, isUsed: false, expiresAt: { gt: now } },
            orderBy: { expiresAt: 'asc' }
        });
    }
    async validateCoupon(code, userId, transactionId) {
        const coupon = await prisma_1.prisma.coupon.findUnique({ where: { code } });
        if (!coupon || coupon.userId !== userId || coupon.isUsed || coupon.expiresAt < new Date()) {
            throw { status: 400, message: 'Coupon is invalid, used, or expired.' };
        }
        await prisma_1.prisma.coupon.update({
            where: { id: coupon.id },
            data: { isUsed: true, usedByTxnId: transactionId || null, usedAt: new Date() },
        });
        return coupon;
    }
}
exports.CouponService = CouponService;
exports.default = new CouponService();
//# sourceMappingURL=coupon.service.js.map