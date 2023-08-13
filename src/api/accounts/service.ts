import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateAccountDto, UpdateAccountDto } from './dto';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class AccountService {
  public client = new PrismaClient();

  public async createAccount(accountData: CreateAccountDto) {
    const createdAccountData = await this.client.account.create({
      data: accountData,
    });

    return createdAccountData;
  }

  public async findAccounts() {
    const accounts = await this.client.account.findMany();
    return accounts;
  }

  public async findAccountById(accountId: number) {
    const account = await this.client.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new HttpException(404, `Not found account with id ${accountId}`);
    }
    return account;
  }

  public async updateAccount(accountId: number, data: UpdateAccountDto) {
    await this.findAccountById(accountId);
    const updatedAccount = await this.client.account.update({
      where: { id: accountId },
      data,
    });
    return updatedAccount;
  }

  public async softDeleteAccountById(accountId: number) {
    await this.findAccountById(accountId);
    await this.client.account.update({
      where: { id: accountId },
      data: { deletedAt: new Date() },
    });
    return;
  }
}
