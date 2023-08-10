import { PrismaClient, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { CreateUserDto } from '../users/users.dto';
import { User, IUserResponse } from '../../interfaces/users.interface';
import { HttpException } from '../../exceptions/httpException';
import { DataStoredInToken, TokenData } from '../../interfaces/auth.interface';
import { config } from '../../config';

@Service()
export class AuthService {
  public users = new PrismaClient().user;

  public async signup(userData: CreateUserDto): Promise<IUserResponse> {
    const findUser = await this.users.findUnique({
      where: { email: userData.email },
    });
    if (findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} already exists`,
      );

    const hashedPassword = await hash(userData.password, 10);
    const createUserData = await this.users.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: UserRole.WORKER,
      },
      select: {
        id: true,
        role: true,
      },
    });

    return createUserData;
  }

  public async login(
    userData: CreateUserDto,
  ): Promise<{ cookie: string; userToReturn: IUserResponse }> {
    const findUser = await this.users.findUnique({
      where: { email: userData.email },
    });
    if (!findUser)
      throw new HttpException(
        409,
        `This email ${userData.email} was not found`,
      );

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.password,
    );
    if (!isPasswordMatching)
      throw new HttpException(409, 'Password is not matching');

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    const userToReturn: IUserResponse = {
      id: findUser.id,
      role: findUser.role,
    };

    return { cookie, userToReturn };
  }

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id! };
    const secretKey = config.secretKey;
    const expiresIn: number = 60 * 60;

    return {
      expiresIn,
      token: sign(dataStoredInToken, secretKey, { expiresIn }),
    };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}
