import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { IUserResponse } from '../../interfaces/users.interface';
import { UserService } from './users.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { CreateUserDto } from './users.dto';

export class UserController {
  public user = Container.get(UserService);

  public getUsers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const findAllUsersData = await this.user.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: IUserResponse = await this.user.createUser(
        userData,
      );

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
