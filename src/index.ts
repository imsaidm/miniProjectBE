import app from './app';
import transactionService from './service/transaction.service';
import notificationService from './service/transaction/notification.service';
import { prisma } from './config/prisma';

const PORT = process.env.PORT || 4400;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!process.env.DISABLE_SCHEDULER) {
    setInterval(() => {
      transactionService.expireOverdueTransactions().catch(() => {});
      transactionService.autoCancelStaleTransactions().catch(() => {});
      transactionService.cleanupExpiredPoints().catch(() => {});
    }, 60 * 1000);

    // Process email notifications every 5 minutes
    setInterval(async () => {
      try {
        const pendingNotifications = await prisma.emailNotification.findMany({
          where: { status: 'PENDING' },
          select: { id: true }
        });
        
        for (const notification of pendingNotifications) {
          await notificationService.sendEmailNotification(notification.id);
        }
      } catch (error) {
        console.error('Error processing email notifications:', error);
      }
    }, 5 * 60 * 1000);
  }
});
