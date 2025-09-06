"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = __importDefault(require("../service/notification.service"));
class NotificationController {
    async sendNotification(req, res, next) {
        try {
            const notif = await notification_service_1.default.sendNotification(req.body);
            res.status(200).json(notif);
        }
        catch (err) {
            next(err);
        }
    }
    async listUserNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const notifs = await notification_service_1.default.listUserNotifications(userId);
            res.status(200).json(notifs);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
//# sourceMappingURL=notification.controller.js.map