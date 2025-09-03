import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';

const router = Router();

router.post('/', NotificationController.sendNotification);
router.get('/', NotificationController.listUserNotifications);

export default router;
