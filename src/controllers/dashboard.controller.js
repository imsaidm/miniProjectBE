"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = __importDefault(require("../service/dashboard.service"));
class DashboardController {
    /**
     * Get dashboard summary for organizer
     */
    async getDashboardSummary(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Validate organizer ID
            if (typeof organizerId !== 'number' || organizerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid organizer ID'
                });
            }
            const result = await dashboard_service_1.default.getDashboardSummary(organizerId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Dashboard summary retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error in getDashboardSummary:', error);
            next(error);
        }
    }
    /**
     * Get dashboard report with filters
     */
    async getDashboardReport(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Validate organizer ID
            if (typeof organizerId !== 'number' || organizerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid organizer ID'
                });
            }
            // Extract and validate query parameters
            const { year, month, day } = req.query;
            const period = {};
            if (year) {
                const yearNum = parseInt(year);
                if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid year parameter'
                    });
                }
                period.year = yearNum;
            }
            if (month) {
                const monthNum = parseInt(month);
                if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid month parameter'
                    });
                }
                period.month = monthNum;
            }
            if (day) {
                const dayNum = parseInt(day);
                if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid day parameter'
                    });
                }
                period.day = dayNum;
            }
            const result = await dashboard_service_1.default.getDashboardReport(organizerId, period);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Dashboard report retrieved successfully',
                filters: period
            });
        }
        catch (error) {
            console.error('Error in getDashboardReport:', error);
            next(error);
        }
    }
    /**
     * Get event attendees
     */
    async getEventAttendees(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Extract and validate event ID
            const eventId = parseInt(req.params.eventId || '0');
            if (isNaN(eventId) || eventId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
            }
            // TODO: Add authorization check to ensure user owns this event
            // This would require an additional service method to verify event ownership
            const result = await dashboard_service_1.default.getEventAttendees(eventId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Event attendees retrieved successfully',
                count: result.length
            });
        }
        catch (error) {
            console.error('Error in getEventAttendees:', error);
            next(error);
        }
    }
    /**
     * Get event transactions
     */
    async getEventTransactions(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Extract and validate event ID
            const eventId = parseInt(req.params.eventId || '0');
            if (isNaN(eventId) || eventId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid event ID'
                });
            }
            // TODO: Add authorization check to ensure user owns this event
            // This would require an additional service method to verify event ownership
            const result = await dashboard_service_1.default.getEventTransactions(eventId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Event transactions retrieved successfully',
                count: result.length
            });
        }
        catch (error) {
            console.error('Error in getEventTransactions:', error);
            next(error);
        }
    }
    /**
     * Get analytics data for organizer
     */
    async getAnalyticsData(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Validate organizer ID
            if (typeof organizerId !== 'number' || organizerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid organizer ID'
                });
            }
            const result = await dashboard_service_1.default.getAnalyticsData(organizerId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Analytics data retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error in getAnalyticsData:', error);
            next(error);
        }
    }
    /**
     * Get dashboard overview (summary + analytics)
     */
    async getDashboardOverview(req, res, next) {
        try {
            const organizerId = req.user?.id;
            // Validate user authentication
            if (!organizerId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            // Validate organizer ID
            if (typeof organizerId !== 'number' || organizerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid organizer ID'
                });
            }
            // Get both summary and analytics data in parallel
            const [summary, analytics] = await Promise.all([
                dashboard_service_1.default.getDashboardSummary(organizerId),
                dashboard_service_1.default.getAnalyticsData(organizerId)
            ]);
            res.status(200).json({
                success: true,
                data: {
                    summary,
                    analytics
                },
                message: 'Dashboard overview retrieved successfully'
            });
        }
        catch (error) {
            console.error('Error in getDashboardOverview:', error);
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
exports.default = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map