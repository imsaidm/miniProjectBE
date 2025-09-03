import { Router } from 'express';
import ReviewController from '../controllers/review.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = Router();

router.post('/', tokenMiddleware, verifyRole('CUSTOMER', 'ADMIN'), ReviewController.createReview);
router.patch('/:reviewId', tokenMiddleware, verifyRole('CUSTOMER', 'ADMIN'), ReviewController.updateReview);
router.delete('/:reviewId', tokenMiddleware, verifyRole('CUSTOMER', 'ADMIN'), ReviewController.deleteReview);
router.get('/event/:eventId', ReviewController.getEventReviews);
router.get('/organizer/:organizerId', ReviewController.getOrganizerReviews);

export default router;
