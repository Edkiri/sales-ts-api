import { Order, PrismaClient } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';
import { ProductService } from '../products/service';
import { PrismaTransactionClient } from 'types';

@Service()
export class OrderService {
  public prisma = new PrismaClient();
  public saleService = Container.get(SaleService);
  public productService = Container.get(ProductService);

  public async createOrder(
    orderData: CreateOrderDto,
    tx?: PrismaTransactionClient | undefined,
  ): Promise<Order> {
    if (!tx) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          return await this.createOrderWithTransaction(orderData, tx);
        });
      } catch (error) {
        throw error;
      } finally {
        await this.prisma.$disconnect();
      }
    }
    return this.createOrderWithTransaction(orderData, tx);
  }

  public async createOrderWithTransaction(
    orderData: CreateOrderDto,
    tx: PrismaTransactionClient,
  ): Promise<Order> {
    if (!orderData.saleId) {
      throw new HttpException(400, `'saleId' is required`);
    }
    const createdOrder = await tx.order.create({
      data: { ...orderData, saleId: orderData.saleId },
    });

    // update product stock
    await this.productService.addOrder(createdOrder, tx);

    // Update sale status
    await this.saleService.checkSaleStatus(createdOrder.saleId, tx);

    return createdOrder;
  }

  public async updateOrder(
    orderId: number,
    data: UpdateOrderDto,
  ): Promise<Order> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingOrder = await tx.order.findFirstOrThrow({
          where: { id: orderId },
        });

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data,
        });

        // If there is order quantity chages, then update products stock
        if (data.quantity) {
          // update product stock removing old order
          await this.productService.removeOrder(existingOrder, tx);

          // update product stock adding updated order
          await this.productService.addOrder(updatedOrder, tx);
        }

        // Update sale status
        await this.saleService.checkSaleStatus(existingOrder.saleId, tx);

        return updatedOrder;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async deleteOrder(
    orderId: number,
    tx?: PrismaTransactionClient | undefined,
  ): Promise<void> {
    if (!tx) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          return await this.deleteOrderWithTransaction(orderId, tx);
        });
      } catch (error) {
        throw error;
      } finally {
        await this.prisma.$disconnect();
      }
    }
    return this.deleteOrderWithTransaction(orderId, tx);
  }

  private async deleteOrderWithTransaction(
    orderId: number,
    tx: PrismaTransactionClient,
  ) {
    const orderToDelete = await tx.order.findFirstOrThrow({
      where: { id: orderId },
    });

    // Update inventory
    await this.productService.removeOrder(orderToDelete, tx);

    // Update sale status
    await this.saleService.checkSaleStatus(orderToDelete.saleId, tx);

    await tx.order.delete({
      where: { id: orderToDelete.id },
    });

    return;
  }
}
