import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';

/**
 * Receives an error of any type and handles Prisma errors based on
 * https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
 * @param err could be any
 * @param req from express
 * @param res from express
 * @param next from express
 */

export const PrismaErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      throw new HttpException(
        409,
        `field '${err.meta?.target}' already exists in database`,
      );
    }
    if (err.code === 'P2003') {
      const field = (err.meta!.field_name as string).split('_')[1];
      throw new HttpException(
        409,
        // ``,
        `field '${field}' does not exists in database`,
      );
    }
  }

  next(err);
};
