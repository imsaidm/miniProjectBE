import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    sendNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
    listUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: NotificationController;
export default _default;
//# sourceMappingURL=notification.controller.d.ts.map