import { Router } from 'express';
import multer from 'multer';
import EventController from '../controllers/event.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = Router();
const upload = multer();

// public discovery
router.get('/', EventController.listEvents);

// organizer-only actions
router.get('/my', tokenMiddleware, verifyRole('ORGANIZER'), EventController.getOrganizerEvents);
router.post('/', tokenMiddleware, verifyRole('ORGANIZER'), upload.single('bannerImage'), EventController.createEvent);

// event details (must be after /my to avoid conflicts)
router.get('/:eventId', EventController.getEventDetails);
router.patch('/:eventId', tokenMiddleware, verifyRole('ORGANIZER'), upload.single('bannerImage'), EventController.updateEvent);
router.delete('/:eventId', tokenMiddleware, verifyRole('ORGANIZER'), EventController.deleteEvent);
router.post('/:eventId/ticket-types', tokenMiddleware, verifyRole('ORGANIZER'), EventController.createTicketType);
router.patch('/ticket-types/:ticketTypeId', tokenMiddleware, verifyRole('ORGANIZER'), EventController.updateTicketType);
router.delete('/ticket-types/:ticketTypeId', tokenMiddleware, verifyRole('ORGANIZER'), EventController.deleteTicketType);

export default router;
