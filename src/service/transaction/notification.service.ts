import { prisma } from '../../config/prisma';
import { sendEmail } from '../../config/mailer';

export class NotificationService {
  async createEmailNotification(userId: number, type: 'TRANSACTION_ACCEPTED' | 'TRANSACTION_REJECTED', subject: string, body: string) {
    try {
      const created = await prisma.emailNotification.create({ 
        data: { 
          toUserId: userId, 
          type, 
          subject, 
          body, 
          status: 'PENDING' 
        } 
      });

      // Attempt immediate send to avoid waiting for scheduler
      try {
        await this.sendEmailNotification(created.id);
      } catch (err) {
        // If immediate send fails, scheduler will retry later
        // eslint-disable-next-line no-console
        console.warn('Immediate email send failed; will retry via scheduler.', err);
      }
    } catch (error) {
      console.error('Error creating email notification:', error);
      // Don't fail the main operation if notification fails
    }
  }

  async sendEmailNotification(notificationId: number) {
    try {
      const notification = await prisma.emailNotification.findUnique({
        where: { id: notificationId },
        include: { toUser: { select: { email: true, name: true } } }
      });

      if (!notification || notification.status !== 'PENDING') {
        return;
      }

      const emailSent = await sendEmail({
        to: notification.toUser.email,
        subject: notification.subject,
        html: notification.body,
        text: notification.body.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      });

      await prisma.emailNotification.update({
        where: { id: notificationId },
        data: { 
          status: emailSent.delivered ? 'SENT' : 'FAILED',
          sentAt: emailSent.delivered ? new Date() : null
        }
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
      await prisma.emailNotification.update({
        where: { id: notificationId },
        data: { status: 'FAILED' }
      });
    }
  }

  async notifyTransactionAccepted(transaction: any) {
    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { email: true, name: true }
    });

    const event = await prisma.event.findUnique({
      where: { id: transaction.eventId },
      select: { title: true }
    });

    const subject = '🎉 Payment Accepted - Your Event Ticket is Confirmed!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Payment Accepted!</h2>
        <p>Hi ${user?.name || 'there'},</p>
        <p>Great news! Your payment for <strong>${event?.title}</strong> has been accepted by the organizer.</p>
        <p>Your transaction details:</p>
        <ul>
          <li>Transaction ID: #${transaction.id}</li>
          <li>Event: ${event?.title}</li>
          <li>Total Paid: IDR ${transaction.totalPayableIDR.toLocaleString('id-ID')}</li>
        </ul>
        <p>You're all set! Enjoy your event!</p>
        <p>Best regards,<br>EventHub Team</p>
      </div>
    `;

    await this.createEmailNotification(transaction.userId, 'TRANSACTION_ACCEPTED', subject, html);
  }

  async notifyTransactionRejected(transaction: any) {
    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { email: true, name: true }
    });

    const event = await prisma.event.findUnique({
      where: { id: transaction.eventId },
      select: { title: true }
    });

    const subject = '❌ Payment Rejected - Action Required';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Payment Rejected</h2>
        <p>Hi ${user?.name || 'there'},</p>
        <p>Unfortunately, your payment for <strong>${event?.title}</strong> was rejected by the organizer.</p>
        <p>Transaction details:</p>
        <ul>
          <li>Transaction ID: #${transaction.id}</li>
          <li>Event: ${event?.title}</li>
          <li>Amount: IDR ${transaction.totalPayableIDR.toLocaleString('id-ID')}</li>
        </ul>
        <p>Your points, vouchers, and coupons have been automatically refunded to your account.</p>
        <p>If you believe this was an error, please contact the event organizer.</p>
        <p>Best regards,<br>EventHub Team</p>
      </div>
    `;

    await this.createEmailNotification(transaction.userId, 'TRANSACTION_REJECTED', subject, html);
  }
}

export default new NotificationService();
