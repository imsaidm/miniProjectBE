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
        // Don't increment usage count here - it will be done when transaction is confirmed
        return { discountAmount, voucherId: voucher.id };
    }
    async validateAndApplyCoupon(couponCode, subtotal, userId, tx) {
        if (!couponCode)
            return { discountAmount: 0, couponId: null };
        const coupon = await tx.coupon.findFirst({
            where: {
                code: couponCode,
                userId: userId, // Ensure user owns the coupon
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });
        if (!coupon)
            return { discountAmount: 0, couponId: null };
        const discountAmount = coupon.discountType === 'AMOUNT'
            ? coupon.discountValue
            : Math.floor(subtotal * (coupon.discountValue / 100));
        // Don't mark as used here - it will be done when transaction is confirmed
        return { discountAmount, couponId: coupon.id };
    }
    async refundCoupon(couponId, tx) {
        if (!couponId)
            return;
        await tx.coupon.update({
            where: { id: couponId },
            data: { isUsed: false, usedAt: null, usedByTxnId: null }
        });
    }
    async refundVoucher(voucherId, tx) {
        if (!voucherId)
            return;
        await tx.voucher.update({
            where: { id: voucherId },
            data: { usedCount: { decrement: 1 } }
        });
    }
    async confirmVoucherUsage(voucherId, tx) {
        if (!voucherId)
            return;
        await tx.voucher.update({
            where: { id: voucherId },
            data: { usedCount: { increment: 1 } }
        });
    }
    async confirmCouponUsage(couponId, transactionId, tx) {
        if (!couponId)
            return;
        await tx.coupon.update({
            where: { id: couponId },
            data: { isUsed: true, usedAt: new Date(), usedByTxnId: transactionId }
        });
    }
}
exports.DiscountService = DiscountService;
exports.default = new DiscountService();
//# sourceMappingURL=discount.service.js.map