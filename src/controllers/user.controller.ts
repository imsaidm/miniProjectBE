import { Request, Response, NextFunction } from 'express';
import UserService from '../service/user.service';
import { uploadImageBuffer } from '../config/cloudinary';

export class UserController {
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const profile = await UserService.getProfile(userId);
            res.status(200).json(profile);
        } catch (err) {
            next(err);
        }
    }
    
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            let payload: any = req.body || {};

            // If multipart with file was sent
            const file = (req as any).file as Express.Multer.File | undefined;
            if (file && file.buffer) {
                const imageUrl = await uploadImageBuffer(file.buffer, 'profile-images');
                payload.profileImg = imageUrl;
            }

            const updated = await UserService.updateProfile(userId, payload);
            res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    }
    
    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current password and new password are required' });
            }
            
            const result = await UserService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
    
    async getPoints(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await UserService.getPoints(userId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
    
    async getCoupons(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await UserService.getCoupons(userId);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();
