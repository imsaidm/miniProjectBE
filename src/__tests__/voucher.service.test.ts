import voucherService from '../service/voucher.service';

jest.mock('../config/prisma', () => {
  return {
    prisma: {
      voucher: {
        findFirst: jest.fn(),
      },
    },
  };
});

const { prisma } = require('../config/prisma');

describe('VoucherService.validateVoucher', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns voucher when valid for event and date', async () => {
    const now = new Date();
    prisma.voucher.findFirst.mockResolvedValue({ id: 1, code: 'ABC', eventId: 5, isActive: true, startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + 1000) });
    const res = await voucherService.validateVoucher('ABC', 5, 10 as any);
    expect(res).toHaveProperty('id', 1);
    expect(prisma.voucher.findFirst).toHaveBeenCalled();
  });

  test('throws when voucher not valid', async () => {
    prisma.voucher.findFirst.mockResolvedValue(null);
    await expect(voucherService.validateVoucher('ZZZ', 1, 2 as any)).rejects.toHaveProperty('status', 404);
  });
});


