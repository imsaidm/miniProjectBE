"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const mailer_1 = require("../config/mailer");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme!';
const POINTS_REFERRAL_REWARD = 10000;
const COUPON_VALUE = 10000;
const COUPON_EXP_DAYS = 90;
class AuthService {
    async register({ email, password, name, role, referralCode }) {
        // cek email unik
        const exists = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (exists)
            throw { status: 409, message: 'Email is already registered' };
        // hash password
        const hashedPass = await bcryptjs_1.default.hash(password, 10);
        // generate referral code user baru
        const userReferralCode = ((0, uuid_1.v4)().split('-')[0] || '').toUpperCase();
        // payload user
        const userPayload = {
            email,
            password: hashedPass,
            name,
            role: role || 'CUSTOMER',
            referralCode: userReferralCode,
        };
        if (referralCode)
            userPayload.referredByCode = referralCode;
        // simpan user baru
        const user = await prisma_1.prisma.user.create({ data: userPayload });
        // create email verification token
        const emailToken = (0, uuid_1.v4)();
        const emailTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma_1.prisma.emailVerificationToken.create({
            data: { userId: user.id, token: emailToken, expiresAt: emailTokenExpiresAt }
        });
        // send verification email (or log in dev)
        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
        const verifyUrl = `${frontendBaseUrl}/auth/verify?token=${encodeURIComponent(emailToken)}`;
        const subject = 'Verify your email address';
        const html = `
      <p>Hi${name ? ' ' + name : ''},</p>
      <p>Thanks for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you did not sign up, you can ignore this email.</p>
    `;
        await (0, mailer_1.sendEmail)({ to: email, subject, html, text: `Verify your email: ${verifyUrl}` });
        // kalau ada referral → kasih reward
        if (referralCode) {
            const referrer = await prisma_1.prisma.user.findUnique({ where: { referralCode } });
            if (referrer) {
                const expiresAt = new Date(Date.now() + COUPON_EXP_DAYS * 24 * 60 * 60 * 1000);
                await prisma_1.prisma.referral.create({
                    data: {
                        referrerId: referrer.id,
                        refereeId: user.id,
                    },
                });
                await prisma_1.prisma.pointEntry.create({
                    data: {
                        userId: referrer.id,
                        delta: POINTS_REFERRAL_REWARD,
                        source: 'REFERRAL_REWARD',
                        expiresAt,
                    },
                });
                // Update referrer's points balance
                await prisma_1.prisma.user.update({
                    where: { id: referrer.id },
                    data: {
                        pointsBalance: {
                            increment: POINTS_REFERRAL_REWARD
                        }
                    }
                });
                await prisma_1.prisma.coupon.create({
                    data: {
                        code: (0, uuid_1.v4)(),
                        userId: user.id,
                        discountType: 'AMOUNT',
                        discountValue: COUPON_VALUE,
                        expiresAt,
                    },
                });
            }
        }
        const resp = {
            userId: user.id,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            role: user.role,
            message: 'Registration successful'
        };
        if (process.env.NODE_ENV !== 'production') {
            resp.verifyToken = emailToken;
            resp.verifyUrl = verifyUrl;
        }
        return resp;
    }
    async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw { status: 401, message: 'Invalid email/password' };
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            throw { status: 401, message: 'Invalid email/password' };
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        return {
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        };
    }
    async changePassword(userId, oldPass, newPass) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw { status: 404, message: 'User not found' };
        const valid = await bcryptjs_1.default.compare(oldPass, user.password);
        if (!valid)
            throw { status: 400, message: 'Old password incorrect' };
        const hashed = await bcryptjs_1.default.hash(newPass, 10);
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        return { message: 'Password updated' };
    }
    async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return { message: 'If the email exists, a reset link will be sent' };
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await prisma_1.prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
        return { message: 'Reset token created', token };
    }
    async resetPassword(token, newPass) {
        const prt = await prisma_1.prisma.passwordResetToken.findUnique({ where: { token } });
        if (!prt || prt.usedAt || prt.expiresAt < new Date())
            throw { status: 400, message: 'Invalid or expired token' };
        const hashed = await bcryptjs_1.default.hash(newPass, 10);
        await prisma_1.prisma.$transaction(async (tx) => {
            await tx.user.update({ where: { id: prt.userId }, data: { password: hashed } });
            await tx.passwordResetToken.update({ where: { id: prt.id }, data: { usedAt: new Date() } });
        });
        return { message: 'Password has been reset' };
    }
    async updateProfile(userId, data) {
        const { name } = data;
        const user = await prisma_1.prisma.user.update({ where: { id: userId }, data: { name } });
        return { id: user.id, email: user.email, name: user.name, profileImg: user.profileImg, role: user.role };
    }
    async uploadProfileImage(userId, image) {
        const imageUrl = typeof image === 'string' ? image : image?.secure_url;
        if (!imageUrl)
            throw { status: 400, message: 'Image is required' };
        const user = await prisma_1.prisma.user.update({ where: { id: userId }, data: { profileImg: imageUrl } });
        return { id: user.id, profileImg: user.profileImg };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map