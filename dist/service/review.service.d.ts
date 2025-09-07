export declare class ReviewService {
    createReview(userId: number, eventId: number, data: {
        rating: number;
        comment?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        rating: number;
        comment: string | null;
    }>;
    updateReview(reviewId: number, userId: number, data: {
        rating?: number;
        comment?: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        rating: number;
        comment: string | null;
    }>;
    deleteReview(reviewId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        rating: number;
        comment: string | null;
    }>;
    getEventReviews(eventId: number): Promise<({
        user: {
            name: string | null;
            id: number;
            profileImg: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        rating: number;
        comment: string | null;
    })[]>;
    getOrganizerReviews(organizerId: number): Promise<({
        user: {
            name: string | null;
            id: number;
            profileImg: string | null;
        };
        event: {
            id: number;
            title: string;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        eventId: number;
        rating: number;
        comment: string | null;
    })[]>;
}
declare const _default: ReviewService;
export default _default;
//# sourceMappingURL=review.service.d.ts.map