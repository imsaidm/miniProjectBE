interface RevenueData {
    month?: string;
    year?: string;
    date?: string;
    revenue: number;
}
interface DashboardSummaryResult {
    totalEvents: number;
    totalTransactions: number;
    totalRevenue: number;
    monthlyRevenue: RevenueData[];
    yearlyRevenue: RevenueData[];
    dailyRevenue: RevenueData[];
}
interface DashboardReportFilters {
    year?: number;
    month?: number;
    day?: number;
}
export declare class DashboardService {
    /**
     * Get dashboard summary with optimized database queries
     */
    getDashboardSummary(organizerId: number): Promise<DashboardSummaryResult>;
    /**
     * Get event count for organizer
     */
    private getEventCount;
    /**
     * Get completed ticket sales count
     */
    private getTicketSalesCount;
    /**
     * Get total revenue for organizer
     */
    private getTotalRevenue;
    /**
     * Get monthly revenue for current year with optimized query
     */
    private getMonthlyRevenue;
    /**
     * Get yearly revenue with optimized query
     */
    private getYearlyRevenue;
    /**
     * Get daily revenue for current month with optimized query
     */
    private getDailyRevenue;
    /**
     * Get month name from month number
     */
    private getMonthName;
    /**
     * Get dashboard report with filters
     */
    getDashboardReport(organizerId: number, period: DashboardReportFilters): Promise<({
        event: {
            id: number;
            title: string;
            startAt: Date;
        };
        paymentProof: {
            id: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
        items: {
            id: number;
            quantity: number;
            ticketType: {
                name: string;
                priceIDR: number;
            };
            unitPriceIDR: number;
        }[];
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
    /**
     * Get event attendees with optimized query
     */
    getEventAttendees(eventId: number): Promise<({
        user: {
            name: string | null;
            id: number;
            email: string;
            profileImg: string | null;
        };
        ticketType: {
            name: string;
            id: number;
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
    /**
     * Get event transactions with optimized query
     */
    getEventTransactions(eventId: number): Promise<({
        user: {
            name: string | null;
            id: number;
            email: string;
        };
        paymentProof: {
            id: number;
            imageUrl: string;
            uploadedAt: Date;
        } | null;
        items: {
            id: number;
            quantity: number;
            ticketType: {
                name: string;
                priceIDR: number;
            };
            unitPriceIDR: number;
        }[];
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
    /**
     * Get additional analytics data
     */
    getAnalyticsData(organizerId: number): Promise<{
        totalRevenue: number;
        averageTicketPrice: number;
        topEvents: {
            id: number;
            title: string;
            transactionCount: number;
        }[];
    }>;
}
declare const _default: DashboardService;
export default _default;
//# sourceMappingURL=dashboard.service.d.ts.map