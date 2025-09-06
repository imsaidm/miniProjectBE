"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = require("../config/prisma");
class ReviewService {
    async createReview(userId, eventId, data) {
        const attended = await (0, prisma_1.withRetry)(() => prisma_1.prisma.attendance.findFirst({ where: { eventId, userId } }));
        if (!attended)
            throw { status: 403, message: 'Only attendees can review' };
        return (0, prisma_1.withRetry)(() => prisma_1.prisma.review.create({
            data: {
                eventId,
                userId,
                rating: data.rating,
                comment: data.comment ?? null
            }
        }));
    }
    async updateReview(reviewId, userId, data) {
        const review = await (0, prisma_1.withRetry)(() => prisma_1.prisma.review.findUnique({ where: { id: reviewId } }));
        if (!review || review.userId !== userId)
            throw { status: 403, message: 'Forbidden' };
        return (0, prisma_1.withRetry)(() => prisma_1.prisma.review.update({ where: { id: reviewId }, data }));
    }
    async deleteReview(reviewId, userId) {
        const review = await (0, prisma_1.withRetry)(() => prisma_1.prisma.review.findUnique({ where: { id: reviewId } }));
        if (!review || review.userId !== userId)
            throw { status: 403, message: 'Forbidden' };
        return (0, prisma_1.withRetry)(() => prisma_1.prisma.review.delete({ where: { id: reviewId } }));
    }
    async getEventReviews(eventId) {
        return (0, prisma_1.withRetry)(() => prisma_1.prisma.review.findMany({
            where: { eventId },
            include: { user: { select: { id: true, name: true, profileImg: true } } },
            orderBy: { createdAt: 'desc' }
        }));
    }
    async getOrganizerReviews(organizerId) {
        return (0, prisma_1.withRetry)(() => prisma_1.prisma.review.findMany({
            where: { event: { organizerId } },
            include: { user: { select: { id: true, name: true, profileImg: true } }, event: { select: { id: true, title: true } } },
            orderBy: { createdAt: 'desc' }
        }));
    }
}
exports.ReviewService = ReviewService;
exports.default = new ReviewService();
//# sourceMappingURL=review.service.js.map