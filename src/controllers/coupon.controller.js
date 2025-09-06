"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const coupon_service_1 = __importDefault(require("../service/coupon.service"));
class CouponController {
    async getUserCoupons(req, res, next) {
        try {
            const userId = req.user.id;
            const coupons = await coupon_service_1.default.getUserCoupons(userId);
            res.status(200).json(coupons);
        }
        catch (err) {
            next(err);
        }
    }
    async validateCoupon(req, res, next) {
        try {
            const userId = req.user.id;
            const { code, transactionId } = req.body;
            const coupon = await coupon_service_1.default.validateCoupon(code, userId, transactionId);
            res.status(200).json(coupon);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CouponController = CouponController;
exports.default = new CouponController();
//# sourceMappingURL=coupon.controller.js.map