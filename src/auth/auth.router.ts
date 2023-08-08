import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { AuthController } from './auth.controller';
import { CreateUserDto } from '../users/users.dto';
import { ValidationMiddleware } from '../middlewares';

export class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Sign up
    this.router.post(
      `${this.path}/signup`,
      ValidationMiddleware(CreateUserDto),
      this.auth.signUp,
    );

    /**
     * Login - Upon successful login, a cookie will be set in the response
     */
    this.router.post(
      `${this.path}/login`,
      ValidationMiddleware(CreateUserDto),
      this.auth.logIn,
    );
  }
}
