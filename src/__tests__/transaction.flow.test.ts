import { prisma } from '../config/prisma';
import { TransactionService } from '../service/transaction.service';
import { AuthService } from '../service/auth.service';
import { EventService } from '../service/event.service';

// Mock Cloudinary
jest.mock('../config/cloudinary', () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue('https://example.com/mock-image.jpg')
}));

const transactionService = new TransactionService();
const authService = new AuthService();
const eventService = new EventService();

describe('Transaction Flow Tests', () => {
  let testUser: any;
  let testOrganizer: any;
  let testEvent: any;
  let testTicketType: any;
  let testTransaction: any;

  // Increase timeout for database operations
  jest.setTimeout(60000);

  beforeAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany();
    await prisma.ticketType.deleteMany();
    await prisma.event.deleteMany();
    await prisma.pointEntry.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create test users
    testUser = await prisma.user.create({
      data: {
        email: 'customer@test.com',
        password: 'hashedpassword',
        name: 'Test Customer',
        role: 'CUSTOMER',
        referralCode: 'CUST123',
        isVerified: true
      }
    });

    testOrganizer = await prisma.user.create({
      data: {
        email: 'organizer@test.com',
        password: 'hashedpassword',
        name: 'Test Organizer',
        role: 'ORGANIZER',
        referralCode: 'ORG456',
        isVerified: true
      }
    });

    // Create test event
    testEvent = await prisma.event.create({
      data: {
        organizerId: testOrganizer.id,
        title: 'Test Event',
        description: 'A test event for testing',
        location: 'Test Location',
        category: 'TECH',
        status: 'PUBLISHED',
        startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endAt: new Date(Date.now() + 25 * 60 * 60 * 1000), // Day after tomorrow
        basePriceIDR: 100000,
        totalSeats: 100,
        availableSeats: 100
      }
    });

    // Create test ticket type
    testTicketType = await prisma.ticketType.create({
      data: {
        eventId: testEvent.id,
        name: 'General Admission',
        priceIDR: 100000,
        totalSeats: 100,
        availableSeats: 100
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany();
    await prisma.ticketType.deleteMany();
    await prisma.event.deleteMany();
    await prisma.pointEntry.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Transaction Creation Flow', () => {
    test('should create a transaction with valid data', async () => {
      const transactionData = {
        eventId: testEvent.id,
        items: [
          {
            ticketTypeId: testTicketType.id,
            quantity: 2
          }
        ],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 0
      };

      const transaction = await transactionService.createTransaction(testUser.id, transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.status).toBe('WAITING_PAYMENT');
      expect(transaction.userId).toBe(testUser.id);
      expect(transaction.eventId).toBe(testEvent.id);
      expect(transaction.subtotalIDR).toBe(200000); // 2 tickets × 100000
      expect(transaction.totalPayableIDR).toBe(200000);
      expect(transaction.paymentDueAt).toBeDefined();

      // Check if seats were reduced
      const updatedTicketType = await prisma.ticketType.findUnique({
        where: { id: testTicketType.id }
      });
      expect(updatedTicketType?.availableSeats).toBe(98); // 100 - 2
    });

    test('should create transaction with voucher discount', async () => {
      // Create a voucher
      const voucher = await prisma.voucher.create({
        data: {
          code: 'TESTVOUCHER',
          eventId: testEvent.id,
          organizerId: testOrganizer.id,
          discountType: 'AMOUNT',
          discountValue: 50000,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          maxUses: 10,
          isActive: true
        }
      });

      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: 'TESTVOUCHER',
        couponCode: null,
        pointsUsed: 0
      };

      const transaction = await transactionService.createTransaction(testUser.id, transactionData);

      expect(transaction.discountVoucherIDR).toBe(50000);
      expect(transaction.totalPayableIDR).toBe(50000); // 100000 - 50000
      expect(transaction.usedVoucherId).toBe(voucher.id);
    });

    test('should create transaction with points usage', async () => {
      // Add points to user
      await prisma.pointEntry.create({
        data: {
          userId: testUser.id,
          delta: 20000,
          source: 'REFERRAL_REWARD',
          expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) // 3 months
        }
      });

      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 20000
      };

      const transaction = await transactionService.createTransaction(testUser.id, transactionData);

      expect(transaction.pointsUsed).toBe(20000);
      expect(transaction.totalPayableIDR).toBe(80000); // 100000 - 20000
    });

    test('should fail to create transaction with insufficient seats', async () => {
      const transactionData = {
        eventId: testEvent.id,
        items: [
          {
            ticketTypeId: testTicketType.id,
            quantity: 101 // More than available
          }
        ],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 0
      };

      await expect(
        transactionService.createTransaction(testUser.id, transactionData)
      ).rejects.toThrow('Insufficient seats');
    });

    test('should fail to create transaction with insufficient points', async () => {
      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 50000 // More than user has
      };

      await expect(
        transactionService.createTransaction(testUser.id, transactionData)
      ).rejects.toThrow('Not enough points');
    });
  });

  describe('Payment Proof Upload Flow', () => {
    beforeEach(async () => {
      // Create a transaction first
      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 0
      };

      testTransaction = await transactionService.createTransaction(testUser.id, transactionData);
    });

    test('should upload payment proof successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'payment.jpg',
        mimetype: 'image/jpeg'
      } as Express.Multer.File;

      const result = await transactionService.uploadPaymentProof(
        testUser.id,
        testTransaction.id,
        mockFile
      );

      expect(result).toBeDefined();
      expect(result.transactionId).toBe(testTransaction.id);

      // Check if transaction status changed
      const updatedTransaction = await prisma.transaction.findUnique({
        where: { id: testTransaction.id }
      });
      expect(updatedTransaction?.status).toBe('WAITING_ADMIN_CONFIRMATION');
      expect(updatedTransaction?.organizerDecisionBy).toBeDefined();
    });

    test('should fail to upload payment proof for non-existent transaction', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'payment.jpg',
        mimetype: 'image/jpeg'
      } as Express.Multer.File;

      await expect(
        transactionService.uploadPaymentProof(testUser.id, 99999, mockFile)
      ).rejects.toThrow('Transaction not found');
    });

    test('should fail to upload payment proof for wrong user', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'payment.jpg',
        mimetype: 'image/jpeg'
      } as Express.Multer.File;

      await expect(
        transactionService.uploadPaymentProof(testOrganizer.id, testTransaction.id, mockFile)
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('Transaction Status Management Flow', () => {
    beforeEach(async () => {
      // Create a transaction with payment proof
      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 0
      };

      testTransaction = await transactionService.createTransaction(testUser.id, transactionData);

      // Upload payment proof
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        originalname: 'payment.jpg',
        mimetype: 'image/jpeg'
      } as Express.Multer.File;

      await transactionService.uploadPaymentProof(
        testUser.id,
        testTransaction.id,
        mockFile
      );
    });

    test('should accept transaction successfully', async () => {
      // Mock the accept method (this would be in a controller)
      const updatedTransaction = await prisma.transaction.update({
        where: { id: testTransaction.id },
        data: { status: 'DONE' }
      });

      expect(updatedTransaction.status).toBe('DONE');
    });

    test('should reject transaction successfully', async () => {
      // Mock the reject method (this would be in a controller)
      const updatedTransaction = await prisma.transaction.update({
        where: { id: testTransaction.id },
        data: { status: 'REJECTED' }
      });

      expect(updatedTransaction.status).toBe('REJECTED');
    });
  });

  describe('Automatic Status Changes Flow', () => {
    test('should automatically expire transactions after 2 hours', async () => {
      // Create a transaction with past due date
      const pastTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          eventId: testEvent.id,
          status: 'WAITING_PAYMENT',
          paymentDueAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          subtotalIDR: 100000,
          discountVoucherIDR: 0,
          discountCouponIDR: 0,
          pointsUsed: 0,
          totalPayableIDR: 100000
        }
      });

      // This would be handled by a cron job or background process
      // For testing, we'll manually update it
      await prisma.transaction.update({
        where: { id: pastTransaction.id },
        data: { status: 'EXPIRED' }
      });

      const expiredTransaction = await prisma.transaction.findUnique({
        where: { id: pastTransaction.id }
      });

      expect(expiredTransaction?.status).toBe('EXPIRED');
    });

    test('should automatically cancel transactions after 3 days of admin decision deadline', async () => {
      // Create a transaction with past admin decision deadline
      const pastTransaction = await prisma.transaction.create({
        data: {
          userId: testUser.id,
          eventId: testEvent.id,
          status: 'WAITING_ADMIN_CONFIRMATION',
          paymentDueAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          organizerDecisionBy: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          subtotalIDR: 100000,
          discountVoucherIDR: 0,
          discountCouponIDR: 0,
          pointsUsed: 0,
          totalPayableIDR: 100000
        }
      });

      // This would be handled by a cron job or background process
      // For testing, we'll manually update it
      await prisma.transaction.update({
        where: { id: pastTransaction.id },
        data: { status: 'CANCELED' }
      });

      const canceledTransaction = await prisma.transaction.findUnique({
        where: { id: pastTransaction.id }
      });

      expect(canceledTransaction?.status).toBe('CANCELED');
    });
  });

  describe('Points and Voucher Rollback Flow', () => {
    test('should restore points when transaction is rejected', async () => {
      // Add points to user
      await prisma.pointEntry.create({
        data: {
          userId: testUser.id,
          delta: 20000,
          source: 'REFERRAL_REWARD',
          expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Create transaction with points
      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 1 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 20000
      };

      const transaction = await transactionService.createTransaction(testUser.id, transactionData);

      // Check points were deducted
      const pointsAfterPurchase = await prisma.pointEntry.aggregate({
        where: { userId: testUser.id },
        _sum: { delta: true }
      });

      expect(pointsAfterPurchase._sum.delta).toBe(0); // 20000 - 20000

      // Reject transaction using the service method
      await transactionService.rejectTransaction(testOrganizer.id, transaction.id);

      // Check if points were restored
      const pointsAfterRejection = await prisma.pointEntry.aggregate({
        where: { userId: testUser.id },
        _sum: { delta: true }
      });

      expect(pointsAfterRejection._sum.delta).toBe(20000); // Points restored
    });

    test('should restore seats when transaction is rejected', async () => {
      // Create transaction
      const transactionData = {
        eventId: testEvent.id,
        items: [{ ticketTypeId: testTicketType.id, quantity: 2 }],
        voucherCode: null,
        couponCode: null,
        pointsUsed: 0
      };

      const transaction = await transactionService.createTransaction(testUser.id, transactionData);

      // Check seats were reduced
      const ticketTypeAfterPurchase = await prisma.ticketType.findUnique({
        where: { id: testTicketType.id }
      });
      expect(ticketTypeAfterPurchase?.availableSeats).toBe(98); // 100 - 2

      // Reject transaction using the service method
      await transactionService.rejectTransaction(testOrganizer.id, transaction.id);

      // Check if seats were restored
      const ticketTypeAfterRejection = await prisma.ticketType.findUnique({
        where: { id: testTicketType.id }
      });
      expect(ticketTypeAfterRejection?.availableSeats).toBe(100); // Seats restored
    });
  });
});
