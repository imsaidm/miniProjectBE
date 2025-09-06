"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = __importDefault(require("../service/user.service"));
const cloudinary_1 = require("../config/cloudinary");
class UserController {
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await user_service_1.default.getProfile(userId);
            res.status(200).json(profile);
        }
        catch (err) {
            next(err);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            let payload = req.body || {};
            // If multipart with file was sent
            const file = req.file;
            if (file && file.buffer) {
                const imageUrl = await (0, cloudinary_1.uploadImageBuffer)(file.buffer, 'profile-images');
                payload.profileImg = imageUrl;
            }
            const updated = await user_service_1.default.updateProfile(userId, payload);
            res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current password and new password are required' });
            }
            const result = await user_service_1.default.changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async getPoints(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await user_service_1.default.getPoints(userId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async getCoupons(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await user_service_1.default.getCoupons(userId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map