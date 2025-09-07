export declare class NotificationService {
    sendNotification(payload: {
        toUserId: number;
        type: import('../generated/prisma').$Enums.NotificationType;
        subject: string;
        body: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        status: import("../generated/prisma").$Enums.NotificationStatus;
        toUserId: number;
        type: import("../generated/prisma").$Enums.NotificationType;
        subject: string;
        body: string;
        sentAt: Date | null;
    }>;
    listUserNotifications(userId: number): Promise<{
        id: number;
        createdAt: Date;
        status: import("../generated/prisma").$Enums.NotificationStatus;
        toUserId: number;
        type: import("../generated/prisma").$Enums.NotificationType;
        subject: string;
        body: string;
        sentAt: Date | null;
    }[]>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map