import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';
import { config } from '../config';
import { IErrorResponse } from '../interfaces/error-response';

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    const errResponse: IErrorResponse = { status, message };

    if (config.env === 'development') errResponse.stack = error.stack;

    res.status(status).json(errResponse);
  } catch (err) {
    next(err);
  }
};
