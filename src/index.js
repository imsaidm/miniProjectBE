"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const transaction_service_1 = __importDefault(require("./service/transaction.service"));
const notification_service_1 = __importDefault(require("./service/transaction/notification.service"));
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 4400;
app_1.default.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.DISABLE_SCHEDULER) {
        setInterval(() => {
            transaction_service_1.default.expireOverdueTransactions().catch(() => { });
            transaction_service_1.default.autoCancelStaleTransactions().catch(() => { });
            transaction_service_1.default.cleanupExpiredPoints().catch(() => { });
        }, 60 * 1000);
        // Process email notifications every 5 minutes
        setInterval(async () => {
            try {
                const pendingNotifications = await prisma_1.prisma.emailNotification.findMany({
                    where: { status: 'PENDING' },
                    select: { id: true }
                });
                for (const notification of pendingNotifications) {
                    await notification_service_1.default.sendEmailNotification(notification.id);
                }
            }
            catch (error) {
                console.error('Error processing email notifications:', error);
            }
        }, 5 * 60 * 1000);
    }
});
//# sourceMappingURL=index.js.map