import { Router } from 'express';
import CouponController from '../controllers/coupon.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = Router();

router.get('/', tokenMiddleware, verifyRole('CUSTOMER'), CouponController.getUserCoupons);
router.post('/validate', tokenMiddleware, verifyRole('CUSTOMER'), CouponController.validateCoupon);

export default router;
