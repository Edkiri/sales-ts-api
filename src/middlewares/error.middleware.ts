import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';
import { config } from '../config';

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const stack = config.env === 'development' ? error.stack : '';

    res.status(status).json({
      status,
      message,
      stack,
    });
  } catch (err) {
    next(err);
  }
};
