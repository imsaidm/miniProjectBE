import { Request, Response, NextFunction } from 'express';
export declare class ReviewController {
    createReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteReview(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEventReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrganizerReviews(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ReviewController;
export default _default;
//# sourceMappingURL=review.controller.d.ts.map