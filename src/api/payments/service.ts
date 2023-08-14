import { Payment, PrismaClient } from '@prisma/client';
import { CreatePaymentDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';
import Container, { Service } from 'typedi';

@Service()
export class PaymentService {
  private prisma = new PrismaClient();
  private sale = Container.get(SaleService);

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

        const account = await transactionalPrisma.account.findUniqueOrThrow({
          where: { id: createdPayment.accountId },
        });

        const total = paymentData.rate * paymentData.amount;
        const totalAccount = account.amount + total;

        if (totalAccount < 0) {
          throw new HttpException(422, 'Not enough money on this account');
        }

        await transactionalPrisma.account.update({
          where: { id: account.id },
          data: { amount: { increment: total } },
        });

        // Update sale status
        await this.sale.checkSaleStatus(
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
}
