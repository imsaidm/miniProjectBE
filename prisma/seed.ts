import { PrismaClient, EventCategory, EventStatus, TransactionStatus, PointsSource, DiscountType, NotificationType, NotificationStatus } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper function to generate random dates
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random number between min and max
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]!;
};

// Valid image URLs for users and events
const userImages = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=face'
];

const eventImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
];

async function main() {
  console.log('🌱 Starting database seeding with reduced data...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.emailNotification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.pointEntry.deleteMany();
  await prisma.paymentProof.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create 5 Organizers
  const organizers = [];
  for (let i = 1; i <= 5; i++) {
    const organizer = await prisma.user.create({
      data: {
        email: `organizer${i}@example.com`,
        password: await bcrypt.hash('password123', 10),
        name: `Organizer ${i}`,
        role: 'ORGANIZER',
        isVerified: true,
        referralCode: `ORG${i.toString().padStart(3, '0')}`,
        pointsBalance: getRandomNumber(5000, 20000),
        profileImg: userImages[i - 1] || null
      }
    });
    organizers.push(organizer);
  }

  // Create 5 Customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password: await bcrypt.hash('password123', 10),
        name: `Customer ${i}`,
        role: 'CUSTOMER',
        isVerified: true,
        referralCode: `CUST${i.toString().padStart(3, '0')}`,
        pointsBalance: getRandomNumber(0, 10000),
        profileImg: userImages[i + 4] || null // Use different images for customers
      }
    });
    customers.push(customer);
  }

  console.log('👥 Created 10 users (5 Organizers, 5 Customers)');

  // Create referral relationships
  const referrals = [];
  const usedReferees = new Set<number>();
  
  for (let i = 0; i < 3; i++) {
    const referrer = getRandomItem(organizers);
    let referee = getRandomItem(customers);
    
    // Find a customer who hasn't been referred yet
    let attempts = 0;
    while (usedReferees.has(referee.id) && attempts < 10) {
      referee = getRandomItem(customers);
      attempts++;
    }
    
    if (attempts >= 10) break; // No more unreferred customers
    
    usedReferees.add(referee.id);
    
    const referral = await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: referee.id
      }
    });
    referrals.push(referral);

    // Update customer with referredByCode
    await prisma.user.update({
      where: { id: referee.id },
      data: { referredByCode: referrer.referralCode }
    });

    // Add referral points to organizer
    await prisma.pointEntry.create({
      data: {
        userId: referrer.id,
        delta: 5000,
        source: PointsSource.REFERRAL_REWARD,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    });

    // Update organizer points balance
    await prisma.user.update({
      where: { id: referrer.id },
      data: { 
        pointsBalance: {
          increment: 5000
        }
      }
    });
  }

  console.log('🎁 Created referral relationships and rewards');

  // Create 15 Events across different categories
  const eventCategories = [EventCategory.TECH, EventCategory.MUSIC, EventCategory.BUSINESS, EventCategory.EDUCATION, EventCategory.SPORTS, EventCategory.ART, EventCategory.COMMUNITY, EventCategory.OTHER];
  const eventStatuses = [EventStatus.PUBLISHED, EventStatus.DRAFT, EventStatus.CANCELED];
  const events = [];

  for (let i = 1; i <= 15; i++) {
    const organizer = getRandomItem(organizers);
    const category = getRandomItem(eventCategories);
    const status = getRandomItem(eventStatuses);
    const startDate = getRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + getRandomNumber(2, 8) * 60 * 60 * 1000); // 2-8 hours duration

    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: `${category} Event ${i}`,
        description: `Join us for an amazing ${category.toLowerCase()} event! This is event number ${i} with exciting activities and networking opportunities.`,
        location: `Location ${i}`,
        category: category,
        status: status,
        bannerImage: eventImages[i - 1] || null,
        startAt: startDate,
        endAt: endDate,
        basePriceIDR: getRandomNumber(100000, 500000),
        totalSeats: getRandomNumber(50, 500),
        availableSeats: getRandomNumber(50, 500)
      }
    });
    events.push(event);
  }

  console.log('🎪 Created 15 events across different categories');

  // Create ticket types for each event
  const ticketTypes = [];
  for (const event of events) {
    const numTicketTypes = getRandomNumber(1, 3);
    for (let i = 0; i < numTicketTypes; i++) {
      const ticketType = await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: ['Early Bird', 'Regular', 'VIP'][i] || `Ticket Type ${i + 1}`,
          priceIDR: (event.basePriceIDR || 0) + (i * 100000),
          totalSeats: Math.floor((event.totalSeats || 0) / numTicketTypes),
          availableSeats: Math.floor((event.availableSeats || 0) / numTicketTypes)
        }
      });
      ticketTypes.push(ticketType);
    }
  }

  console.log('🎫 Created ticket types for all events');

  // Create vouchers for events
  const vouchers = [];
  for (let i = 0; i < 10; i++) {
    const event = getRandomItem(events);
    const organizer = organizers.find(o => o.id === event.organizerId);
    if (!organizer) continue;

    const voucher = await prisma.voucher.create({
      data: {
        code: `VOUCHER${i.toString().padStart(3, '0')}`,
        eventId: event.id,
        organizerId: organizer.id,
        discountType: getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]),
        discountValue: getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]) === DiscountType.PERCENT ? getRandomNumber(10, 50) : getRandomNumber(25000, 100000),
        startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxUses: getRandomNumber(10, 100),
        usedCount: getRandomNumber(0, 50),
        isActive: Math.random() > 0.2 // 80% active
      }
    });
    vouchers.push(voucher);
  }

  console.log('🎟️ Created 10 vouchers');

  // Create coupons for customers
  const coupons = [];
  for (let i = 0; i < 15; i++) {
    const customer = getRandomItem(customers);
    const coupon = await prisma.coupon.create({
      data: {
        code: `COUPON${i.toString().padStart(3, '0')}`,
        userId: customer.id,
        discountType: getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]),
        discountValue: getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]) === DiscountType.PERCENT ? getRandomNumber(5, 25) : getRandomNumber(10000, 50000),
        expiresAt: new Date(Date.now() + getRandomNumber(30, 90) * 24 * 60 * 60 * 1000),
        isUsed: Math.random() > 0.7, // 30% used
        usedAt: Math.random() > 0.7 ? new Date() : null
      }
    });
    coupons.push(coupon);
  }

  console.log('🎁 Created 15 coupons');

  // Create 30 transactions with various statuses
  const transactionStatuses = [TransactionStatus.WAITING_PAYMENT, TransactionStatus.WAITING_ADMIN_CONFIRMATION, TransactionStatus.DONE, TransactionStatus.REJECTED, TransactionStatus.EXPIRED, TransactionStatus.CANCELED];
  const transactions = [];
  const usedCoupons = new Set<number>();

  for (let i = 1; i <= 30; i++) {
    const customer = getRandomItem(customers);
    const event = getRandomItem(events);
    const status = getRandomItem(transactionStatuses);
    const eventTicketTypes = ticketTypes.filter(tt => tt.eventId === event.id);
    
    if (eventTicketTypes.length === 0) continue;
    
    const ticketType = getRandomItem(eventTicketTypes);
    const quantity = getRandomNumber(1, 5);
    const subtotal = ticketType.priceIDR * quantity;
    
    // Random discounts
    const voucher = Math.random() > 0.5 ? getRandomItem(vouchers.filter(v => v.eventId === event.id)) : null;
    const availableCoupons = coupons.filter(c => c.userId === customer.id && !c.isUsed && !usedCoupons.has(c.id));
    const coupon = Math.random() > 0.5 && availableCoupons.length > 0 ? getRandomItem(availableCoupons) : null;
    
    let discountVoucher = 0;
    let discountCoupon = 0;
    let pointsUsed = 0;
    
    if (voucher) {
      if (voucher.discountType === DiscountType.PERCENT) {
        discountVoucher = Math.floor(subtotal * voucher.discountValue / 100);
      } else {
        discountVoucher = voucher.discountValue;
      }
    }
    
    if (coupon) {
      if (coupon.discountType === DiscountType.PERCENT) {
        discountCoupon = Math.floor(subtotal * coupon.discountValue / 100);
      } else {
        discountCoupon = coupon.discountValue;
      }
    }
    
    // Use points if available
    if (customer.pointsBalance > 0 && Math.random() > 0.5) {
      pointsUsed = Math.min(customer.pointsBalance, Math.floor(subtotal * 0.1)); // Max 10% of subtotal
    }
    
    const totalPayable = Math.max(0, subtotal - discountVoucher - discountCoupon - pointsUsed);
    
    const transaction = await prisma.transaction.create({
      data: {
        userId: customer.id,
        eventId: event.id,
        status: status,
        paymentDueAt: new Date(Date.now() + getRandomNumber(1, 72) * 60 * 60 * 1000), // 1-72 hours
        subtotalIDR: subtotal,
        discountVoucherIDR: discountVoucher,
        discountCouponIDR: discountCoupon,
        pointsUsed: pointsUsed,
        totalPayableIDR: totalPayable,
        usedVoucherId: voucher?.id || null,
        usedCouponId: coupon?.id || null
      }
    });
    transactions.push(transaction);
    
    // Track used coupon
    if (coupon) {
      usedCoupons.add(coupon.id);
    }

    // Create transaction items
    await prisma.transactionItem.create({
      data: {
        transactionId: transaction.id,
        ticketTypeId: ticketType.id,
        quantity: quantity,
        unitPriceIDR: ticketType.priceIDR
      }
    });

    // Create payment proof for waiting confirmation transactions
    if (status === TransactionStatus.WAITING_ADMIN_CONFIRMATION && Math.random() > 0.3) {
      await prisma.paymentProof.create({
        data: {
          transactionId: transaction.id,
          imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop'
        }
      });
    }

    // Create point entries for transactions
    if (pointsUsed > 0) {
      await prisma.pointEntry.create({
        data: {
          userId: customer.id,
          transactionId: transaction.id,
          delta: -pointsUsed,
          source: PointsSource.PURCHASE_REDEEM
        }
      });

      // Update customer points balance
      await prisma.user.update({
        where: { id: customer.id },
        data: { 
          pointsBalance: {
            decrement: pointsUsed
          }
        }
      });
    }

    // Create attendance records for completed transactions
    if (status === TransactionStatus.DONE) {
      await prisma.attendance.create({
        data: {
          eventId: event.id,
          userId: customer.id,
          ticketTypeId: ticketType.id,
          quantity: quantity,
          totalPaidIDR: totalPayable
        }
      });
    }

    // Update ticket type available seats
    if (status === TransactionStatus.DONE || status === TransactionStatus.WAITING_ADMIN_CONFIRMATION) {
      await prisma.ticketType.update({
        where: { id: ticketType.id },
        data: { 
          availableSeats: {
            decrement: quantity
          }
        }
      });
    }

    // Update voucher usage
    if (voucher && (status === TransactionStatus.DONE || status === TransactionStatus.WAITING_ADMIN_CONFIRMATION)) {
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { 
          usedCount: {
            increment: 1
          }
        }
      });
    }

    // Update coupon usage
    if (coupon && (status === TransactionStatus.DONE || status === TransactionStatus.WAITING_ADMIN_CONFIRMATION)) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { 
          isUsed: true,
          usedAt: new Date()
        }
      });
    }
  }

  console.log('💰 Created 30 transactions with various statuses');

  // Create reviews for completed events
  const reviews = [];
  for (let i = 0; i < 20; i++) {
    const customer = getRandomItem(customers);
    const event = getRandomItem(events);
    
    // Check if customer attended this event
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: customer.id,
        eventId: event.id
      }
    });

    if (attendance) {
      const review = await prisma.review.create({
        data: {
          eventId: event.id,
          userId: customer.id,
          rating: getRandomNumber(1, 5),
          comment: `Great event! I really enjoyed the ${event.category.toLowerCase()} experience. Highly recommended!`
        }
      });
      reviews.push(review);
    }
  }

  console.log('⭐ Created 20 reviews');

  // Create email notifications for various events
  const notifications = [];
  for (let i = 0; i < 15; i++) {
    const customer = getRandomItem(customers);
    const event = getRandomItem(events);
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: customer.id,
        type: getRandomItem([NotificationType.TRANSACTION_ACCEPTED, NotificationType.TRANSACTION_REJECTED]),
        subject: `Transaction Update for ${event.title}`,
        body: `This is a notification about your transaction for ${event.title}`,
        status: getRandomItem([NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.FAILED])
      }
    });
    notifications.push(notification);
  }

  console.log('📧 Created 15 email notifications');

  // Create additional point entries for various activities
  for (let i = 0; i < 25; i++) {
    const customer = getRandomItem(customers);
    const sources = [PointsSource.REFERRAL_REWARD, PointsSource.PURCHASE_REDEEM, PointsSource.ROLLBACK, PointsSource.ADMIN_ADJUSTMENT];
    const source = getRandomItem(sources);
    let delta = 0;
    
    switch (source) {
      case PointsSource.REFERRAL_REWARD:
        delta = 5000;
        break;
      case PointsSource.PURCHASE_REDEEM:
        delta = -getRandomNumber(1000, 10000);
        break;
      case PointsSource.ROLLBACK:
        delta = getRandomNumber(1000, 5000);
        break;
      case PointsSource.ADMIN_ADJUSTMENT:
        delta = getRandomNumber(-5000, 5000);
        break;
    }

    await prisma.pointEntry.create({
      data: {
        userId: customer.id,
        delta: delta,
        source: source,
        expiresAt: source === PointsSource.PURCHASE_REDEEM ? null : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    });

    // Update customer points balance
    await prisma.user.update({
      where: { id: customer.id },
      data: { 
        pointsBalance: {
          increment: delta
        }
      }
    });
  }

  console.log('🎯 Created 25 additional point entries');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Data Summary:');
  console.log(`👥 Users: 10 (5 Organizers, 5 Customers)`);
  console.log(`🎪 Events: 15 (Across 8 categories)`);
  console.log(`🎫 Ticket Types: ${ticketTypes.length} (Multiple tiers per event)`);
  console.log(`💰 Transactions: 30 (All statuses: WAITING_PAYMENT, WAITING_ADMIN_CONFIRMATION, DONE, REJECTED, EXPIRED, CANCELED)`);
  console.log(`⭐ Reviews: 20 (For attended events)`);
  console.log(`🎟️ Vouchers: 10 (Percentage and amount discounts)`);
  console.log(`🎁 Coupons: 15 (Customer-specific rewards)`);
  console.log(`🎯 Point Entries: 25+ (Various activities)`);
  console.log(`📧 Email Notifications: 15 (Various types)`);
  console.log(`🎁 Referral Relationships: ${referrals.length}`);
  
  console.log('\n🔑 Test Accounts (all use password: password123):');
  console.log('Organizers: organizer1@example.com to organizer5@example.com');
  console.log('Customers: customer1@example.com to customer5@example.com');
  
  console.log('\n🎟️ Sample Voucher Codes:');
  console.log('VOUCHER001, VOUCHER002, VOUCHER003, etc.');
  
  console.log('\n🎁 Sample Coupon Codes:');
  console.log('COUPON001, COUPON002, COUPON003, etc.');
  
  console.log('\n📈 Transaction Status Distribution:');
  console.log('- WAITING_PAYMENT: ~5 transactions');
  console.log('- WAITING_ADMIN_CONFIRMATION: ~5 transactions');
  console.log('- DONE: ~5 transactions');
  console.log('- REJECTED: ~5 transactions');
  console.log('- EXPIRED: ~5 transactions');
  console.log('- CANCELED: ~5 transactions');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 