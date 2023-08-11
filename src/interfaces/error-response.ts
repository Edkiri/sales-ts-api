import { FieldErrors } from 'tsoa';

export interface IErrorResponse {
  status: number;
  message: string;
  details?: FieldErrors | undefined;
  stack?: string;
}
