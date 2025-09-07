"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherService = void 0;
const prisma_1 = require("../config/prisma");
class VoucherService {
    async createVoucher(organizerId, eventId, data) {
        return prisma_1.prisma.voucher.create({
            data: {
                ...data,
                organizerId,
                eventId,
                isActive: true,
                usedCount: 0,
            }
        });
    }
    async updateVoucher(organizerId, voucherId, data) {
        const voucher = await prisma_1.prisma.voucher.findUnique({ where: { id: voucherId } });
        if (!voucher || voucher.organizerId !== organizerId)
            throw { status: 403, message: 'Forbidden' };
        return prisma_1.prisma.voucher.update({ where: { id: voucherId }, data });
    }
    async deleteVoucher(organizerId, voucherId) {
        const voucher = await prisma_1.prisma.voucher.findUnique({ where: { id: voucherId } });
        if (!voucher || voucher.organizerId !== organizerId)
            throw { status: 403, message: 'Forbidden' };
        return prisma_1.prisma.voucher.delete({ where: { id: voucherId } });
    }
    async listVouchers(organizerId, eventId) {
        return prisma_1.prisma.voucher.findMany({
            where: {
                organizerId,
                ...(eventId && { eventId })
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async validateVoucher(code, eventId, userId) {
        const voucher = await prisma_1.prisma.voucher.findFirst({
            where: { code, eventId, isActive: true, startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
        });
        if (!voucher)
            throw { status: 404, message: 'Voucher not valid for this event/date' };
        return voucher;
    }
}
exports.VoucherService = VoucherService;
exports.default = new VoucherService();
//# sourceMappingURL=voucher.service.js.map