import { Order, PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class OrderService {
  private prisma = new PrismaClient();

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
      });
      return createdOrder;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  public async updateOrder(orderId: number, data: UpdateOrderDto) {
    let updatedOrder: Order | null = null;
    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        const existingOrder = await this.prisma.order.findFirstOrThrow({
          where: { id: orderId },
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

          updatedOrder = await transactionalPrisma.order.update({
            where: { id: orderId },
            data,
          });

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
      });
      return;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}