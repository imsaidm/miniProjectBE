import { Router } from 'express';
import VoucherController from '../controllers/voucher.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = Router();

router.post('/', tokenMiddleware, verifyRole('ORGANIZER'), VoucherController.createVoucher);
router.patch('/:voucherId', tokenMiddleware, verifyRole('ORGANIZER'), VoucherController.updateVoucher);
router.delete('/:voucherId', tokenMiddleware, verifyRole('ORGANIZER'), VoucherController.deleteVoucher);
router.get('/', tokenMiddleware, verifyRole('ORGANIZER'), VoucherController.listVouchers);
router.post('/validate', tokenMiddleware, verifyRole('CUSTOMER'), VoucherController.validateVoucher);

export default router;
