import { Request, Response, NextFunction } from 'express';
import CouponService from '../service/coupon.service';

export class CouponController {
    async getUserCoupons(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const coupons = await CouponService.getUserCoupons(userId);
            res.status(200).json(coupons);
        } catch (err) { next(err); }
    }
    async validateCoupon(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { code, transactionId } = req.body;
            const coupon = await CouponService.validateCoupon(code, userId, transactionId);
            res.status(200).json(coupon);
        } catch (err) { next(err); }
    }
}

export default new CouponController();
