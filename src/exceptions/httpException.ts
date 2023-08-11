import { FieldErrors } from 'tsoa';

export class HttpException extends Error {
  public status: number;
  public message: string;
  public details: FieldErrors | undefined;

  constructor(
    status: number,
    message: string,
    details?: FieldErrors | undefined,
  ) {
    super(message);
    this.status = status;
    this.message = message;
    this.details = details;
  }
}
