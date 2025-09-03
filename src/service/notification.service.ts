import { prisma } from '../config/prisma';


export class NotificationService {
  async sendNotification(payload: {
    toUserId: number,
    type: import('../generated/prisma').$Enums.NotificationType,
    subject: string,
    body: string,
  }) {
    return prisma.emailNotification.create({
      data: {
        toUserId: payload.toUserId,
        type: payload.type,
        subject: payload.subject,
        body: payload.body,
        status: 'PENDING',
      }
    });
  }

  async listUserNotifications(userId: number) {
    return prisma.emailNotification.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new NotificationService();
