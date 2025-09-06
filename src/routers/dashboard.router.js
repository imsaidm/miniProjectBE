"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = __importDefault(require("../controllers/dashboard.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = (0, express_1.Router)();
// Dashboard summary and analytics
router.get('/summary', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getDashboardSummary);
router.get('/analytics', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getAnalyticsData);
router.get('/overview', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getDashboardOverview);
// Dashboard reports
router.get('/report', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getDashboardReport);
// Event-specific data
router.get('/event/:eventId/attendees', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getEventAttendees);
router.get('/event/:eventId/transactions', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), dashboard_controller_1.default.getEventTransactions);
exports.default = router;
//# sourceMappingURL=dashboard.router.js.map