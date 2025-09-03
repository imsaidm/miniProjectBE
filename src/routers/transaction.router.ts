import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';
import upload from '../middleware/multer';

const router = Router();

router.post('/', tokenMiddleware, verifyRole('CUSTOMER'), TransactionController.createTransaction);
router.post('/:transactionId/payment-proof', tokenMiddleware, verifyRole('CUSTOMER'), upload.single('paymentProof'), TransactionController.uploadPaymentProof);
router.patch('/:transactionId/accept', tokenMiddleware, verifyRole('ORGANIZER'), TransactionController.acceptTransaction);
router.patch('/:transactionId/reject', tokenMiddleware, verifyRole('ORGANIZER'), TransactionController.rejectTransaction);
router.patch('/:transactionId/cancel', tokenMiddleware, verifyRole('CUSTOMER'), TransactionController.cancelTransaction);
router.get('/my', tokenMiddleware, verifyRole('CUSTOMER'), TransactionController.getUserTransactions);
router.get('/organizer', tokenMiddleware, verifyRole('ORGANIZER'), TransactionController.getOrganizerTransactions);
router.get('/:transactionId', tokenMiddleware, TransactionController.getTransactionDetails);
router.get('/event/:eventId/attendees', tokenMiddleware, verifyRole('ORGANIZER'), TransactionController.getAttendeeList);

export default router;
