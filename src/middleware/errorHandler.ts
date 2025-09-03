import { Request, Response, NextFunction } from 'express';


export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.code || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || undefined;
  res.status(status).json({ message, errors });
}

export default errorHandler;
