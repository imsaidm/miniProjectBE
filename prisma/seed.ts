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

  // Create 8 Organizers with realistic names and companies
  const organizerData = [
    { name: "Sarah Johnson", email: "sarah@techventures.com", company: "TechVentures" },
    { name: "Michael Chen", email: "michael@musicfest.com", company: "MusicFest Productions" },
    { name: "Emily Rodriguez", email: "emily@businesshub.com", company: "Business Hub" },
    { name: "David Kim", email: "david@edulab.com", company: "EduLab" },
    { name: "Lisa Thompson", email: "lisa@artgallery.com", company: "Art Gallery" },
    { name: "James Wilson", email: "james@sportsevents.com", company: "Sports Events Co" },
    { name: "Maria Garcia", email: "maria@communityhub.com", company: "Community Hub" },
    { name: "Alex Brown", email: "alex@startupinc.com", company: "Startup Inc" }
  ];
  const organizers = [];
  for (let i = 0; i < organizerData.length; i++) {
    const organizerInfo = organizerData[i];
    if (!organizerInfo) continue;
    
    const organizer = await prisma.user.create({
      data: {
        email: organizerInfo.email,
        password: await bcrypt.hash('password123', 10),
        name: organizerInfo.name,
        role: 'ORGANIZER',
        isVerified: true,
        referralCode: `ORG${(i + 1).toString().padStart(3, '0')}`,
        pointsBalance: getRandomNumber(10000, 50000),
        profileImg: userImages[i] || null
      }
    });
    organizers.push(organizer);
  }

  // Create 12 Customers with realistic names and profiles
  const customerData = [
    { name: "John Smith", email: "john.smith@gmail.com", occupation: "Software Engineer" },
    { name: "Maria Garcia", email: "maria.garcia@yahoo.com", occupation: "Marketing Manager" },
    { name: "Ahmed Hassan", email: "ahmed.hassan@outlook.com", occupation: "Business Analyst" },
    { name: "Jennifer Lee", email: "jennifer.lee@hotmail.com", occupation: "Designer" },
    { name: "Robert Wilson", email: "robert.wilson@gmail.com", occupation: "Consultant" },
    { name: "Anna Kowalski", email: "anna.kowalski@gmail.com", occupation: "Teacher" },
    { name: "Carlos Rodriguez", email: "carlos.rodriguez@yahoo.com", occupation: "Developer" },
    { name: "Sophie Martin", email: "sophie.martin@outlook.com", occupation: "Project Manager" },
    { name: "Kevin Park", email: "kevin.park@gmail.com", occupation: "Data Scientist" },
    { name: "Emma Thompson", email: "emma.thompson@hotmail.com", occupation: "Writer" },
    { name: "Daniel Kim", email: "daniel.kim@gmail.com", occupation: "Entrepreneur" },
    { name: "Lisa Anderson", email: "lisa.anderson@yahoo.com", occupation: "Freelancer" }
  ];
  const customers = [];
  for (let i = 0; i < customerData.length; i++) {
    const customerInfo = customerData[i];
    if (!customerInfo) continue;
    
    const customer = await prisma.user.create({
      data: {
        email: customerInfo.email,
        password: await bcrypt.hash('password123', 10),
        name: customerInfo.name,
        role: 'CUSTOMER',
        isVerified: true,
        referralCode: `CUST${(i + 1).toString().padStart(3, '0')}`,
        pointsBalance: getRandomNumber(0, 25000),
        profileImg: userImages[i + 8] || null
      }
    });
    customers.push(customer);
  }

  console.log('👥 Created 20 users (8 Organizers, 12 Customers)');

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

  // Create 25 Events across different categories with more realistic data
  const eventCategories = [EventCategory.TECH, EventCategory.MUSIC, EventCategory.BUSINESS, EventCategory.EDUCATION, EventCategory.SPORTS, EventCategory.ART, EventCategory.COMMUNITY, EventCategory.OTHER];
  const eventStatuses = [EventStatus.PUBLISHED, EventStatus.DRAFT, EventStatus.CANCELED];
  const eventTitles = [
    "Tech Conference 2024", "Music Festival Summer", "Business Networking Event", "Educational Workshop Series",
    "Sports Championship", "Art Exhibition Opening", "Community Meetup", "Startup Pitch Competition",
    "Web Development Bootcamp", "Jazz Night Performance", "Marketing Masterclass", "Fitness Challenge",
    "Photography Workshop", "Local Business Fair", "Innovation Summit", "AI & Machine Learning Summit",
    "Digital Marketing Conference", "Blockchain Technology Workshop", "Sustainable Business Forum",
    "Creative Writing Workshop", "Data Science Bootcamp", "UX/UI Design Masterclass", "E-commerce Summit",
    "Cybersecurity Conference", "Mobile App Development Workshop", "Leadership Development Program",
    "Financial Planning Seminar", "Health & Wellness Expo", "Environmental Sustainability Conference",
    "Women in Tech Meetup", "Youth Entrepreneurship Summit", "Senior Citizens Tech Workshop"
  ];
  const eventDescriptions = [
    "Join industry leaders and innovators for a day of cutting-edge technology discussions, networking, and hands-on workshops.",
    "Experience an unforgettable evening of live music featuring local and international artists in a beautiful outdoor setting.",
    "Connect with fellow professionals, entrepreneurs, and business leaders in this exclusive networking event.",
    "Learn new skills and expand your knowledge with our comprehensive educational workshop series.",
    "Witness the ultimate sports competition featuring top athletes and exciting matches.",
    "Explore contemporary art from emerging and established artists in this stunning exhibition.",
    "Meet like-minded individuals in your community and build lasting connections.",
    "Watch innovative startups pitch their ideas to investors and industry experts.",
    "Intensive hands-on training in modern web development technologies and best practices.",
    "Relax and enjoy an evening of smooth jazz music in an intimate setting.",
    "Master the art of digital marketing with expert-led sessions and practical exercises.",
    "Challenge yourself with our fitness program designed for all skill levels.",
    "Capture beautiful moments and improve your photography skills with professional guidance.",
    "Discover local businesses, products, and services in this community marketplace.",
    "Explore the latest trends and innovations shaping the future of technology and business."
  ];
  const locations = [
    "Jakarta Convention Center", "Bali International Convention Center", "Surabaya City Hall", "Bandung Creative Hub",
    "Yogyakarta Cultural Center", "Medan Business District", "Semarang Exhibition Center", "Makassar Convention Hall",
    "Palembang Sports Complex", "Denpasar Art Gallery", "Balikpapan Tech Hub", "Manado Cultural Center",
    "Pontianak Business Center", "Samarinda Convention Center", "Jayapura Community Hall"
  ];
  const events = [];

  for (let i = 1; i <= 25; i++) {
    const organizer = getRandomItem(organizers);
    const category = getRandomItem(eventCategories);
    const status = getRandomItem(eventStatuses);
    const startDate = getRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + getRandomNumber(2, 8) * 60 * 60 * 1000); // 2-8 hours duration

    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: eventTitles[i - 1] || `${category} Event ${i}`,
        description: eventDescriptions[i - 1] || `Join us for an amazing ${category.toLowerCase()} event! This is event number ${i} with exciting activities and networking opportunities.`,
        location: locations[i - 1] || `Location ${i}`,
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

  console.log('🎪 Created 25 events across different categories');

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

  // Create vouchers for events with better distribution
  const vouchers = [];
  const voucherCodes = [
    "EARLYBIRD20", "SUMMER15", "TECH10", "MUSIC25", "BUSINESS30",
    "EDU20", "SPORTS15", "ART10", "COMMUNITY25", "SPECIAL50"
  ];
  
  for (let i = 0; i < 10; i++) {
    const event = getRandomItem(events);
    const organizer = organizers.find(o => o.id === event.organizerId);
    if (!organizer) continue;

    const discountType = getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]);
    const discountValue = discountType === DiscountType.PERCENT ? getRandomNumber(10, 50) : getRandomNumber(25000, 100000);
    const maxUses = getRandomNumber(10, 100);
    const usedCount = getRandomNumber(0, Math.min(maxUses, 50));

    const voucher = await prisma.voucher.create({
      data: {
        code: voucherCodes[i] || `VOUCHER${i.toString().padStart(3, '0')}`,
        eventId: event.id,
        organizerId: organizer.id,
        discountType: discountType,
        discountValue: discountValue,
        startsAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxUses: maxUses,
        usedCount: usedCount,
        isActive: Math.random() > 0.2 // 80% active
      }
    });
    vouchers.push(voucher);
  }

  console.log('🎟️ Created 10 vouchers');

  // Create coupons for customers with better distribution
  const coupons = [];
  const couponCodes = [
    "WELCOME10", "FIRST15", "LOYAL20", "VIP25", "SPECIAL30",
    "NEWUSER5", "RETURN10", "PREMIUM20", "GOLD15", "SILVER10",
    "BRONZE5", "PLATINUM25", "DIAMOND30", "ELITE20", "MASTER15"
  ];
  
  for (let i = 0; i < 15; i++) {
    const customer = getRandomItem(customers);
    const discountType = getRandomItem([DiscountType.PERCENT, DiscountType.AMOUNT]);
    const discountValue = discountType === DiscountType.PERCENT ? getRandomNumber(5, 25) : getRandomNumber(10000, 50000);
    const isUsed = Math.random() > 0.7; // 30% used

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCodes[i] || `COUPON${i.toString().padStart(3, '0')}`,
        userId: customer.id,
        discountType: discountType,
        discountValue: discountValue,
        expiresAt: new Date(Date.now() + getRandomNumber(30, 90) * 24 * 60 * 60 * 1000),
        isUsed: isUsed,
        usedAt: isUsed ? new Date() : null
      }
    });
    coupons.push(coupon);
  }

  console.log('🎁 Created 15 coupons');

  // Create 50 transactions with various statuses and better distribution
  const transactionStatuses = [
    TransactionStatus.WAITING_PAYMENT, TransactionStatus.WAITING_PAYMENT, TransactionStatus.WAITING_PAYMENT, // 3 waiting payment
    TransactionStatus.WAITING_ADMIN_CONFIRMATION, TransactionStatus.WAITING_ADMIN_CONFIRMATION, TransactionStatus.WAITING_ADMIN_CONFIRMATION, // 3 waiting confirmation
    TransactionStatus.DONE, TransactionStatus.DONE, TransactionStatus.DONE, TransactionStatus.DONE, TransactionStatus.DONE, // 5 completed
    TransactionStatus.REJECTED, TransactionStatus.REJECTED, // 2 rejected
    TransactionStatus.EXPIRED, TransactionStatus.EXPIRED, // 2 expired
    TransactionStatus.CANCELED, TransactionStatus.CANCELED // 2 canceled
  ];
  const transactions = [];
  const usedCoupons = new Set<number>();

  for (let i = 1; i <= 50; i++) {
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
      // Check if attendance record already exists
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          eventId: event.id,
          userId: customer.id,
          ticketTypeId: ticketType.id
        }
      });

      if (!existingAttendance) {
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

  console.log('💰 Created 50 transactions with various statuses');

  // Create reviews for completed events
  const reviews = [];
  const reviewComments = [
    "Amazing event! The speakers were fantastic and the content was very valuable.",
    "Great networking opportunity. Met some interesting people and learned a lot.",
    "Well organized event with excellent facilities. Would definitely attend again.",
    "The event exceeded my expectations. The presentations were engaging and informative.",
    "Good event overall, though the venue could have been better. Content was solid.",
    "Outstanding experience! The organizers did a fantastic job with everything.",
    "Really enjoyed this event. The speakers were knowledgeable and engaging.",
    "Great value for money. The event was well-structured and informative.",
    "Excellent event with high-quality content. Highly recommended to others.",
    "Good event but could use some improvements in the scheduling.",
    "Fantastic experience! The networking opportunities were particularly valuable.",
    "Well-executed event with great speakers and interesting topics.",
    "The event was okay, but the venue was a bit cramped for the number of attendees.",
    "Outstanding organization and content. One of the best events I've attended.",
    "Great event with excellent speakers. The Q&A session was particularly good.",
    "Good event overall, though the timing could have been better.",
    "Excellent content and presentation. The event was very well organized.",
    "Really enjoyed the event. The speakers were engaging and the topics were relevant.",
    "Great networking event with valuable insights. Would attend again.",
    "The event was well-organized and the content was very informative."
  ];

  // Get all completed transactions to create reviews
  const completedTransactions = await prisma.transaction.findMany({
    where: { status: TransactionStatus.DONE },
    include: { event: true, user: true }
  });

  for (let i = 0; i < Math.min(completedTransactions.length, 40); i++) {
    const transaction = completedTransactions[i];
    if (!transaction) continue;
    
    const comment = getRandomItem(reviewComments);
    const rating = getRandomNumber(3, 5); // Mostly positive ratings (3-5)
    
    // Only create review if one doesn't exist
    const existingReview = await prisma.review.findFirst({
      where: {
        eventId: transaction.eventId,
        userId: transaction.userId
      }
    });

    if (!existingReview) {
      const review = await prisma.review.create({
        data: {
          eventId: transaction.eventId,
          userId: transaction.userId,
          rating: rating,
          comment: comment
        }
      });
      reviews.push(review);
    }
  }

  console.log(`⭐ Created ${reviews.length} reviews for completed events`);

  // Create email notifications for various events
  const notifications = [];
  const notificationTemplates = [
    {
      type: NotificationType.TRANSACTION_ACCEPTED,
      subject: "🎉 Transaction Approved!",
      body: "Great news! Your transaction has been approved and your tickets are confirmed. We look forward to seeing you at the event!"
    },
    {
      type: NotificationType.TRANSACTION_REJECTED,
      subject: "❌ Transaction Rejected",
      body: "We're sorry, but your transaction has been rejected. Please contact support if you have any questions or would like to try again."
    },
    {
      type: NotificationType.TRANSACTION_ACCEPTED,
      subject: "✅ Payment Confirmed",
      body: "Your payment has been successfully processed and your tickets are ready. Check your email for ticket details."
    },
    {
      type: NotificationType.TRANSACTION_REJECTED,
      subject: "⚠️ Payment Issue",
      body: "There was an issue with your payment. Please try again or contact our support team for assistance."
    }
  ];

  for (let i = 0; i < 25; i++) {
    const customer = getRandomItem(customers);
    const event = getRandomItem(events);
    const template = getRandomItem(notificationTemplates);
    const notification = await prisma.emailNotification.create({
      data: {
        toUserId: customer.id,
        type: template.type,
        subject: template.subject,
        body: template.body,
        status: getRandomItem([NotificationStatus.PENDING, NotificationStatus.SENT, NotificationStatus.FAILED])
      }
    });
    notifications.push(notification);
  }

  console.log('📧 Created 25 email notifications');

  // Create additional point entries for various activities
  for (let i = 0; i < 40; i++) {
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

  console.log('🎯 Created 40 additional point entries');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Data Summary:');
  console.log(`👥 Users: 20 (8 Organizers, 12 Customers)`);
  console.log(`🎪 Events: 25 (Across 8 categories with realistic titles and descriptions)`);
  console.log(`🎫 Ticket Types: ${ticketTypes.length} (Multiple tiers per event)`);
  console.log(`💰 Transactions: 50 (All statuses: WAITING_PAYMENT, WAITING_ADMIN_CONFIRMATION, DONE, REJECTED, EXPIRED, CANCELED)`);
  console.log(`⭐ Reviews: ${reviews.length} (For attended events with realistic comments)`);
  console.log(`🎟️ Vouchers: 10 (Percentage and amount discounts with memorable codes)`);
  console.log(`🎁 Coupons: 15 (Customer-specific rewards with themed codes)`);
  console.log(`🎯 Point Entries: 40+ (Various activities)`);
  console.log(`📧 Email Notifications: 25 (Various types with realistic templates)`);
  console.log(`🎁 Referral Relationships: ${referrals.length}`);
  
  console.log('\n🔑 Test Accounts (all use password: password123):');
  console.log('Organizers:');
  console.log('  - sarah@techventures.com (Sarah Johnson)');
  console.log('  - michael@musicfest.com (Michael Chen)');
  console.log('  - emily@businesshub.com (Emily Rodriguez)');
  console.log('  - david@edulab.com (David Kim)');
  console.log('  - lisa@artgallery.com (Lisa Thompson)');
  console.log('  - james@sportsevents.com (James Wilson)');
  console.log('  - maria@communityhub.com (Maria Garcia)');
  console.log('  - alex@startupinc.com (Alex Brown)');
  console.log('Customers:');
  console.log('  - john.smith@gmail.com (John Smith)');
  console.log('  - maria.garcia@yahoo.com (Maria Garcia)');
  console.log('  - ahmed.hassan@outlook.com (Ahmed Hassan)');
  console.log('  - jennifer.lee@hotmail.com (Jennifer Lee)');
  console.log('  - robert.wilson@gmail.com (Robert Wilson)');
  console.log('  - anna.kowalski@gmail.com (Anna Kowalski)');
  console.log('  - carlos.rodriguez@yahoo.com (Carlos Rodriguez)');
  console.log('  - sophie.martin@outlook.com (Sophie Martin)');
  console.log('  - kevin.park@gmail.com (Kevin Park)');
  console.log('  - emma.thompson@hotmail.com (Emma Thompson)');
  console.log('  - daniel.kim@gmail.com (Daniel Kim)');
  console.log('  - lisa.anderson@yahoo.com (Lisa Anderson)');
  
  console.log('\n🎟️ Sample Voucher Codes:');
  console.log('EARLYBIRD20, SUMMER15, TECH10, MUSIC25, BUSINESS30, etc.');
  
  console.log('\n🎁 Sample Coupon Codes:');
  console.log('WELCOME10, FIRST15, LOYAL20, VIP25, SPECIAL30, etc.');
  
  console.log('\n📈 Transaction Status Distribution:');
  console.log('- WAITING_PAYMENT: 5 transactions');
  console.log('- WAITING_ADMIN_CONFIRMATION: 5 transactions');
  console.log('- DONE: 15 transactions');
  console.log('- REJECTED: 5 transactions');
  console.log('- EXPIRED: 5 transactions');
  console.log('- CANCELED: 5 transactions');
  
  console.log('\n🎪 Sample Events:');
  console.log('- Tech Conference 2024');
  console.log('- Music Festival Summer');
  console.log('- Business Networking Event');
  console.log('- Educational Workshop Series');
  console.log('- Sports Championship');
  console.log('- Art Exhibition Opening');
  console.log('- Community Meetup');
  console.log('- Startup Pitch Competition');
  console.log('- Web Development Bootcamp');
  console.log('- Jazz Night Performance');
  console.log('- Marketing Masterclass');
  console.log('- Fitness Challenge');
  console.log('- Photography Workshop');
  console.log('- Local Business Fair');
  console.log('- Innovation Summit');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 