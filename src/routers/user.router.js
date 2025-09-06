"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.get('/profile', token_1.tokenMiddleware, user_controller_1.default.getProfile);
// Accept both JSON and multipart for profile updates; support both PATCH and PUT
router.patch('/profile', token_1.tokenMiddleware, upload.single('profileImg'), user_controller_1.default.updateProfile);
router.put('/profile', token_1.tokenMiddleware, upload.single('profileImg'), user_controller_1.default.updateProfile);
router.put('/change-password', token_1.tokenMiddleware, user_controller_1.default.changePassword);
router.get('/points', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER', 'ADMIN'), user_controller_1.default.getPoints);
router.get('/coupons', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER', 'ADMIN'), user_controller_1.default.getCoupons);
exports.default = router;
//# sourceMappingURL=user.router.js.map