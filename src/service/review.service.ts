import { prisma, withRetry } from '../config/prisma';

export class ReviewService {
  async createReview(userId: number, eventId: number, data: { rating: number, comment?: string }) {
    const attended = await withRetry(() => 
      prisma.attendance.findFirst({ where: { eventId, userId } })
    );
    if (!attended) throw { status: 403, message: 'Only attendees can review' };
    
    return withRetry(() => prisma.review.create({
      data: {
        eventId,
        userId,
        rating: data.rating,
        comment: data.comment ?? null
      }
    }));
  }
  
  async updateReview(reviewId: number, userId: number, data: { rating?: number, comment?: string }) {
    const review = await withRetry(() => 
      prisma.review.findUnique({ where: { id: reviewId } })
    );
    if (!review || review.userId !== userId) throw { status: 403, message: 'Forbidden' };
    
    return withRetry(() => 
      prisma.review.update({ where: { id: reviewId }, data })
    );
  }
  
  async deleteReview(reviewId: number, userId: number) {
    const review = await withRetry(() => 
      prisma.review.findUnique({ where: { id: reviewId } })
    );
    if (!review || review.userId !== userId) throw { status: 403, message: 'Forbidden' };
    
    return withRetry(() => 
      prisma.review.delete({ where: { id: reviewId } })
    );
  }
  
  async getEventReviews(eventId: number) {
    return withRetry(() => prisma.review.findMany({
      where: { eventId },
      include: { user: { select: { id: true, name: true, profileImg: true } } },
      orderBy: { createdAt: 'desc' }
    }));
  }
  
  async getOrganizerReviews(organizerId: number) {
    return withRetry(() => prisma.review.findMany({
      where: { event: { organizerId } },
      include: { user: { select: { id: true, name: true, profileImg: true } }, event: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' }
    }));
  }
}

export default new ReviewService();
