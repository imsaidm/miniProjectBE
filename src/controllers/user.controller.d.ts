import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    changePassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getPoints(req: Request, res: Response, next: NextFunction): Promise<void>;
    getCoupons(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: UserController;
export default _default;
//# sourceMappingURL=user.controller.d.ts.map