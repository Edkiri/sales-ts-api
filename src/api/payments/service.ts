import { Payment, PrismaClient } from '@prisma/client';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';
import Container, { Service } from 'typedi';
import { AccountService } from '../accounts/service';

@Service()
export class PaymentService {
  private prisma = new PrismaClient();
  private saleService = Container.get(SaleService);
  private accountService = Container.get(AccountService);

  public async createPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (!paymentData.saleId) {
          throw new HttpException(400, `'saleId' is required`);
        }

        await this.accountService.addPayment(paymentData, tx);

        const createdPayment = await tx.payment.create({
          data: { ...paymentData, saleId: paymentData.saleId },
        });

        // Update sale status
        await this.saleService.checkSaleStatus(createdPayment.saleId, tx);
        return createdPayment;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async updatePayment(
    paymentId: number,
    data: UpdatePaymentDto,
  ): Promise<Payment | null> {
    let updatedPayment: Payment | null = null;
    try {
      await this.prisma.$transaction(async (tx) => {
        const existingPayment = await this.prisma.payment.findFirstOrThrow({
          where: { id: paymentId },
          include: { account: true },
        });

        updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data,
        });

        if (data.amount || data.rate) {
          const account = await tx.account.findUniqueOrThrow({
            where: { id: existingPayment.accountId },
          });

          const amount = data.amount || existingPayment.amount;
          const rate = data.rate || existingPayment.rate;
          const total = amount * rate;

          // Revert stock change from the original Payment
          await tx.account.update({
            where: {
              id: account.id,
            },
            data: {
              amount: {
                decrement: existingPayment.amount * existingPayment.rate,
              },
            },
          });

          // Apply stock change for the updated Payment
          const updatedAccount = await tx.account.update({
            where: {
              id: account.id,
            },
            data: {
              amount: {
                increment: total,
              },
            },
          });

          if (updatedAccount.amount < 0) {
            throw new HttpException(422, 'Not enough money on this account');
          }
        }
        // Update sale status
        await this.saleService.checkSaleStatus(existingPayment.saleId, tx);
      });
      return updatedPayment;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async deletePayment(paymentId: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const paymentToDelete = await this.prisma.payment.findFirstOrThrow({
          where: { id: paymentId },
        });

        const account = await tx.account.findUniqueOrThrow({
          where: { id: paymentToDelete.accountId },
        });

        // Update inventory after deleting the payment
        await tx.account.update({
          where: {
            id: account.id,
          },
          data: {
            amount: {
              decrement: paymentToDelete.amount,
            },
          },
        });

        await tx.payment.delete({
          where: { id: paymentToDelete.id },
        });

        // Update sale status
        await this.saleService.checkSaleStatus(paymentToDelete.saleId, tx);
      });
      return;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
