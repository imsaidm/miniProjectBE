import { Request, Response, NextFunction } from 'express';
export declare class DashboardController {
    /**
     * Get dashboard summary for organizer
     */
    getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get dashboard report with filters
     */
    getDashboardReport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get event attendees
     */
    getEventAttendees(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get event transactions
     */
    getEventTransactions(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get analytics data for organizer
     */
    getAnalyticsData(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get dashboard overview (summary + analytics)
     */
    getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: DashboardController;
export default _default;
//# sourceMappingURL=dashboard.controller.d.ts.map