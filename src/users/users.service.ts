import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { User } from '../interfaces/users.interface';
import { CreateUserDto } from './users.dto';
import { HttpException } from '../exceptions/httpException';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.user.findMany();
    return allUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser = await this.user.findUnique({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.user.create({
      data: { ...userData, password: hashedPassword },
    });
    return createUserData;
  }
}
