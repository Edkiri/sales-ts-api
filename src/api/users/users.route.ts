import { Router } from 'express';
import { UserController } from './users.controller';
import { CreateUserDto } from './users.dto';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';
import { Routes } from '../../interfaces/routes.interface';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path: string;
  public router = Router();
  public user = new UserController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.user.getUsers);

    this.router.post(
      `${this.path}`,
      ValidationMiddleware(CreateUserDto),
      this.user.createUser,
    );
  }
}
