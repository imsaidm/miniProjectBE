"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = __importDefault(require("../service/review.service"));
class ReviewController {
    async createReview(req, res, next) {
        try {
            const userId = req.user.id;
            const eventId = req.body.eventId;
            const { rating, comment } = req.body;
            const review = await review_service_1.default.createReview(userId, eventId, { rating, comment });
            res.status(201).json(review);
        }
        catch (err) {
            next(err);
        }
    }
    async updateReview(req, res, next) {
        try {
            const userId = req.user.id;
            const reviewId = parseInt(req.params.reviewId || '0');
            const update = await review_service_1.default.updateReview(reviewId, userId, req.body);
            res.status(200).json(update);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteReview(req, res, next) {
        try {
            const userId = req.user.id;
            const reviewId = parseInt(req.params.reviewId || '0');
            const del = await review_service_1.default.deleteReview(reviewId, userId);
            res.status(200).json(del);
        }
        catch (err) {
            next(err);
        }
    }
    async getEventReviews(req, res, next) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            const reviews = await review_service_1.default.getEventReviews(eventId);
            res.status(200).json(reviews);
        }
        catch (err) {
            next(err);
        }
    }
    async getOrganizerReviews(req, res, next) {
        try {
            const organizerId = parseInt(req.params.organizerId || '0');
            const reviews = await review_service_1.default.getOrganizerReviews(organizerId);
            res.status(200).json(reviews);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ReviewController = ReviewController;
exports.default = new ReviewController();
//# sourceMappingURL=review.controller.js.map