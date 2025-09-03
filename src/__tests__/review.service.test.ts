import reviewService from '../service/review.service';

jest.mock('../config/prisma', () => {
  return {
    prisma: {
      attendance: { findFirst: jest.fn() },
      review: { create: jest.fn() },
    },
  };
});

const { prisma } = require('../config/prisma');

describe('ReviewService.createReview', () => {
  beforeEach(() => jest.clearAllMocks());

  test('throws if not attended', async () => {
    prisma.attendance.findFirst.mockResolvedValue(null);
    await expect(reviewService.createReview(1, 2, { rating: 5 })).rejects.toHaveProperty('status', 403);
  });

  test('creates when attended', async () => {
    prisma.attendance.findFirst.mockResolvedValue({ id: 1 });
    prisma.review.create.mockResolvedValue({ id: 9 });
    const res = await reviewService.createReview(1, 2, { rating: 4, comment: 'Nice' });
    expect(res).toHaveProperty('id', 9);
  });
});


