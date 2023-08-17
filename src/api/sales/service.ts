import { PrismaClient, Sale } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CreateSaleDto, UpdateSaleDto } from './dto';
import { SaleStatus } from '../../enums/sale-status..enum';
import { isAlmostCero } from '../../utis/functions';
import { PrismaTransactionClient } from '../../types';
import { OrderService } from '../orders/service';
import { PaymentService } from '../payments/service';

@Service()
export class SaleService {
  private prisma = new PrismaClient();
  private orderService = Container.get(OrderService);
  private paymentService = Container.get(PaymentService);

  public async createSale(data: CreateSaleDto): Promise<Sale> {
    const { orders, payments, ...saleData } = data;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdSale = await tx.sale.create({ data: { ...saleData } });

        const updateProducts = orders.map(async (order) => {
          return this.orderService.createOrder(order, tx);
        });
        await Promise.all(updateProducts);

        const updateAccounts = payments?.map(async (payment) => {
          return this.paymentService.createPayment(payment, tx);
        });
        await Promise.all(updateAccounts || []);

        // Check for sale status
        const newSale = await this.checkSaleStatus(createdSale.id, tx);

        return newSale;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async findSales() {
    const sales = await this.prisma.sale.findMany({
      include: {
        orders: {
          include: { product: true },
        },
        payments: true,
        client: true,
      },
    });
    return sales;
  }

  public async updateSale(saleId: number, data: UpdateSaleDto) {
    const updatedSale = await this.prisma.sale.update({
      where: { id: saleId },
      data,
    });
    return updatedSale;
  }

  public async findSaleById(saleId: number) {
    return await this.prisma.sale.findFirstOrThrow({
      where: { id: saleId },
    });
  }

  public async deleteSaleById(saleId: number): Promise<void> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const saleToDelete = await tx.sale.findFirstOrThrow({
          where: { id: saleId },
          include: {
            orders: { include: { product: true } },
            payments: { include: { account: true } },
          },
        });

        // Delete all orders associated with this sale and update inventory
        const deleteOrders = saleToDelete.orders.map(async (order) => {
          return this.orderService.deleteOrder(order.id, tx);
        });
        await Promise.all(deleteOrders);

        // delete all payments associatd with this sale and update accounts
        const deletePayments = saleToDelete.payments.map(async (payment) => {
          return this.paymentService.deletePayment(payment.id, tx);
        });
        await Promise.all(deletePayments);

        await tx.sale.delete({ where: { id: saleId } });
        return;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async checkSaleStatus(saleId: number, tx: PrismaTransactionClient) {
    const saleToCheck = await tx.sale.findFirstOrThrow({
      where: { id: saleId },
      include: { payments: true, orders: true },
    });
    const totalOrders = saleToCheck.orders.reduce((prev, order) => {
      return prev + order.price * order.quantity;
    }, 0);
    const totalPayments = saleToCheck.payments.reduce((prev, payment) => {
      return prev + payment.amount / payment.rate;
    }, 0);
    const totalSale = totalOrders - totalPayments;

    let status: SaleStatus = SaleStatus.UNPAID;
    if (totalSale < 0) {
      status = SaleStatus.REFUNDING;
    }
    if (isAlmostCero(totalSale)) {
      status = SaleStatus.FINISHED;
    }

    return tx.sale.update({
      where: { id: saleId },
      data: {
        status,
      },
    });
  }
}
