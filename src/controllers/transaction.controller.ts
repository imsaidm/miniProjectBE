import { Request, Response, NextFunction } from 'express';
import TransactionService from '../service/transaction.service';

export class TransactionController {
    async createTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const txn = await TransactionService.createTransaction(userId, req.body);
            res.status(201).json(txn);
        } catch (err) { next(err); }
    }

    async checkSeatAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { items } = req.body;
            await TransactionService.checkSeatAvailability(items);
            res.status(200).json({ available: true });
        } catch (err) { 
            res.status(400).json({ available: false, message: (err as any).message });
        }
    }
    
    async uploadPaymentProof(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            
            if (!req.file) {
                return res.status(400).json({ message: 'Payment proof file is required' });
            }
            
            const result = await TransactionService.uploadPaymentProof(userId, transactionId, req.file);
            res.status(200).json(result);
        } catch (err) { next(err); }
    }
    
    async acceptTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await TransactionService.acceptTransaction(organizerId, transactionId);
            res.status(200).json(txn);
        } catch (err) { next(err); }
    }
    
    async rejectTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await TransactionService.rejectTransaction(organizerId, transactionId);
            res.status(200).json(txn);
        } catch (err) { next(err); }
    }
    
    async cancelTransaction(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const transactionId = parseInt(req.params.transactionId || '0');
            const txn = await TransactionService.cancelTransaction(userId, transactionId);
            res.status(200).json(txn);
        } catch (err) { next(err); }
    }
    
    async getUserTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const txns = await TransactionService.getUserTransactions(userId);
            res.status(200).json(txns);
        } catch (err) { next(err); }
    }
    
    async getAttendeeList(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            const attendees = await TransactionService.getAttendeeList(eventId);
            res.status(200).json(attendees);
        } catch (err) { next(err); }
    }
    
    async getOrganizerTransactions(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventIdParam = req.query.eventId as string | undefined;
            const eventId = eventIdParam ? parseInt(eventIdParam) : undefined;
            const transactions = await TransactionService.getOrganizerTransactions(organizerId, eventId);
            res.status(200).json(transactions);
        } catch (err) { next(err); }
    }
    
    async getTransactionDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const transactionId = parseInt(req.params.transactionId || '0');
            const userId = (req as any).user.id;
            const transaction = await TransactionService.getTransactionDetails(transactionId, userId);
            
            if (!transaction) {
                return res.status(404).json({ message: 'Transaction not found' });
            }
            
            res.status(200).json(transaction);
        } catch (err) { next(err); }
    }
}

export default new TransactionController();
