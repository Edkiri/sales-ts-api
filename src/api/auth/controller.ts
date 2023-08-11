import { Container } from 'typedi';
import {
  Route,
  Post,
  Controller,
  Body,
  Middlewares,
  Tags,
  SuccessResponse,
} from 'tsoa';
import { AuthService } from './service';
import { CreateUserDto } from './dto';
import { ValidationMiddleware } from '../../middlewares';

@Tags('auth')
@Route('/api/v1/auth')
export class AuthController extends Controller {
  public auth = Container.get(AuthService);

  @Post('/signup')
  @Middlewares(ValidationMiddleware(CreateUserDto))
  public async signUp(@Body() body: CreateUserDto) {
    const signUpUserData = await this.auth.signup(body);
    return signUpUserData;
  }

  @Post('/login')
  @SuccessResponse(200, 'Login successful')
  public async login(@Body() body: CreateUserDto) {
    const { cookie, userToReturn } = await this.auth.login(body);
    this.setHeader('Set-Cookie', cookie);

    return userToReturn;
  }
}
