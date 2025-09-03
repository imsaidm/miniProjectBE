import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return (uuidv4().split('-')[0] || '').toUpperCase();
}

/**
 * Calculate expiration date from now
 */
export function calculateExpirationDate(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Calculate days from now
 */
export function calculateDaysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format currency in IDR
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(subtotal: number, discountValue: number, discountType: 'AMOUNT' | 'PERCENTAGE'): number {
  if (discountType === 'AMOUNT') {
    return Math.min(discountValue, subtotal);
  }
  return Math.floor(subtotal * (discountValue / 100));
}

/**
 * Validate date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Validate date range (start < end)
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate < endDate;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate numeric input
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Convert string to number safely
 */
export function safeNumberConversion(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  return isValidNumber(num) ? num : null;
}
