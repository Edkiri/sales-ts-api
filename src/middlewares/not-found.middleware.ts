import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';

export const NotFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new HttpException(404, `🔍 - Not Found - ${req.originalUrl}`);
  next(error);
};
