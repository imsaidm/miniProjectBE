import { prisma } from '../config/prisma';
import { TransactionService } from '../service/transaction.service';

const transactionService = new TransactionService();

describe('Points Expiration Tests', () => {
  let testUser: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.pointEntry.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'CUSTOMER',
        referralCode: 'TEST123',
        isVerified: true,
        pointsBalance: 0
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.pointEntry.deleteMany();
    await prisma.user.deleteMany();
  });

  test('should clean up expired points correctly', async () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000); // 4 months ago (expired)
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from now (not expired)

    // Create expired points
    await prisma.pointEntry.create({
      data: {
        userId: testUser.id,
        delta: 5000,
        source: 'REFERRAL_REWARD',
        expiresAt: pastDate
      }
    });

    // Create non-expired points
    await prisma.pointEntry.create({
      data: {
        userId: testUser.id,
        delta: 3000,
        source: 'REFERRAL_REWARD',
        expiresAt: futureDate
      }
    });

    // Update user's points balance
    await prisma.user.update({
      where: { id: testUser.id },
      data: { pointsBalance: 8000 } // 5000 + 3000
    });

    // Run cleanup
    const result = await transactionService.cleanupExpiredPoints();

    // Check results
    expect(result.cleanedCount).toBe(1);

    // Check that expired points were cleaned up
    const remainingPoints = await prisma.pointEntry.findMany({
      where: { userId: testUser.id }
    });

    expect(remainingPoints).toHaveLength(2); // Both entries still exist
    expect(remainingPoints.find(p => p.expiresAt === pastDate)?.delta).toBe(0); // Expired points set to 0
    expect(remainingPoints.find(p => p.expiresAt === futureDate)?.delta).toBe(3000); // Non-expired points unchanged

    // Check user's updated points balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser?.pointsBalance).toBe(3000); // Only non-expired points remain
  });

  test('should handle multiple expired points for same user', async () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000);

    // Create multiple expired points
    await Promise.all([
      prisma.pointEntry.create({
        data: {
          userId: testUser.id,
          delta: 1000,
          source: 'REFERRAL_REWARD',
          expiresAt: pastDate
        }
      }),
      prisma.pointEntry.create({
        data: {
          userId: testUser.id,
          delta: 2000,
          source: 'REFERRAL_REWARD',
          expiresAt: pastDate
        }
      }),
      prisma.pointEntry.create({
        data: {
          userId: testUser.id,
          delta: 3000,
          source: 'REFERRAL_REWARD',
          expiresAt: pastDate
        }
      })
    ]);

    // Update user's points balance
    await prisma.user.update({
      where: { id: testUser.id },
      data: { pointsBalance: 6000 } // 1000 + 2000 + 3000
    });

    // Run cleanup
    const result = await transactionService.cleanupExpiredPoints();

    // Check results
    expect(result.cleanedCount).toBe(3);

    // Check user's updated points balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser?.pointsBalance).toBe(0); // All points were expired
  });

  test('should not affect non-expired points', async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create only non-expired points
    await prisma.pointEntry.create({
      data: {
        userId: testUser.id,
        delta: 5000,
        source: 'REFERRAL_REWARD',
        expiresAt: futureDate
      }
    });

    // Update user's points balance
    await prisma.user.update({
      where: { id: testUser.id },
      data: { pointsBalance: 5000 }
    });

    // Run cleanup
    const result = await transactionService.cleanupExpiredPoints();

    // Check results
    expect(result.cleanedCount).toBe(0);

    // Check that points remain unchanged
    const remainingPoints = await prisma.pointEntry.findMany({
      where: { userId: testUser.id }
    });

    expect(remainingPoints).toHaveLength(1);
    expect(remainingPoints[0].delta).toBe(5000);

    // Check user's points balance remains unchanged
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser?.pointsBalance).toBe(5000);
  });

  test('should handle negative point entries correctly', async () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 4 * 30 * 24 * 60 * 60 * 1000);

    // Create expired negative points (should not be cleaned)
    await prisma.pointEntry.create({
      data: {
        userId: testUser.id,
        delta: -1000,
        source: 'PURCHASE_REDEEM',
        expiresAt: pastDate
      }
    });

    // Create expired positive points (should be cleaned)
    await prisma.pointEntry.create({
      data: {
        userId: testUser.id,
        delta: 2000,
        source: 'REFERRAL_REWARD',
        expiresAt: pastDate
      }
    });

    // Update user's points balance
    await prisma.user.update({
      where: { id: testUser.id },
      data: { pointsBalance: 1000 } // -1000 + 2000
    });

    // Run cleanup
    const result = await transactionService.cleanupExpiredPoints();

    // Check results
    expect(result.cleanedCount).toBe(1);

    // Check that only positive expired points were cleaned
    const remainingPoints = await prisma.pointEntry.findMany({
      where: { userId: testUser.id }
    });

    expect(remainingPoints).toHaveLength(2);
    expect(remainingPoints.find(p => p.delta === -1000)?.delta).toBe(-1000); // Negative points unchanged
    expect(remainingPoints.find(p => p.delta === 2000)?.delta).toBe(0); // Positive expired points cleaned

    // Check user's updated points balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    expect(updatedUser?.pointsBalance).toBe(-1000); // Only negative points remain
  });
});
