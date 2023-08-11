import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../exceptions/httpException';

/**
 * @name ValidationMiddleware
 * @description Allows use of decorator and non-decorator based validation
 * @param type dto
 * @param skipMissingProperties When skipping missing properties
 * @param whitelist Your object, even if an instance of a validation class, must not contain any additional properties that are not defined
 * @param forbidNonWhitelisted If you would rather to have an error thrown when any non-whitelisted properties are present
 */
export const ValidationMiddleware = (
  type: any,
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = false,
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    validateOrReject(dto, {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
    })
      .then(() => {
        req.body = dto;
        next();
      })
      .catch((errors: ValidationError[]) => {
        const errorMessages: string[] = [];

        // Helper function to extract error messages recursively
        const extractErrorMessages = (error: ValidationError) => {
          const children = error.children ?? [];
          errorMessages.push(...Object.values(error.constraints ?? ''));

          children.forEach((child: ValidationError) => {
            extractErrorMessages(child);
          });
        };

        errors.forEach((error: ValidationError) => {
          extractErrorMessages(error);
        });

        const errorMessage = errorMessages.join(', ');
        next(new HttpException(400, errorMessage));
      });
  };
};
