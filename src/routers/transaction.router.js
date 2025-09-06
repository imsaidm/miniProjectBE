"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = __importDefault(require("../controllers/transaction.controller"));
const token_1 = require("../middleware/token");
const verifyRole_1 = __importDefault(require("../middleware/verifyRole"));
const multer_1 = __importDefault(require("../middleware/multer"));
const router = (0, express_1.Router)();
router.post('/', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), transaction_controller_1.default.createTransaction);
router.post('/:transactionId/payment-proof', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), multer_1.default.single('paymentProof'), transaction_controller_1.default.uploadPaymentProof);
router.patch('/:transactionId/accept', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), transaction_controller_1.default.acceptTransaction);
router.patch('/:transactionId/reject', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), transaction_controller_1.default.rejectTransaction);
router.patch('/:transactionId/cancel', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), transaction_controller_1.default.cancelTransaction);
router.get('/my', token_1.tokenMiddleware, (0, verifyRole_1.default)('CUSTOMER'), transaction_controller_1.default.getUserTransactions);
router.get('/organizer', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), transaction_controller_1.default.getOrganizerTransactions);
router.get('/:transactionId', token_1.tokenMiddleware, transaction_controller_1.default.getTransactionDetails);
router.get('/event/:eventId/attendees', token_1.tokenMiddleware, (0, verifyRole_1.default)('ORGANIZER'), transaction_controller_1.default.getAttendeeList);
exports.default = router;
//# sourceMappingURL=transaction.router.js.map