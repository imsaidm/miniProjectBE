export declare class DiscountService {
    validateAndApplyVoucher(voucherCode: string, subtotal: number, tx: any): Promise<{
        discountAmount: any;
        voucherId: any;
    }>;
    validateAndApplyCoupon(couponCode: string, subtotal: number, tx: any): Promise<{
        discountAmount: any;
        couponId: any;
    }>;
    refundCoupon(couponId: number | null, tx: any): Promise<void>;
}
declare const _default: DiscountService;
export default _default;
//# sourceMappingURL=discount.service.d.ts.map