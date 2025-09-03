import express from 'express';
import multer from 'multer';
import UserController from '../controllers/user.controller';
import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

const router = express.Router();
const upload = multer();

router.get('/profile', tokenMiddleware, UserController.getProfile);
// Accept both JSON and multipart for profile updates; support both PATCH and PUT
router.patch('/profile', tokenMiddleware, upload.single('profileImg'), UserController.updateProfile);
router.put('/profile', tokenMiddleware, upload.single('profileImg'), UserController.updateProfile);
router.put('/change-password', tokenMiddleware, UserController.changePassword);
router.get('/points', tokenMiddleware, verifyRole('CUSTOMER', 'ADMIN'), UserController.getPoints);
router.get('/coupons', tokenMiddleware, verifyRole('CUSTOMER', 'ADMIN'), UserController.getCoupons);

export default router;
