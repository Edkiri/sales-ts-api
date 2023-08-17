import { Payment, PrismaClient } from '@prisma/client';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';
import Container, { Service } from 'typedi';
import { AccountService } from '../accounts/service';
import { PrismaTransactionClient } from 'types';

@Service()
export class PaymentService {
  private prisma = new PrismaClient();
  private saleService = Container.get(SaleService);
  private accountService = Container.get(AccountService);

  public async createPayment(
    paymentData: CreatePaymentDto,
    tx?: PrismaTransactionClient | undefined,
  ): Promise<Payment> {
    if (!tx) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          return await this.createPaymentWithTransaction(paymentData, tx);
        });
      } catch (error) {
        throw error;
      } finally {
        await this.prisma.$disconnect();
      }
    }
    return this.createPaymentWithTransaction(paymentData, tx);
  }

  private async createPaymentWithTransaction(
    paymentData: CreatePaymentDto,
    tx: PrismaTransactionClient,
  ): Promise<Payment> {
    if (!paymentData.saleId) {
      throw new HttpException(400, `'saleId' is required`);
    }

    // Apply account change for the created payment
    await this.accountService.addPayment(paymentData, tx);

    const createdPayment = await tx.payment.create({
      data: { ...paymentData, saleId: paymentData.saleId },
    });

    // Update sale status
    await this.saleService.checkSaleStatus(createdPayment.saleId, tx);

    return createdPayment;
  }

  public async updatePayment(
    paymentId: number,
    data: UpdatePaymentDto,
  ): Promise<Payment> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingPayment = await this.prisma.payment.findFirstOrThrow({
          where: { id: paymentId },
          include: { account: true },
        });

        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data,
        });

        if (data.amount || data.rate) {
          // Revert accpunt change from the original Payment
          await this.accountService.removePayment(existingPayment, tx);

          // Apply accpunt change for the updated Payment
          await this.accountService.addPayment(updatedPayment, tx);
        }

        // Update sale status
        await this.saleService.checkSaleStatus(existingPayment.saleId, tx);

        return updatedPayment;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async deletePayment(
    paymentId: number,
    tx?: PrismaTransactionClient | undefined,
  ): Promise<void> {
    if (!tx) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          return this.deletePaymentWithTransaction(paymentId, tx);
        });
      } catch (error) {
        throw error;
      } finally {
        await this.prisma.$disconnect();
      }
    }
    return this.deletePaymentWithTransaction(paymentId, tx);
  }

  private async deletePaymentWithTransaction(
    paymentId: number,
    tx: PrismaTransactionClient,
  ): Promise<void> {
    const paymentToDelete = await tx.payment.findFirstOrThrow({
      where: { id: paymentId },
    });

    // Update account amount before delete payment
    await this.accountService.removePayment(paymentToDelete, tx);

    // Update sale status
    await this.saleService.checkSaleStatus(paymentToDelete.saleId, tx);

    await tx.payment.delete({
      where: { id: paymentToDelete.id },
    });

    return;
  }
}
