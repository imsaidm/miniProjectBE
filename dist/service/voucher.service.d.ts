export declare class VoucherService {
    createVoucher(organizerId: number, eventId: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        eventId: number;
        organizerId: number;
        startsAt: Date;
        endsAt: Date;
        maxUses: number | null;
        usedCount: number;
        isActive: boolean;
    }>;
    updateVoucher(organizerId: number, voucherId: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        eventId: number;
        organizerId: number;
        startsAt: Date;
        endsAt: Date;
        maxUses: number | null;
        usedCount: number;
        isActive: boolean;
    }>;
    deleteVoucher(organizerId: number, voucherId: number): Promise<{
        id: number;
        createdAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        eventId: number;
        organizerId: number;
        startsAt: Date;
        endsAt: Date;
        maxUses: number | null;
        usedCount: number;
        isActive: boolean;
    }>;
    listVouchers(organizerId: number, eventId?: number): Promise<{
        id: number;
        createdAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        eventId: number;
        organizerId: number;
        startsAt: Date;
        endsAt: Date;
        maxUses: number | null;
        usedCount: number;
        isActive: boolean;
    }[]>;
    validateVoucher(code: string, eventId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        code: string;
        discountType: import("../generated/prisma").$Enums.DiscountType;
        discountValue: number;
        eventId: number;
        organizerId: number;
        startsAt: Date;
        endsAt: Date;
        maxUses: number | null;
        usedCount: number;
        isActive: boolean;
    }>;
}
declare const _default: VoucherService;
export default _default;
//# sourceMappingURL=voucher.service.d.ts.map