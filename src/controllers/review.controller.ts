import { Request, Response, NextFunction } from 'express';
import ReviewService from '../service/review.service';

export class ReviewController {
    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const eventId = req.body.eventId;
            const { rating, comment } = req.body;
            const review = await ReviewService.createReview(userId, eventId, { rating, comment });
            res.status(201).json(review);
        } catch (err) { next(err); }
    }
    async updateReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const reviewId = parseInt(req.params.reviewId || '0');
            const update = await ReviewService.updateReview(reviewId, userId, req.body);
            res.status(200).json(update);
        } catch (err) { next(err); }
    }
    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const reviewId = parseInt(req.params.reviewId || '0');
            const del = await ReviewService.deleteReview(reviewId, userId);
            res.status(200).json(del);
        } catch (err) { next(err); }
    }
    async getEventReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            const reviews = await ReviewService.getEventReviews(eventId);
            res.status(200).json(reviews);
        } catch (err) { next(err); }
    }
    async getOrganizerReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = parseInt(req.params.organizerId || '0');
            const reviews = await ReviewService.getOrganizerReviews(organizerId);
            res.status(200).json(reviews);
        } catch (err) { next(err); }
    }
}

export default new ReviewController();
