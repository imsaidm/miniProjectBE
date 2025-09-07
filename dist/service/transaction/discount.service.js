"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountService = void 0;
class DiscountService {
    async validateAndApplyVoucher(voucherCode, subtotal, tx) {
        if (!voucherCode)
            return { discountAmount: 0, voucherId: null };
        const voucher = await tx.voucher.findFirst({
            where: {
                code: voucherCode,
                isActive: true,
                startsAt: { lte: new Date() },
                endsAt: { gte: new Date() }
            }
        });
        if (!voucher)
            return { discountAmount: 0, voucherId: null };
        // Check if voucher has reached its usage limit
        if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
            return { discountAmount: 0, voucherId: null };
        }
        const discountAmount = voucher.discountType === 'AMOUNT'
            ? voucher.discountValue
            : Math.floor(subtotal * (voucher.discountValue / 100));
        await tx.voucher.update({
            where: { id: voucher.id },
            data: { usedCount: { increment: 1 } }
        });
        return { discountAmount, voucherId: voucher.id };
    }
    async validateAndApplyCoupon(couponCode, subtotal, tx) {
        if (!couponCode)
            return { discountAmount: 0, couponId: null };
        const coupon = await tx.coupon.findFirst({
            where: {
                code: couponCode,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });
        if (!coupon)
            return { discountAmount: 0, couponId: null };
        const discountAmount = coupon.discountType === 'AMOUNT'
            ? coupon.discountValue
            : Math.floor(subtotal * (coupon.discountValue / 100));
        await tx.coupon.update({
            where: { id: coupon.id },
            data: { isUsed: true, usedAt: new Date() }
        });
        return { discountAmount, couponId: coupon.id };
    }
    async refundCoupon(couponId, tx) {
        if (!couponId)
            return;
        await tx.coupon.update({
            where: { id: couponId },
            data: { isUsed: false, usedAt: null }
        });
    }
}
exports.DiscountService = DiscountService;
exports.default = new DiscountService();
//# sourceMappingURL=discount.service.js.map