"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../config/prisma");
class NotificationService {
    async sendNotification(payload) {
        return prisma_1.prisma.emailNotification.create({
            data: {
                toUserId: payload.toUserId,
                type: payload.type,
                subject: payload.subject,
                body: payload.body,
                status: 'PENDING',
            }
        });
    }
    async listUserNotifications(userId) {
        return prisma_1.prisma.emailNotification.findMany({
            where: { toUserId: userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.NotificationService = NotificationService;
exports.default = new NotificationService();
//# sourceMappingURL=notification.service.js.map