export declare class NotificationService {
    sendNotification(payload: {
        toUserId: number;
        type: import('../generated/prisma').$Enums.NotificationType;
        subject: string;
        body: string;
    }): Promise<{
        createdAt: Date;
        id: number;
        status: import("../generated/prisma").$Enums.NotificationStatus;
        type: import("../generated/prisma").$Enums.NotificationType;
        subject: string;
        body: string;
        sentAt: Date | null;
        toUserId: number;
    }>;
    listUserNotifications(userId: number): Promise<{
        createdAt: Date;
        id: number;
        status: import("../generated/prisma").$Enums.NotificationStatus;
        type: import("../generated/prisma").$Enums.NotificationType;
        subject: string;
        body: string;
        sentAt: Date | null;
        toUserId: number;
    }[]>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map