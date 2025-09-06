import { Request, Response, NextFunction } from 'express';
export declare class TransactionController {
    createTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadPaymentProof(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    acceptTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    cancelTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAttendeeList(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrganizerTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTransactionDetails(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: TransactionController;
export default _default;
//# sourceMappingURL=transaction.controller.d.ts.map