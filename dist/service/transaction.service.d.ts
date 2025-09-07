export declare class TransactionService {
    checkSeatAvailability(items: any[]): Promise<boolean>;
    createTransaction(userId: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("../generated/prisma").$Enums.EventStatus;
            organizerId: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
        };
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
        items: ({
            ticketType: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                eventId: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
            };
        } & {
            id: number;
            transactionId: number;
            ticketTypeId: number;
            quantity: number;
            unitPriceIDR: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
            name: string | null;
            email: string;
        };
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("../generated/prisma").$Enums.EventStatus;
            organizerId: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
        };
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
        items: ({
            ticketType: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                eventId: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
            };
        } & {
            id: number;
            transactionId: number;
            ticketTypeId: number;
            quantity: number;
            unitPriceIDR: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
            name: string | null;
            email: string;
        };
        event: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: import("../generated/prisma").$Enums.EventStatus;
            organizerId: number;
            title: string;
            description: string;
            location: string;
            category: import("../generated/prisma").$Enums.EventCategory;
            bannerImage: string | null;
            startAt: Date;
            endAt: Date;
            basePriceIDR: number | null;
            totalSeats: number | null;
            availableSeats: number | null;
        };
        paymentProof: {
            id: number;
            transactionId: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
        items: ({
            ticketType: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                eventId: number;
                totalSeats: number;
                availableSeats: number;
                priceIDR: number;
            };
        } & {
            id: number;
            transactionId: number;
            ticketTypeId: number;
            quantity: number;
            unitPriceIDR: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        eventId: number;
        status: import("../generated/prisma").$Enums.TransactionStatus;
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
            name: string | null;
            id: number;
            email: string;
        };
        ticketType: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            eventId: number;
            totalSeats: number;
            availableSeats: number;
            priceIDR: number;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        ticketTypeId: number | null;
        quantity: number;
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