import { Order, PrismaClient } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { HttpException } from '../../exceptions/httpException';
import { SaleService } from '../sales/service';

@Service()
export class OrderService {
  private prisma = new PrismaClient();
  private sale = Container.get(SaleService);

  public async createOrder(orderData: CreateOrderDto) {
    let createdOrder: Order | null = null;
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        if (!orderData.saleId) {
          throw new HttpException(400, `'saleId' is required`);
        }
        createdOrder = await transactionalPrisma.order.create({
          data: { ...orderData, saleId: orderData.saleId },
        });

        const product = await transactionalPrisma.product.findUniqueOrThrow({
          where: { id: createdOrder.productId },
        });

        // Check if there are enough items in inventory
        const totalStock = product.stock - orderData.quantity;
        if (totalStock < 0)
          throw new HttpException(
            409,
            `There are not enough '${product.name}' in inventory to complete the sale, there are '${product.stock}' registered in inventory`,
          );

        await transactionalPrisma.product.update({
          where: {
            id: createdOrder.productId,
          },
          data: {
            stock: {
              decrement: orderData.quantity,
            },
          },
        });

        // Update sale status
        await this.sale.checkSaleStatus(
          createdOrder.saleId,
          transactionalPrisma,
        );
      });
      return createdOrder;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async updateOrder(
    orderId: number,
    data: UpdateOrderDto,
  ): Promise<Order | null> {
    let updatedOrder: Order | null = null;
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        const existingOrder = await this.prisma.order.findFirstOrThrow({
          where: { id: orderId },
        });

        updatedOrder = await transactionalPrisma.order.update({
          where: { id: orderId },
          data,
        });

        if (data.quantity) {
          const product = await transactionalPrisma.product.findUniqueOrThrow({
            where: { id: existingOrder.productId },
          });

          // Check if there are enough items in inventory
          const totalStock =
            product.stock + existingOrder.quantity - data.quantity;
          if (totalStock < 0) {
            throw new HttpException(
              409,
              `There are not enough '${product.name}' in inventory to complete the update, there are '${product.stock}' registered in inventory`,
            );
          }

          // Revert stock change from the original order
          await transactionalPrisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              stock: {
                increment: existingOrder.quantity,
              },
            },
          });

          // Apply stock change for the updated order
          await transactionalPrisma.product.update({
            where: {
              id: product.id,
            },
            data: {
              stock: {
                decrement: updatedOrder.quantity,
              },
            },
          });
        }
        // Update sale status
        await this.sale.checkSaleStatus(
          existingOrder.saleId,
          transactionalPrisma,
        );
      });
      return updatedOrder;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async deleteOrder(orderId: number) {
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        const orderToDelete = await this.prisma.order.findFirstOrThrow({
          where: { id: orderId },
        });

        const product = await transactionalPrisma.product.findUniqueOrThrow({
          where: { id: orderToDelete.productId },
        });

        await transactionalPrisma.order.delete({
          where: { id: orderToDelete.id },
        });

        // Update inventory after deleting the order
        await transactionalPrisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              increment: orderToDelete.quantity,
            },
          },
        });

        // Update sale status
        await this.sale.checkSaleStatus(
          orderToDelete.saleId,
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
