import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let message = 'Internal server error';
  let statusCode = 500;

  if (err.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  } else if (err.code === 11000) {
    message = 'Duplicate field value';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e: any) => e.message).join(', ');
    statusCode = 400;
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  res.status(statusCode).json({ success: false, message });
};