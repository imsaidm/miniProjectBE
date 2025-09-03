import { prisma } from '../../config/prisma';

export class PointsService {
  async updateUserPointsBalance(userId: number) {
    const now = new Date();
    const points = await prisma.pointEntry.findMany({
      where: { 
        userId, 
        expiresAt: { gt: now } 
      },
      select: { delta: true }
    });
    
    const balance = points.reduce((sum: number, p: { delta: number }) => sum + p.delta, 0);
    
    await prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: balance }
    });
    
    return balance;
  }

  async validateAndUsePoints(userId: number, pointsUsed: number, tx: any) {
    if (!pointsUsed || pointsUsed <= 0) return 0;

    const points = await tx.pointEntry.findMany({
      where: { userId, expiresAt: { gt: new Date() } }
    });
    
    const usablePoints = points.reduce((sum: number, p: { delta: number }) => sum + p.delta, 0);
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

  async refundPoints(userId: number, pointsUsed: number, tx: any) {
    if (!pointsUsed || pointsUsed <= 0) return;

    await tx.pointEntry.create({ 
      data: { userId, delta: pointsUsed, source: 'ROLLBACK' } 
    });
    
    await tx.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: pointsUsed } }
    });
  }
}

export default new PointsService();
