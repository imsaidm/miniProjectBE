"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = __importDefault(require("../service/transaction.service"));
class TransactionController {
    async createTransaction(req, res, next) {
        try {
            const userId = req.user.id;
            const txn = await transaction_service_1.default.createTransaction(userId, req.body);
            res.status(201).json(txn);
        }
        catch (err) {
            next(err);
        }
    }
    async checkSeatAvailability(req, res, next) {
        try {
            const { items } = req.body;
            await transaction_service_1.default.checkSeatAvailability(items);
            res.status(200).json({ available: true });
        }
        catch (err) {
            res.status(400).json({ available: false, message: err.message });
        }
    }
    async uploadPaymentProof(req, res, next) {
        try {
            const userId = req.user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            if (!req.file) {
                return res.status(400).json({ message: 'Payment proof file is required' });
            }
            const result = await transaction_service_1.default.uploadPaymentProof(userId, transactionId, req.file);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    async acceptTransaction(req, res, next) {
        try {
            const organizerId = req.user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await transaction_service_1.default.acceptTransaction(organizerId, transactionId);
            res.status(200).json(txn);
        }
        catch (err) {
            next(err);
        }
    }
    async rejectTransaction(req, res, next) {
        try {
            const organizerId = req.user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await transaction_service_1.default.rejectTransaction(organizerId, transactionId);
            res.status(200).json(txn);
        }
        catch (err) {
            next(err);
        }
    }
    async cancelTransaction(req, res, next) {
        try {
            const userId = req.user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await transaction_service_1.default.cancelTransaction(userId, transactionId);
            res.status(200).json(txn);
        }
        catch (err) {
            next(err);
        }
    }
    async getUserTransactions(req, res, next) {
        try {
            const userId = req.user.id;
            const txns = await transaction_service_1.default.getUserTransactions(userId);
            res.status(200).json(txns);
        }
        catch (err) {
            next(err);
        }
    }
    async getAttendeeList(req, res, next) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            const attendees = await transaction_service_1.default.getAttendeeList(eventId);
            res.status(200).json(attendees);
        }
        catch (err) {
            next(err);
        }
    }
    async getOrganizerTransactions(req, res, next) {
        try {
            const organizerId = req.user.id;
            const eventIdParam = req.query.eventId;
            const eventId = eventIdParam ? parseInt(eventIdParam) : undefined;
            const transactions = await transaction_service_1.default.getOrganizerTransactions(organizerId, eventId);
            res.status(200).json(transactions);
        }
        catch (err) {
            next(err);
        }
    }
    async getTransactionDetails(req, res, next) {
        try {
            const transactionId = parseInt(req.params.transactionId || '0');
            const userId = req.user.id;
            const transaction = await transaction_service_1.default.getTransactionDetails(transactionId, userId);
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            res.status(200).json(transaction);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.TransactionController = TransactionController;
exports.default = new TransactionController();
//# sourceMappingURL=transaction.controller.js.map