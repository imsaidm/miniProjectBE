import { Request, Response, NextFunction } from 'express';
import NotificationService from '../service/notification.service';

export class NotificationController {
    async sendNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const notif = await NotificationService.sendNotification(req.body);
            res.status(200).json(notif);
        } catch (err) { next(err); }
    }
    async listUserNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const notifs = await NotificationService.listUserNotifications(userId);
            res.status(200).json(notifs);
        } catch (err) { next(err); }
    }
}

export default new NotificationController();
