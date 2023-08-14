import { Payment, PrismaClient } from '@prisma/client';
import { CreatePaymentDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';
import Container, { Service } from 'typedi';
import { AccountService } from '../accounts/service';

@Service()
export class PaymentService {
  private prisma = new PrismaClient();
  private saleService = Container.get(SaleService);
  private accountService = Container.get(AccountService);

  public async createPayment(
    paymentData: CreatePaymentDto,
  ): Promise<Payment | null> {
    let createdPayment: Payment | null = null;
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        if (!paymentData.saleId) {
          throw new HttpException(400, `'saleId' is required`);
        }
        createdPayment = await transactionalPrisma.payment.create({
          data: { ...paymentData, saleId: paymentData.saleId },
        });

        await this.accountService.addPayment(
          transactionalPrisma,
          createdPayment,
        );

        // Update sale status
        await this.saleService.checkSaleStatus(
          createdPayment.saleId,
          transactionalPrisma,
        );
      });
      return createdPayment;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async deletePayment(paymentId: number) {
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        const paymentToDelete = await this.prisma.payment.findFirstOrThrow({
          where: { id: paymentId },
        });

        const account = await transactionalPrisma.account.findUniqueOrThrow({
          where: { id: paymentToDelete.accountId },
        });

        // Update inventory after deleting the payment
        await transactionalPrisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            amount: {
              decrement: paymentToDelete.amount,
            },
          },
        });

        await transactionalPrisma.payment.delete({
          where: { id: paymentToDelete.id },
        });

        // Update sale status
        await this.saleService.checkSaleStatus(
          paymentToDelete.saleId,
          transactionalPrisma,
        );
      });
      return;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
