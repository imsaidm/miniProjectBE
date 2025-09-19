"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../config/prisma");
class UserService {
    async getProfile(userId) {
        // Optimized: Use single query with includes instead of multiple queries
        const user = await prisma_1.prisma.user.findUnique({
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
                pointsBalance: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        // Execute all queries in parallel for better performance
        const [referrerInfo, pointsBalance, organizerStats] = await Promise.all([
            this.getReferrerInfo(user.referredByCode),
            this.calculatePointsBalance(userId, user.pointsBalance),
            user.role === 'ORGANIZER' ? this.getOrganizerStats(userId) : Promise.resolve({ rating: 0, reviewCount: 0 })
        ]);
        return {
            ...user,
            pointsBalance,
            referrerInfo,
            organizerRating: organizerStats.rating,
            organizerReviewCount: organizerStats.reviewCount
        };
    }
    async getReferrerInfo(referredByCode) {
        if (!referredByCode)
            return null;
        const referrer = await prisma_1.prisma.user.findUnique({
            where: { referralCode: referredByCode },
            select: { id: true, name: true, email: true, role: true }
        });
        return referrer ? {
            name: referrer.name,
            email: referrer.email,
            role: referrer.role
        } : null;
    }
    async calculatePointsBalance(userId, storedBalance) {
        const now = new Date();
        const points = await prisma_1.prisma.pointEntry.findMany({
            where: {
                userId,
                expiresAt: { gt: now }
            },
            select: { delta: true }
        });
        const calculatedBalance = points.reduce((sum, p) => sum + p.delta, 0);
        // Only update if there's a significant mismatch to avoid unnecessary writes
        if (Math.abs(calculatedBalance - (storedBalance || 0)) > 0) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { pointsBalance: calculatedBalance }
            });
        }
        return calculatedBalance;
    }
    async getOrganizerStats(organizerId) {
        const reviews = await prisma_1.prisma.review.findMany({
            where: { event: { organizerId } },
            select: { rating: true }
        });
        const rating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        return { rating, reviewCount: reviews.length };
    }
    async updateProfile(userId, data) {
        const { name, profileImg } = data;
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data: { name, profileImg }
        });
    }
    async getPoints(userId) {
        const now = new Date();
        const points = await prisma_1.prisma.pointEntry.findMany({
            where: { userId, expiresAt: { gt: now } },
            select: { delta: true, expiresAt: true, createdAt: true, source: true }
        });
        // Calculate balance from PointEntry records (this is the authoritative source)
        const calculatedBalance = points.reduce((sum, p) => sum + p.delta, 0);
        // Get the stored balance from user table
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { pointsBalance: true }
        });
        const storedBalance = user?.pointsBalance || 0;
        // If there's a mismatch, update the stored balance
        if (calculatedBalance !== storedBalance) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { pointsBalance: calculatedBalance }
            });
        }
        return { balance: calculatedBalance, details: points };
    }
    async getCoupons(userId) {
        const now = new Date();
        const coupons = await prisma_1.prisma.coupon.findMany({
            where: { userId, isUsed: false, expiresAt: { gt: now } },
            select: { id: true, code: true, discountType: true, discountValue: true, expiresAt: true }
        });
        return { coupons };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
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
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        return { message: 'Password changed successfully' };
    }
}
exports.UserService = UserService;
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map