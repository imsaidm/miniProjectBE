"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const multer_1 = __importDefault(require("multer"));
const authValidator_1 = require("../middleware/validator/authValidator");
const token_1 = require("../middleware/token");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post('/register', authValidator_1.registerValidation, auth_controller_1.default.register);
router.post('/login', auth_controller_1.default.login);
router.post('/verify-email', auth_controller_1.default.verifyEmail);
router.patch('/password', token_1.tokenMiddleware, auth_controller_1.default.changePassword);
router.post('/forgot-password', auth_controller_1.default.forgotPassword);
router.post('/reset-password', auth_controller_1.default.resetPassword);
router.patch('/profile', token_1.tokenMiddleware, auth_controller_1.default.updateProfile);
router.patch('/profile/image', token_1.tokenMiddleware, upload.single('profileImg'), auth_controller_1.default.uploadProfileImage);
exports.default = router;
//# sourceMappingURL=auth.router.js.map