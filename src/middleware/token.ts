import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme!';

export function tokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: token missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: token missing' });
  }
  try {
    const payload = jwt.verify(token as string, JWT_SECRET as string) as JwtPayload | string;
    if (typeof payload === 'object' && payload !== null) {
      (req as any).user = payload;
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized: token malformed' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: token invalid' });
  }
}

export default tokenMiddleware;
