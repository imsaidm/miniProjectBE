export declare class NotificationService {
    createEmailNotification(userId: number, type: 'TRANSACTION_ACCEPTED' | 'TRANSACTION_REJECTED', subject: string, body: string): Promise<void>;
    sendEmailNotification(notificationId: number): Promise<void>;
    notifyTransactionAccepted(transaction: any): Promise<void>;
    notifyTransactionRejected(transaction: any): Promise<void>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map