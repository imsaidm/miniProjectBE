"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../service/auth.service"));
const prisma_1 = require("../config/prisma");
class AuthController {
    async register(req, res, next) {
        try {
            const body = req.body;
            // Enforce referral can only be used by CUSTOMER registrations
            if (body.referralCode) {
                if (body.role && body.role !== 'CUSTOMER') {
                    return res.status(400).json({
                        message: 'Referral codes can only be used by customers. Organizers cannot use referral codes.'
                    });
                }
                // Validate that the referral code exists and belongs to a valid user
                const referrer = await prisma_1.prisma.user.findUnique({
                    where: { referralCode: body.referralCode },
                    select: { id: true, name: true, role: true, email: true }
                });
                if (!referrer) {
                    return res.status(400).json({
                        message: 'Invalid referral code. Please check and try again.'
                    });
                }
                // Optional: Prevent self-referral
                if (body.email === referrer.email) {
                    return res.status(400).json({
                        message: 'You cannot refer yourself.'
                    });
                }
            }
            const result = await auth_service_1.default.register(body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.default.login(email, password);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            if (!token)
                return res.status(400).json({ message: 'Token is required' });
            const now = new Date();
            const evt = await prisma_1.prisma.emailVerificationToken.findUnique({ where: { token } });
            if (!evt || evt.usedAt || evt.expiresAt < now) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }
            await prisma_1.prisma.$transaction(async (tx) => {
                await tx.user.update({ where: { id: evt.userId }, data: { isVerified: true } });
                await tx.emailVerificationToken.update({ where: { id: evt.id }, data: { usedAt: new Date() } });
            });
            res.status(200).json({ message: 'Email verified' });
        }
        catch (error) {
            next(error);
        }
    }
    async keepLogin(req, res, next) { res.status(404).json({ message: 'Not implemented in MVP' }); }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;
            const result = await auth_service_1.default.changePassword(userId, oldPassword, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await auth_service_1.default.forgotPassword(email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            const result = await auth_service_1.default.resetPassword(token, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await auth_service_1.default.updateProfile(userId, req.body);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async uploadProfileImage(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await auth_service_1.default.uploadProfileImage(userId, req.body.imageUrl || req.file);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map