/**
 * Generate a unique referral code
 */
export declare function generateReferralCode(): string;
/**
 * Calculate expiration date from now
 */
export declare function calculateExpirationDate(hours: number): Date;
/**
 * Calculate days from now
 */
export declare function calculateDaysFromNow(days: number): Date;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Format currency in IDR
 */
export declare function formatIDR(amount: number): string;
/**
 * Calculate discount amount
 */
export declare function calculateDiscount(subtotal: number, discountValue: number, discountType: 'AMOUNT' | 'PERCENTAGE'): number;
/**
 * Validate date is in the future
 */
export declare function isDateInFuture(date: Date): boolean;
/**
 * Validate date range (start < end)
 */
export declare function isValidDateRange(startDate: Date, endDate: Date): boolean;
/**
 * Generate random string
 */
export declare function generateRandomString(length?: number): string;
/**
 * Sanitize string input
 */
export declare function sanitizeString(input: string): string;
/**
 * Validate numeric input
 */
export declare function isValidNumber(value: any): boolean;
/**
 * Convert string to number safely
 */
export declare function safeNumberConversion(value: any): number | null;
//# sourceMappingURL=helpers.d.ts.map