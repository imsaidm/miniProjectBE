import { Request, Response, NextFunction } from 'express';

export function verifyRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(401).json({ message: 'Unauthorized: no user info' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
    }
    next();
  };
}

export default verifyRole;
