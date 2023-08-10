import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateUserDto } from './users.dto';
import { IUserResponse } from '../../interfaces/users.interface';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class UserService {
  public user = new PrismaClient().user;

  public async findAllUser(): Promise<IUserResponse[]> {
    const allUser = await this.user.findMany({
      select: {
        id: true,
        role: true,
      },
    });
    return allUser as IUserResponse[];
  }

  public async createUser(userData: CreateUserDto): Promise<IUserResponse> {
    const findUser = await this.user.findUnique({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: IUserResponse = await this.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: UserRole.WORKER,
      },
      select: { id: true, role: true },
    });
    return createUserData;
  }
}
