import { Request, Response, NextFunction } from 'express';
import AuthService from '../service/auth.service';
import { prisma } from '../config/prisma';


export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
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
                const referrer = await prisma.user.findUnique({ 
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
            
            const result = await AuthService.register(body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.body as { token: string };
            if (!token) return res.status(400).json({ message: 'Token is required' });
            const now = new Date();
            const evt = await prisma.emailVerificationToken.findUnique({ where: { token } });
            if (!evt || evt.usedAt || evt.expiresAt < now) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            await prisma.$transaction(async (tx) => {
                await tx.user.update({ where: { id: evt.userId }, data: { isVerified: true } });
                await tx.emailVerificationToken.update({ where: { id: evt.id }, data: { usedAt: new Date() } });
            });

            res.status(200).json({ message: 'Email verified' });
        } catch (error) {
            next(error);
        }
    }

    async keepLogin(req: Request, res: Response, next: NextFunction) { res.status(404).json({ message: 'Not implemented in MVP' }); }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { oldPassword, newPassword } = req.body;
            const result = await AuthService.changePassword(userId, oldPassword, newPassword);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            const result = await AuthService.resetPassword(token, newPassword);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await AuthService.updateProfile(userId, req.body);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }

    async uploadProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await AuthService.uploadProfileImage(userId, req.body.imageUrl || (req as any).file);
            res.status(200).json(result);
        } catch (error) { next(error); }
    }
}

export default new AuthController();
