import { UserRole } from '@prisma/client';

export interface User {
  id?: number;
  email: string;
  password: string;
}

export interface IUserResponse {
  id: number;
  role: UserRole;
}
