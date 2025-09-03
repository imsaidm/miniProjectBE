import { Request, Response, NextFunction } from 'express';
import VoucherService from '../service/voucher.service';

export class VoucherController {
    async createVoucher(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventId = req.body.eventId;
            const voucher = await VoucherService.createVoucher(organizerId, eventId, req.body);
            res.status(201).json(voucher);
        } catch (err) { next(err); }
    }
    async updateVoucher(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const voucherId = parseInt(req.params.voucherId || '0');
            const voucher = await VoucherService.updateVoucher(organizerId, voucherId, req.body);
            res.status(200).json(voucher);
        } catch (err) { next(err); }
    }
    async deleteVoucher(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const voucherId = parseInt(req.params.voucherId || '0');
            const voucher = await VoucherService.deleteVoucher(organizerId, voucherId);
            res.status(200).json(voucher);
        } catch (err) { next(err); }
    }
    async listVouchers(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
            const vouchers = await VoucherService.listVouchers(organizerId, eventId);
            res.status(200).json(vouchers);
        } catch (err) { next(err); }
    }
    async validateVoucher(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, eventId } = req.body;
            const userId = (req as any).user?.id || undefined;
            const voucher = await VoucherService.validateVoucher(code, eventId, userId);
            res.status(200).json(voucher);
        } catch (err) { next(err); }
    }
}

export default new VoucherController();
