"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = generateReferralCode;
exports.calculateExpirationDate = calculateExpirationDate;
exports.calculateDaysFromNow = calculateDaysFromNow;
exports.isValidEmail = isValidEmail;
exports.formatIDR = formatIDR;
exports.calculateDiscount = calculateDiscount;
exports.isDateInFuture = isDateInFuture;
exports.isValidDateRange = isValidDateRange;
exports.generateRandomString = generateRandomString;
exports.sanitizeString = sanitizeString;
exports.isValidNumber = isValidNumber;
exports.safeNumberConversion = safeNumberConversion;
const uuid_1 = require("uuid");
/**
 * Generate a unique referral code
 */
function generateReferralCode() {
    return ((0, uuid_1.v4)().split('-')[0] || '').toUpperCase();
}
/**
 * Calculate expiration date from now
 */
function calculateExpirationDate(hours) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}
/**
 * Calculate days from now
 */
function calculateDaysFromNow(days) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Format currency in IDR
 */
function formatIDR(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}
/**
 * Calculate discount amount
 */
function calculateDiscount(subtotal, discountValue, discountType) {
    if (discountType === 'AMOUNT') {
        return Math.min(discountValue, subtotal);
    }
    return Math.floor(subtotal * (discountValue / 100));
}
/**
 * Validate date is in the future
 */
function isDateInFuture(date) {
    return date > new Date();
}
/**
 * Validate date range (start < end)
 */
function isValidDateRange(startDate, endDate) {
    return startDate < endDate;
}
/**
 * Generate random string
 */
function generateRandomString(length = 8) {
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
function sanitizeString(input) {
    return input.trim().replace(/\s+/g, ' ');
}
/**
 * Validate numeric input
 */
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
/**
 * Convert string to number safely
 */
function safeNumberConversion(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const num = Number(value);
    return isValidNumber(num) ? num : null;
}
//# sourceMappingURL=helpers.js.map