import { Router } from 'express';
import { AuthController } from './auth.controller';
import { CreateUserDto } from '../users/users.dto';
import { ValidationMiddleware } from '../../middlewares';
import { Routes } from '../../interfaces/routes.interface';
import { Route } from 'tsoa';

@Route('auth')
export class AuthRoute implements Routes {
  public path: string;
  public router = Router();
  public auth = new AuthController();

  constructor(path: string) {
    this.path = path;

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
     * Login - Upon successful login, a cookie will be set to response
     */
    this.router.post(
      `${this.path}/login`,
      ValidationMiddleware(CreateUserDto),
      this.auth.logIn,
    );
  }
}
