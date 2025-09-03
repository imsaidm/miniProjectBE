import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import multer from 'multer';
import { registerValidation } from '../middleware/validator/authValidator';
import { tokenMiddleware } from '../middleware/token';

const router = Router();
const upload = multer();

router.post('/register', registerValidation, AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.patch('/password', tokenMiddleware, AuthController.changePassword);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.patch('/profile', tokenMiddleware, AuthController.updateProfile);
router.patch('/profile/image', tokenMiddleware, upload.single('profileImg'), AuthController.uploadProfileImage);

export default router;
