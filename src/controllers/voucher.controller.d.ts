import { Request, Response, NextFunction } from 'express';
export declare class VoucherController {
    createVoucher(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateVoucher(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteVoucher(req: Request, res: Response, next: NextFunction): Promise<void>;
    listVouchers(req: Request, res: Response, next: NextFunction): Promise<void>;
    validateVoucher(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: VoucherController;
export default _default;
//# sourceMappingURL=voucher.controller.d.ts.map