import { Request, Response, NextFunction } from 'express';
export declare function verifyRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default verifyRole;
//# sourceMappingURL=verifyRole.d.ts.map