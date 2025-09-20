import { prisma } from '../src/config/prisma';

// Mock external services
jest.mock('../src/config/cloudinary', () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue('https://res.cloudinary.com/test/image/upload/test.jpg')
}));

jest.mock('../src/config/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue({ delivered: true })
}));

// Setup test database
beforeAll(async () => {
  // Clean database before tests
  await prisma.$transaction([
    prisma.emailNotification.deleteMany(),
    prisma.pointEntry.deleteMany(),
    prisma.transactionItem.deleteMany(),
    prisma.paymentProof.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.review.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.ticketType.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.event.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany()
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data
  await prisma.$transaction([
    prisma.emailNotification.deleteMany(),
    prisma.pointEntry.deleteMany(),
    prisma.transactionItem.deleteMany(),
    prisma.paymentProof.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.review.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.ticketType.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.coupon.deleteMany(),
    prisma.event.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.user.deleteMany()
  ]);
});
