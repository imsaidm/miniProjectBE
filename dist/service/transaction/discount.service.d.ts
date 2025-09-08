export declare class DiscountService {
    validateAndApplyVoucher(voucherCode: string, subtotal: number, tx: any): Promise<{
        discountAmount: any;
        voucherId: any;
    }>;
    validateAndApplyCoupon(couponCode: string, subtotal: number, userId: number, tx: any): Promise<{
        discountAmount: any;
        couponId: any;
    }>;
    refundCoupon(couponId: number | null, tx: any): Promise<void>;
    refundVoucher(voucherId: number | null, tx: any): Promise<void>;
    confirmVoucherUsage(voucherId: number | null, tx: any): Promise<void>;
    confirmCouponUsage(couponId: number | null, transactionId: number, tx: any): Promise<void>;
}
declare const _default: DiscountService;
export default _default;
//# sourceMappingURL=discount.service.d.ts.map