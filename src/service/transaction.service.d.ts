export declare class TransactionService {
    createTransaction(userId: number, data: any): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    }>;
    uploadPaymentProof(userId: number, transactionId: number, file: Express.Multer.File): Promise<{
        id: number;
        transactionId: number;
        imageUrl: string;
        uploadedAt: Date;
    }>;
    acceptTransaction(organizerId: number, transactionId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    }>;
    rejectTransaction(organizerId: number, transactionId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    }>;
    cancelTransaction(userId: number, transactionId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    }>;
    getUserTransactions(userId: number): Promise<({
        event: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            status: import("../generated/prisma").$Enums.EventStatus;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
            organizerId: number;
        };
        items: ({
            ticketType: {
                name: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
                eventId: number;
            };
        } & {
            id: number;
            transactionId: number;
            quantity: number;
            unitPriceIDR: number;
            ticketTypeId: number;
        })[];
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    })[]>;
    getOrganizerTransactions(organizerId: number, eventId?: number): Promise<({
        user: {
            email: string;
            name: string | null;
        };
        event: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            status: import("../generated/prisma").$Enums.EventStatus;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
            organizerId: number;
        };
        items: ({
            ticketType: {
                name: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
                eventId: number;
            };
        } & {
            id: number;
            transactionId: number;
            quantity: number;
            unitPriceIDR: number;
            ticketTypeId: number;
        })[];
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    })[]>;
    getTransactionDetails(transactionId: number, userId?: number): Promise<({
        user: {
            email: string;
            name: string | null;
        };
        event: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            status: import("../generated/prisma").$Enums.EventStatus;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
            organizerId: number;
        };
        items: ({
            ticketType: {
                name: string;
                createdAt: Date;
                updatedAt: Date;
                id: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
                eventId: number;
            };
        } & {
            id: number;
            transactionId: number;
            quantity: number;
            unitPriceIDR: number;
            ticketTypeId: number;
        })[];
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
        eventId: number;
        paymentDueAt: Date;
        organizerDecisionBy: Date | null;
        subtotalIDR: number;
        discountVoucherIDR: number;
        discountCouponIDR: number;
        pointsUsed: number;
        totalPayableIDR: number;
        usedVoucherId: number | null;
        usedCouponId: number | null;
    }) | null>;
    getAttendeeList(eventId: number): Promise<({
        user: {
            email: string;
            name: string | null;
            id: number;
        };
        ticketType: {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            totalSeats: number;
            availableSeats: number;
            priceIDR: number;
            eventId: number;
        } | null;
    } & {
        createdAt: Date;
        id: number;
        userId: number;
        eventId: number;
        quantity: number;
        ticketTypeId: number | null;
        totalPaidIDR: number;
    })[]>;
    expireOverdueTransactions(): Promise<{
        expiredCount: number;
    }>;
    autoCancelStaleTransactions(): Promise<{
        canceledCount: number;
    }>;
    private _rollbackTransaction;
    cleanupExpiredPoints(): Promise<{
        cleanedCount: number;
    }>;
}
declare const _default: TransactionService;
export default _default;
//# sourceMappingURL=transaction.service.d.ts.map