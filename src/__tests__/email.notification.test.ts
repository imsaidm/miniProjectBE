import { prisma } from '../config/prisma';
import { NotificationService } from '../service/transaction/notification.service';

// Mock the email sending function
jest.mock('../config/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue({ delivered: true, info: { messageId: 'test-message-id' } })
}));

const notificationService = new NotificationService();
const { sendEmail } = require('../config/mailer');

describe('Email Notification Tests', () => {
  let testUser: any;
  let testEvent: any;
  let testTransaction: any;

  beforeAll(async () => {
    // Clean up test data
    await prisma.emailNotification.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'CUSTOMER',
        referralCode: 'TEST123',
        isVerified: true
      }
    });

    // Create test event
    testEvent = await prisma.event.create({
      data: {
        organizerId: testUser.id,
        title: 'Test Event',
        description: 'A test event',
        location: 'Test Location',
        category: 'TECH',
        status: 'PUBLISHED',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
        basePriceIDR: 100000,
        totalSeats: 100,
        availableSeats: 100
      }
    });

    // Create test transaction
    testTransaction = await prisma.transaction.create({
      data: {
        userId: testUser.id,
        eventId: testEvent.id,
        status: 'WAITING_ADMIN_CONFIRMATION',
        paymentDueAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        subtotalIDR: 100000,
        discountVoucherIDR: 0,
        discountCouponIDR: 0,
        pointsUsed: 0,
        totalPayableIDR: 100000
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.emailNotification.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    jest.clearAllMocks();
  });

  test('should create email notification correctly', async () => {
    const notification = await notificationService.createEmailNotification(
      testUser.id,
      'TRANSACTION_ACCEPTED',
      'Test Subject',
      'Test Body'
    );

    expect(notification).toBeDefined();
    expect(notification.toUserId).toBe(testUser.id);
    expect(notification.type).toBe('TRANSACTION_ACCEPTED');
    expect(notification.subject).toBe('Test Subject');
    expect(notification.body).toBe('Test Body');
    expect(notification.status).toBe('PENDING');
  });

  test('should send email notification successfully', async () => {
    // Create a notification first
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: testUser.id,
        type: 'TRANSACTION_ACCEPTED',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'PENDING'
      }
    });

    // Send the notification
    await notificationService.sendEmailNotification(notification.id);

    // Check that sendEmail was called
    expect(sendEmail).toHaveBeenCalledWith({
      to: testUser.email,
      subject: 'Test Subject',
      html: 'Test Body',
      text: 'Test Body'
    });

    // Check that notification status was updated
    const updatedNotification = await prisma.emailNotification.findUnique({
      where: { id: notification.id }
    });

    expect(updatedNotification?.status).toBe('SENT');
    expect(updatedNotification?.sentAt).toBeDefined();
  });

  test('should handle email sending failure gracefully', async () => {
    // Mock sendEmail to fail
    sendEmail.mockResolvedValueOnce({ delivered: false });

    // Create a notification
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: testUser.id,
        type: 'TRANSACTION_ACCEPTED',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'PENDING'
      }
    });

    // Send the notification
    await notificationService.sendEmailNotification(notification.id);

    // Check that notification status was updated to FAILED
    const updatedNotification = await prisma.emailNotification.findUnique({
      where: { id: notification.id }
    });

    expect(updatedNotification?.status).toBe('FAILED');
    expect(updatedNotification?.sentAt).toBeNull();
  });

  test('should notify transaction acceptance with proper email content', async () => {
    await notificationService.notifyTransactionAccepted(testTransaction);

    // Check that notification was created
    const notifications = await prisma.emailNotification.findMany({
      where: { toUserId: testUser.id }
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('TRANSACTION_ACCEPTED');
    expect(notifications[0].subject).toContain('Payment Accepted');
    expect(notifications[0].body).toContain('Test Event');
    expect(notifications[0].body).toContain('IDR 100,000');
  });

  test('should notify transaction rejection with proper email content', async () => {
    await notificationService.notifyTransactionRejected(testTransaction);

    // Check that notification was created
    const notifications = await prisma.emailNotification.findMany({
      where: { toUserId: testUser.id }
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('TRANSACTION_REJECTED');
    expect(notifications[0].subject).toContain('Payment Rejected');
    expect(notifications[0].body).toContain('Test Event');
    expect(notifications[0].body).toContain('IDR 100,000');
    expect(notifications[0].body).toContain('refunded');
  });

  test('should not send notification for non-pending status', async () => {
    // Create a notification with SENT status
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: testUser.id,
        type: 'TRANSACTION_ACCEPTED',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'SENT'
      }
    });

    // Try to send the notification
    await notificationService.sendEmailNotification(notification.id);

    // Check that sendEmail was not called
    expect(sendEmail).not.toHaveBeenCalled();
  });

  test('should handle missing user gracefully', async () => {
    // Create a notification with non-existent user
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: 99999, // Non-existent user ID
        type: 'TRANSACTION_ACCEPTED',
        subject: 'Test Subject',
        body: 'Test Body',
        status: 'PENDING'
      }
    });

    // Try to send the notification
    await notificationService.sendEmailNotification(notification.id);

    // Check that notification status was updated to FAILED
    const updatedNotification = await prisma.emailNotification.findUnique({
      where: { id: notification.id }
    });

    expect(updatedNotification?.status).toBe('FAILED');
  });
});
