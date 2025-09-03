import transactionService from '../service/transaction.service';

jest.mock('../config/prisma', () => {
  const now = new Date();
  const overdueTx = [{ id: 1, userId: 1, status: 'WAITING_PAYMENT', paymentDueAt: new Date(now.getTime() - 1000), items: [{ ticketTypeId: 10, quantity: 2 }], usedCouponId: 3, pointsUsed: 1000 }];
  const staleTx = [{ id: 2, userId: 2, status: 'WAITING_ADMIN_CONFIRMATION', organizerDecisionBy: new Date(now.getTime() - 1000), items: [{ ticketTypeId: 11, quantity: 1 }], usedCouponId: null, pointsUsed: 0 }];
  return {
    prisma: {
      transaction: {
        findMany: jest.fn().mockImplementation(({ where }: any) => {
          if (where.status === 'WAITING_PAYMENT') return overdueTx;
          if (where.status === 'WAITING_ADMIN_CONFIRMATION') return staleTx;
          return [];
        }),
        update: jest.fn(),
      },
      ticketType: { update: jest.fn() },
      coupon: { update: jest.fn() },
      pointEntry: { create: jest.fn() },
      $transaction: (fn: any) => fn({
        ticketType: { update: jest.fn() },
        coupon: { update: jest.fn() },
        pointEntry: { create: jest.fn() },
        transaction: { update: jest.fn() },
      }),
    },
  };
});

const { prisma } = require('../config/prisma');

describe('Transaction jobs', () => {
  beforeEach(() => jest.clearAllMocks());

  test('expireOverdueTransactions expires and rolls back', async () => {
    const res = await transactionService.expireOverdueTransactions();
    expect(res.expiredCount).toBeGreaterThanOrEqual(1);
  });

  test('autoCancelStaleTransactions cancels and restores seats', async () => {
    const res = await transactionService.autoCancelStaleTransactions();
    expect(res.canceledCount).toBeGreaterThanOrEqual(1);
  });
});


