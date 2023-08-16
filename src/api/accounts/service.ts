import { Payment } from '@prisma/client';
import { Service } from 'typedi';
import { CreateAccountDto, UpdateAccountDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { CreatePaymentDto } from '../payments/dto';
import prisma from '../../prisma/prisma';
import { PrismaTransactionClient } from 'types';

@Service()
export class AccountService {
  public async createAccount(accountData: CreateAccountDto) {
    const createdAccountData = await prisma.account.create({
      data: accountData,
    });

    return createdAccountData;
  }

  public async findAccounts() {
    const accounts = await prisma.account.findMany();
    return accounts;
  }

  public async findAccountById(accountId: number) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new HttpException(404, `Not found account with id ${accountId}`);
    }
    return account;
  }

  public async updateAccount(accountId: number, data: UpdateAccountDto) {
    await this.findAccountById(accountId);
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data,
    });
    return updatedAccount;
  }

  public async softDeleteAccountById(accountId: number) {
    await this.findAccountById(accountId);
    await prisma.account.update({
      where: { id: accountId },
      data: { deletedAt: new Date() },
    });
    return;
  }

  public async addPayment(
    payment: Payment | CreatePaymentDto,
    tx?: PrismaTransactionClient | undefined,
  ) {
    const prismaClient = tx || prisma;

    const account = await prismaClient.account.findUniqueOrThrow({
      where: { id: payment.accountId },
    });

    const total = payment.rate * payment.amount;
    const totalAccount = account.amount + total;

    if (totalAccount < 0) {
      throw new HttpException(422, 'Not enough money on this account');
    }

    return await prismaClient.account.update({
      where: { id: account.id },
      data: { amount: { increment: total } },
    });
  }

  public async removePayment(
    payment: Payment,
    tx?: PrismaTransactionClient | undefined,
  ) {
    const prismaClient = tx || prisma;

    const account = await prismaClient.account.findUniqueOrThrow({
      where: { id: payment.accountId },
    });

    const total = payment.rate * payment.amount;

    return await prismaClient.account.update({
      where: { id: account.id },
      data: { amount: { decrement: total } },
    });
  }
}
