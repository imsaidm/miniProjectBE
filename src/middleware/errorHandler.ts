import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let errors = undefined;

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        status = 409;
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        status = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        status = 400;
        message = 'Foreign key constraint failed';
        break;
      case 'P2014':
        status = 400;
        message = 'The change you are trying to make would violate the required relation';
        break;
      case 'P2024':
        status = 400;
        message = 'Timed out fetching a new connection from the connection pool';
        break;
      default:
        status = 400;
        message = 'Database operation failed';
    }
  } else if (err instanceof PrismaClientUnknownRequestError) {
    status = 500;
    message = 'Database connection error';
  } else if (err instanceof PrismaClientValidationError) {
    status = 400;
    message = 'Invalid data provided';
  } else if (err.status && typeof err.status === 'number') {
    // Handle custom errors with numeric status codes
    status = err.status;
    message = err.message || 'Internal server error';
    errors = err.errors;
  } else if (err.code && typeof err.code === 'number') {
    // Handle errors with numeric codes
    status = err.code;
    message = err.message || 'Internal server error';
    errors = err.errors;
  } else {
    // Default error handling
    message = err.message || 'Internal server error';
    errors = err.errors;
  }

  res.status(status).json({ message, errors });
}

export default errorHandler;
