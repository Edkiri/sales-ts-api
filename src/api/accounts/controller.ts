import { Container } from 'typedi';
import { AccountService } from './service';
import { CreateAccountDto, UpdateAccountDto } from './dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Tags('accounts')
@Route('/api/v1/accounts')
export class AccountController extends Controller {
  public account = Container.get(AccountService);

  @Post()
  @SuccessResponse('201', 'Created')
  @Middlewares(ValidationMiddleware(CreateAccountDto))
  public async createAccount(@Body() body: CreateAccountDto) {
    const createAccountData = await this.account.createAccount(body);
    return createAccountData;
  }

  @Get()
  public async getAccounts() {
    const accounts = await this.account.findAccounts();
    return accounts;
  }

  @Get('/{accountId}')
  public async getAccount(@Path() accountId: number) {
    const account = await this.account.findAccountById(accountId);
    return account;
  }

  @Patch('/{accountId}')
  @Middlewares(ValidationMiddleware(UpdateAccountDto))
  public async updateAccount(
    @Path() accountId: number,
    @Body() body: UpdateAccountDto,
  ) {
    const updatedAccount = await this.account.updateAccount(accountId, body);
    return updatedAccount;
  }

  @Delete('/{accountId}')
  @SuccessResponse(204, 'Account deleted')
  public async deleteAccount(@Path('accountId') accountId: number) {
    await this.account.softDeleteAccountById(accountId);
  }
}
