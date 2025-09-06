"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = __importDefault(require("../controllers/review.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = (0, express_1.Router)();
router.post('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER', 'ADMIN'), review_controller_1.default.createReview);
router.patch('/:reviewId', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER', 'ADMIN'), review_controller_1.default.updateReview);
router.delete('/:reviewId', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER', 'ADMIN'), review_controller_1.default.deleteReview);
router.get('/event/:eventId', review_controller_1.default.getEventReviews);
router.get('/organizer/:organizerId', review_controller_1.default.getOrganizerReviews);
exports.default = router;
//# sourceMappingURL=review.router.js.map