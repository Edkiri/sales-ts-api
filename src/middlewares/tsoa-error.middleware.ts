import { Response, Request, NextFunction } from 'express';
import { HttpException } from '../exceptions/httpException';
import { ValidateError } from 'tsoa';

export function tsoaErrorMiddleware(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
): Response | void {
  if (err instanceof ValidateError) {
    next(new HttpException(422, 'Validation Failed', err?.fields));
  }

  next(err);
}
