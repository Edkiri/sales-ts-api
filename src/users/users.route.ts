import { Router } from 'express';
import { UserController } from './users.controller';
import { CreateUserDto } from './users.dto';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { Routes } from 'src/interfaces/routes.interface';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.user.getUsers);

    this.router.post(
      `${this.path}`,
      ValidationMiddleware(CreateUserDto),
      this.user.createUser,
    );
  }
}
