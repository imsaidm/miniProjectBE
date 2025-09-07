export declare class CouponService {
    getUserCoupons(userId: number): Promise<{
        id: number;
        usedAt: Date | null;
        userId: number;
        expiresAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        issuedAt: Date;
        isUsed: boolean;
        usedByTxnId: number | null;
    }[]>;
    validateCoupon(code: string, userId: number, transactionId?: number): Promise<{
        id: number;
        usedAt: Date | null;
        userId: number;
        expiresAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        issuedAt: Date;
        isUsed: boolean;
        usedByTxnId: number | null;
    }>;
}
declare const _default: CouponService;
export default _default;
//# sourceMappingURL=coupon.service.d.ts.map