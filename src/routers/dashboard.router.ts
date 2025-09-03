import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = Router();

// Dashboard summary and analytics
router.get('/summary', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getDashboardSummary);
router.get('/analytics', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getAnalyticsData);
router.get('/overview', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getDashboardOverview);

// Dashboard reports
router.get('/report', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getDashboardReport);

// Event-specific data
router.get('/event/:eventId/attendees', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getEventAttendees);
router.get('/event/:eventId/transactions', tokenMiddleware, verifyRole('ORGANIZER'), DashboardController.getEventTransactions);

export default router;
