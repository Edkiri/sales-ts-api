import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { UserWithoutPassword } from '../interfaces/users.interface';
import { CreateUserDto } from './users.dto';
import { HttpException } from '../exceptions/httpException';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findAllUser(): Promise<UserWithoutPassword[]> {
    const allUser = await this.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    return allUser as UserWithoutPassword[];
  }

  public async createUser(
    userData: CreateUserDto,
  ): Promise<UserWithoutPassword> {
    const findUser = await this.user.findUnique({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: UserWithoutPassword = await this.user.create({
      data: { ...userData, password: hashedPassword },
      select: { id: true, email: true },
    });
    return createUserData;
  }
}
