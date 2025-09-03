import { prisma } from '../config/prisma';

export class VoucherService {
  async createVoucher(organizerId: number, eventId: number, data: any) {
    return prisma.voucher.create({
      data: {
        ...data,
        organizerId,
        eventId,
        isActive: true,
        usedCount: 0,
      }
    });
  }

  async updateVoucher(organizerId: number, voucherId: number, data: any) {
    const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher || voucher.organizerId !== organizerId) throw { status: 403, message: 'Forbidden' };
    return prisma.voucher.update({ where: { id: voucherId }, data });
  }

  async deleteVoucher(organizerId: number, voucherId: number) {
    const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher || voucher.organizerId !== organizerId) throw { status: 403, message: 'Forbidden' };
    return prisma.voucher.delete({ where: { id: voucherId } });
  }

  async listVouchers(organizerId: number, eventId?: number) {
    return prisma.voucher.findMany({
      where: {
        organizerId,
        ...(eventId && { eventId })
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async validateVoucher(code: string, eventId: number, userId: number) {
    const voucher = await prisma.voucher.findFirst({
      where: { code, eventId, isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    });
    if (!voucher) throw { status: 404, message: 'Voucher not valid for this event/date' };
    return voucher;
  }
}

export default new VoucherService();
