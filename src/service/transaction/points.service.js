"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const prisma_1 = require("../../config/prisma");
class PointsService {
    async updateUserPointsBalance(userId) {
        const now = new Date();
        const points = await prisma_1.prisma.pointEntry.findMany({
            where: {
                userId,
                expiresAt: { gt: now }
            },
            select: { delta: true }
        });
        const balance = points.reduce((sum, p) => sum + p.delta, 0);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { pointsBalance: balance }
        });
        return balance;
    }
    async validateAndUsePoints(userId, pointsUsed, tx) {
        if (!pointsUsed || pointsUsed <= 0)
            return 0;
        const points = await tx.pointEntry.findMany({
            where: { userId, expiresAt: { gt: new Date() } }
        });
        const usablePoints = points.reduce((sum, p) => sum + p.delta, 0);
        if (pointsUsed > usablePoints) {
            throw new Error('Not enough points');
        }
        await tx.pointEntry.create({
            data: { userId, delta: -pointsUsed, source: 'PURCHASE_REDEEM' }
        });
        await tx.user.update({
            where: { id: userId },
            data: { pointsBalance: { decrement: pointsUsed } }
        });
        return pointsUsed;
    }
    async refundPoints(userId, pointsUsed, tx) {
        if (!pointsUsed || pointsUsed <= 0)
            return;
        await tx.pointEntry.create({
            data: { userId, delta: pointsUsed, source: 'ROLLBACK' }
        });
        await tx.user.update({
            where: { id: userId },
            data: { pointsBalance: { increment: pointsUsed } }
        });
    }
}
exports.PointsService = PointsService;
exports.default = new PointsService();
//# sourceMappingURL=points.service.js.map