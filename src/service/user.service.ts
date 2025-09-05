import { prisma, withRetry } from '../config/prisma';

export class UserService {
  async getProfile(userId: number) {
    // Get user profile with referrer information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        profileImg: true, 
        role: true, 
        isVerified: true, 
        referralCode: true,
        referredByCode: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Get referrer information if user was referred
    let referrerInfo = null;
    if (user.referredByCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: user.referredByCode },
        select: { id: true, name: true, email: true, role: true }
      });
      if (referrer) {
        referrerInfo = {
          name: referrer.name,
          email: referrer.email,
          role: referrer.role
        };
      }
    }

    // Calculate current points balance (only non-expired points)
    const now = new Date();
    const points = await prisma.pointEntry.findMany({
      where: { 
        userId, 
        expiresAt: { gt: now } 
      },
      select: { delta: true }
    });
    
    const pointsBalance = points.reduce((sum, p) => sum + p.delta, 0);

    // Calculate organizer rating if user is an organizer
    let organizerRating = 0;
    let organizerReviewCount = 0;
    
    if (user.role === 'ORGANIZER') {
      const organizerReviews = await withRetry(() => 
        prisma.review.findMany({
          where: { event: { organizerId: userId } },
          select: { rating: true }
        })
      );
      
      organizerRating = organizerReviews.length > 0 
        ? organizerReviews.reduce((sum, review) => sum + review.rating, 0) / organizerReviews.length 
        : 0;
      organizerReviewCount = organizerReviews.length;
    }

    return {
      ...user,
      pointsBalance,
      referrerInfo,
      organizerRating,
      organizerReviewCount
    };
  }

  async updateProfile(userId: number, data: any) {
    const { name, profileImg } = data;
    return prisma.user.update({
      where: { id: userId },
      data: { name, profileImg }
    });
  }

  async getPoints(userId: number) {
    const now = new Date();
    const points = await prisma.pointEntry.findMany({
      where: { userId, expiresAt: { gt: now } },
      select: { delta: true, expiresAt: true, createdAt: true, source: true }
    });
    const balance = points.reduce((sum, p) => sum + p.delta, 0);
    return { balance, details: points };
  }

  async getCoupons(userId: number) {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: { userId, isUsed: false, expiresAt: { gt: now } },
      select: { id: true, code: true, discountType: true, discountValue: true, expiresAt: true }
    });
    return { coupons };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw { status: 400, message: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password changed successfully' };
  }
}

export default new UserService();
