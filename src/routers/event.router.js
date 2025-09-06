"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const event_controller_1 = __importDefault(require("../controllers/event.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
// public discovery
router.get('/', event_controller_1.default.listEvents);
// organizer-only actions
router.get('/my', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), event_controller_1.default.getOrganizerEvents);
router.post('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), upload.single('bannerImage'), event_controller_1.default.createEvent);
// event details (must be after /my to avoid conflicts)
router.get('/:eventId', event_controller_1.default.getEventDetails);
router.patch('/:eventId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), upload.single('bannerImage'), event_controller_1.default.updateEvent);
router.delete('/:eventId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), event_controller_1.default.deleteEvent);
router.post('/:eventId/ticket-types', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), event_controller_1.default.createTicketType);
router.patch('/ticket-types/:ticketTypeId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), event_controller_1.default.updateTicketType);
router.delete('/ticket-types/:ticketTypeId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), event_controller_1.default.deleteTicketType);
exports.default = router;
//# sourceMappingURL=event.router.js.map