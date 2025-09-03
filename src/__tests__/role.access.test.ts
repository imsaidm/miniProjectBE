import request from 'supertest';
import { prisma } from '../config/prisma';
import app from '../app';

describe('Role-Based Access Control Tests', () => {
  let customerToken: string;
  let organizerToken: string;
  let customerId: number;
  let organizerId: number;
  let testEventId: number;

  beforeAll(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Create test users
    const customerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'password123',
        role: 'CUSTOMER'
      });
    
    const organizerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Organizer',
        email: 'organizer@test.com',
        password: 'password123',
        role: 'ORGANIZER'
      });

    // Login to get tokens
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123'
      });
    
    const organizerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'organizer@test.com',
        password: 'password123'
      });

    customerToken = customerLogin.body.token;
    organizerToken = organizerLogin.body.token;
    customerId = customerResponse.body.user.id;
    organizerId = organizerResponse.body.user.id;

    // Create a test event for the organizer
    const eventResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .field('title', 'Test Event')
      .field('description', 'Test Description')
      .field('location', 'Test Location')
      .field('category', 'TECH')
      .field('startAt', '2024-12-31T10:00:00')
      .field('endAt', '2024-12-31T18:00:00')
      .field('basePriceIDR', '100000')
      .field('totalSeats', '100')
      .field('availableSeats', '100');

    testEventId = eventResponse.body.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.transaction.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Event Management Access', () => {
    test('Organizer can create events', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${organizerToken}`)
        .field('title', 'New Event')
        .field('description', 'New Description')
        .field('location', 'New Location')
        .field('category', 'TECH')
        .field('startAt', '2024-12-31T10:00:00')
        .field('endAt', '2024-12-31T18:00:00')
        .field('basePriceIDR', '100000')
        .field('totalSeats', '100')
        .field('availableSeats', '100');

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Event');
    });

    test('Customer cannot create events', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${customerToken}`)
        .field('title', 'New Event')
        .field('description', 'New Description')
        .field('location', 'New Location')
        .field('category', 'TECH')
        .field('startAt', '2024-12-31T10:00:00')
        .field('endAt', '2024-12-31T18:00:00')
        .field('basePriceIDR', '100000')
        .field('totalSeats', '100')
        .field('availableSeats', '100');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Organizer can view their events', async () => {
      const response = await request(app)
        .get('/api/events/my')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Customer cannot view organizer events', async () => {
      const response = await request(app)
        .get('/api/events/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Organizer can update their events', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .field('title', 'Updated Event Title');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Event Title');
    });

    test('Customer cannot update events', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEventId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .field('title', 'Updated Event Title');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });
  });

  describe('Transaction Access', () => {
    test('Customer can create transactions', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          eventId: testEventId,
          items: [
            {
              ticketTypeId: 1,
              quantity: 1
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('WAITING_PAYMENT');
    });

    test('Organizer cannot create transactions', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          eventId: testEventId,
          items: [
            {
              ticketTypeId: 1,
              quantity: 1
            }
          ]
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Customer can view their transactions', async () => {
      const response = await request(app)
        .get('/api/transactions/my')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Organizer can view transactions for their events', async () => {
      const response = await request(app)
        .get('/api/transactions/organizer')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Customer cannot view organizer transactions', async () => {
      const response = await request(app)
        .get('/api/transactions/organizer')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });
  });

  describe('Voucher Management Access', () => {
    test('Organizer can create vouchers', async () => {
      const response = await request(app)
        .post('/api/vouchers')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          eventId: testEventId,
          discountType: 'AMOUNT',
          discountValue: 10000,
          startsAt: '2024-01-01T00:00:00',
          endsAt: '2024-12-31T23:59:59'
        });

      expect(response.status).toBe(201);
      expect(response.body.discountValue).toBe(10000);
    });

    test('Customer cannot create vouchers', async () => {
      const response = await request(app)
        .post('/api/vouchers')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          eventId: testEventId,
          discountType: 'AMOUNT',
          discountValue: 10000,
          startsAt: '2024-01-01T00:00:00',
          endsAt: '2024-12-31T23:59:59'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Organizer can view vouchers', async () => {
      const response = await request(app)
        .get('/api/vouchers')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Customer cannot view vouchers list', async () => {
      const response = await request(app)
        .get('/api/vouchers')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Customer can validate vouchers', async () => {
      // First create a voucher as organizer
      const voucherResponse = await request(app)
        .post('/api/vouchers')
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          eventId: testEventId,
          discountType: 'AMOUNT',
          discountValue: 10000,
          startsAt: '2024-01-01T00:00:00',
          endsAt: '2024-12-31T23:59:59'
        });

      const voucherCode = voucherResponse.body.code;

      // Then validate as customer
      const response = await request(app)
        .post('/api/vouchers/validate')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          code: voucherCode,
          eventId: testEventId
        });

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
    });
  });

  describe('Dashboard Access', () => {
    test('Organizer can access dashboard summary', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('totalRevenue');
    });

    test('Customer cannot access dashboard summary', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Organizer can access event attendees', async () => {
      const response = await request(app)
        .get(`/api/transactions/event/${testEventId}/attendees`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Customer cannot access event attendees', async () => {
      const response = await request(app)
        .get(`/api/transactions/event/${testEventId}/attendees`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });
  });

  describe('Transaction Management Access', () => {
    let transactionId: number;

    beforeEach(async () => {
      // Create a transaction as customer
      const transactionResponse = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          eventId: testEventId,
          items: [
            {
              ticketTypeId: 1,
              quantity: 1
            }
          ]
        });

      transactionId = transactionResponse.body.id;
    });

    test('Organizer can accept transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/accept`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('DONE');
    });

    test('Customer cannot accept transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/accept`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Organizer can reject transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/reject`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .send({
          reason: 'Test rejection'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('REJECTED');
    });

    test('Customer cannot reject transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/reject`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          reason: 'Test rejection'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });

    test('Customer can cancel their own transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CANCELED');
    });

    test('Organizer cannot cancel transactions', async () => {
      const response = await request(app)
        .patch(`/api/transactions/${transactionId}/cancel`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('insufficient privileges');
    });
  });

  describe('Event Ownership Validation', () => {
    let otherOrganizerToken: string;
    let otherOrganizerEventId: number;

    beforeEach(async () => {
      // Create another organizer
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other Organizer',
          email: 'other@test.com',
          password: 'password123',
          role: 'ORGANIZER'
        });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@test.com',
          password: 'password123'
        });

      otherOrganizerToken = otherLogin.body.token;

      // Create event for other organizer
      const eventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${otherOrganizerToken}`)
        .field('title', 'Other Event')
        .field('description', 'Other Description')
        .field('location', 'Other Location')
        .field('category', 'TECH')
        .field('startAt', '2024-12-31T10:00:00')
        .field('endAt', '2024-12-31T18:00:00')
        .field('basePriceIDR', '100000')
        .field('totalSeats', '100')
        .field('availableSeats', '100');

      otherOrganizerEventId = eventResponse.body.id;
    });

    test('Organizer cannot update other organizer events', async () => {
      const response = await request(app)
        .patch(`/api/events/${otherOrganizerEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .field('title', 'Unauthorized Update');

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });

    test('Organizer cannot delete other organizer events', async () => {
      const response = await request(app)
        .delete(`/api/events/${otherOrganizerEventId}`)
        .set('Authorization', `Bearer ${organizerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Forbidden');
    });
  });
});
