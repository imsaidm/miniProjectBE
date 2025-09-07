"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucher_controller_1 = __importDefault(require("../controllers/voucher.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const router = (0, express_1.Router)();
router.post('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), voucher_controller_1.default.createVoucher);
router.patch('/:voucherId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), voucher_controller_1.default.updateVoucher);
router.delete('/:voucherId', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), voucher_controller_1.default.deleteVoucher);
router.get('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), voucher_controller_1.default.listVouchers);
router.post('/validate', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), voucher_controller_1.default.validateVoucher);
exports.default = router;
//# sourceMappingURL=voucher.router.js.map