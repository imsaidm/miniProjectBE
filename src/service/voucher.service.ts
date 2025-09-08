import { prisma } from '../config/prisma';

export class VoucherService {
  async createVoucher(organizerId: number, eventId: number, data: any) {
    // Validate that the organizer owns the event
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: { organizerId: true }
    });
    if (!event || event.organizerId !== organizerId) {
      throw { status: 403, message: 'Forbidden: You do not own this event' };
    }

    // Coerce and validate incoming fields
    const code: string = (data.code || '').toString().trim();
    if (!code) {
      throw { status: 400, message: 'Voucher code is required' };
    }

    const discountType = (data.discountType || 'AMOUNT').toString().toUpperCase();
    const discountValue = Number(data.discountValue ?? 0);
    const maxUses = data.maxUses !== undefined && data.maxUses !== null && data.maxUses !== ''
      ? Number(data.maxUses)
      : null;
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (isNaN(discountValue) || discountValue <= 0) {
      throw { status: 400, message: 'discountValue must be a positive number' };
    }
    if (maxUses !== null && (isNaN(maxUses) || maxUses < 0)) {
      throw { status: 400, message: 'maxUses must be a non-negative number' };
    }
    if (!(startsAt instanceof Date) || isNaN(startsAt.getTime())) {
      throw { status: 400, message: 'startsAt must be a valid date' };
    }
    if (!(endsAt instanceof Date) || isNaN(endsAt.getTime())) {
      throw { status: 400, message: 'endsAt must be a valid date' };
    }
    if (endsAt <= startsAt) {
      throw { status: 400, message: 'endsAt must be after startsAt' };
    }

    return prisma.voucher.create({
      data: {
        code,
        organizerId,
        eventId: Number(eventId),
        discountType: discountType as any,
        discountValue,
        startsAt,
        endsAt,
        maxUses,
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
    const normalized = (code || '').trim();
    const variants = [normalized, normalized.toUpperCase(), normalized.toLowerCase()];
    const voucher = await prisma.voucher.findFirst({
      where: {
        eventId: Number(eventId),
        isActive: true,
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
        OR: variants.map((v) => ({ code: v }))
      },
    });
    if (!voucher) throw { status: 404, message: 'Voucher not valid for this event/date' };
    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
      throw { status: 400, message: 'Voucher usage limit reached' };
    }
    return voucher;
  }
}

export default new VoucherService();
