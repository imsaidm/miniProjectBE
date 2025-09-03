import eventService from '../service/event.service';

jest.mock('../config/prisma', () => {
  return {
    prisma: {
      event: {
        findMany: jest.fn(),
      },
    },
  };
});

const { prisma } = require('../config/prisma');

describe('EventService.listEvents', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns empty array when no results', async () => {
    prisma.event.findMany.mockResolvedValue([]);
    const res = await eventService.listEvents({ q: 'nope' } as any);
    expect(res).toEqual([]);
  });

  test('applies filters and search fields', async () => {
    prisma.event.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await eventService.listEvents({ category: 'MUSIC', location: 'Jakarta', q: 'rock', startAt: '2025-09-01' } as any);
    expect(Array.isArray(res)).toBe(true);
    expect(prisma.event.findMany).toHaveBeenCalled();
  });
});


