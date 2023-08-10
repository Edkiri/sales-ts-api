import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/users.dto';

export class AuthController {
  public auth = Container.get(AuthService);

  public signUp = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData = await this.auth.signup(userData);

      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, userToReturn } = await this.auth.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: userToReturn, message: 'login' });
    } catch (error) {
      next(error);
    }
  };
}
