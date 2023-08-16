import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto, UpdateSaleDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleStatus } from '../../enums/sale-status..enum';
import { isAlmostCero } from '../../utis/functions';
import { PrismaTransactionClient } from '../../types';

@Service()
export class SaleService {
  private prisma = new PrismaClient();

  public async createSale(data: CreateSaleDto): Promise<Sale | null> {
    const { orders, payments, ...saleData } = data;

    let createdSale: Sale | null = null;

    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        createdSale = await transactionalPrisma.sale.create({
          data: {
            ...saleData,
            orders: { createMany: { data: orders } },
            payments: { createMany: { data: payments || [] } },
          },
        });

        const updateProducts = orders.map(async (order) => {
          const product = await transactionalPrisma.product.findUniqueOrThrow({
            where: { id: order.productId },
          });

          // Check if there are enough items in inventory
          const totalStock = product.stock - order.quantity;
          if (totalStock < 0)
            throw new HttpException(
              409,
              `There are not enough '${product.name}' in inventory to complete the sale, there are '${product.stock}' registered in inventory`,
            );

          const updatedProduct = transactionalPrisma.product.update({
            where: {
              id: order.productId,
            },
            data: {
              stock: {
                decrement: order.quantity,
              },
            },
          });
          return updatedProduct;
        });
        await Promise.all(updateProducts);

        if (payments?.length) {
          const updateAccounts = payments?.map(async (payment) => {
            const account = await transactionalPrisma.account.findUniqueOrThrow(
              {
                where: { id: payment.accountId },
              },
            );

            const total = payment.rate * payment.amount;
            const totalAccount = account.amount + total;

            if (totalAccount < 0) {
              throw new HttpException(422, 'Not enough money on this account');
            }

            const updatedAccount = transactionalPrisma.account.update({
              where: { id: account.id },
              data: { amount: { increment: total } },
            });
            return updatedAccount;
          });
          await Promise.all(updateAccounts!);
        }

        // Check for sale status
        createdSale = await this.checkSaleStatus(
          createdSale.id,
          transactionalPrisma,
        );
      });
      return createdSale;
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
          select: {
            id: true,
            price: true,
            quantity: true,
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                brand: true,
                reference: true,
              },
            },
          },
        },
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
    const sale = await this.prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale) {
      throw new HttpException(404, `Not found sale with id ${saleId}`);
    }
    return sale;
  }

  public async deleteSaleById(saleId: number) {
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        const saleToDelete = await transactionalPrisma.sale.findFirstOrThrow({
          where: { id: saleId },
          include: {
            orders: { include: { product: true } },
            payments: { include: { account: true } },
          },
        });

        // Delete all orders associated with this sale and update inventory
        const deleteOrders = saleToDelete.orders.map(async (order) => {
          await transactionalPrisma.product.update({
            where: {
              id: order.product.id,
            },
            data: {
              stock: {
                increment: order.quantity,
              },
            },
          });

          await transactionalPrisma.order.delete({
            where: { id: order.id },
          });
        });
        await Promise.all(deleteOrders);

        // delete all payments associatd with this sale and update accounts
        const deletePayments = saleToDelete.payments.map(async (payment) => {
          await transactionalPrisma.account.update({
            where: {
              id: payment.account.id,
            },
            data: {
              amount: {
                decrement: payment.amount,
              },
            },
          });
          await transactionalPrisma.payment.delete({
            where: { id: payment.id },
          });
        });
        await Promise.all(deletePayments);
        await transactionalPrisma.sale.delete({ where: { id: saleId } });
      });
      return;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async checkSaleStatus(
    saleId: number,
    transactionalPrisma: PrismaTransactionClient,
  ) {
    const saleToCheck = await transactionalPrisma.sale.findFirstOrThrow({
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

    return transactionalPrisma.sale.update({
      where: { id: saleId },
      data: {
        status,
      },
    });
  }
}
