"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherController = void 0;
const voucher_service_1 = __importDefault(require("../service/voucher.service"));
class VoucherController {
    async createVoucher(req, res, next) {
        try {
            const organizerId = req.user.id;
            const eventId = req.body.eventId;
            const voucher = await voucher_service_1.default.createVoucher(organizerId, eventId, req.body);
            res.status(201).json(voucher);
        }
        catch (err) {
            next(err);
        }
    }
    async updateVoucher(req, res, next) {
        try {
            const organizerId = req.user.id;
            const voucherId = parseInt(req.params.voucherId || '0');
            const voucher = await voucher_service_1.default.updateVoucher(organizerId, voucherId, req.body);
            res.status(200).json(voucher);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteVoucher(req, res, next) {
        try {
            const organizerId = req.user.id;
            const voucherId = parseInt(req.params.voucherId || '0');
            const voucher = await voucher_service_1.default.deleteVoucher(organizerId, voucherId);
            res.status(200).json(voucher);
        }
        catch (err) {
            next(err);
        }
    }
    async listVouchers(req, res, next) {
        try {
            const organizerId = req.user.id;
            const eventId = req.query.eventId ? parseInt(req.query.eventId) : undefined;
            const vouchers = await voucher_service_1.default.listVouchers(organizerId, eventId);
            res.status(200).json(vouchers);
        }
        catch (err) {
            next(err);
        }
    }
    async validateVoucher(req, res, next) {
        try {
            const { code, eventId } = req.body;
            const userId = req.user?.id || undefined;
            const voucher = await voucher_service_1.default.validateVoucher(code, eventId, userId);
            res.status(200).json(voucher);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VoucherController = VoucherController;
exports.default = new VoucherController();
//# sourceMappingURL=voucher.controller.js.map