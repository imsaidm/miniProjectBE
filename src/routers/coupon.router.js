"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = __importDefault(require("../controllers/coupon.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = (0, express_1.Router)();
router.get('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), coupon_controller_1.default.getUserCoupons);
router.post('/validate', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), coupon_controller_1.default.validateCoupon);
exports.default = router;
//# sourceMappingURL=coupon.router.js.map