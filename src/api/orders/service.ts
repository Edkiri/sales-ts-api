import { Order, PrismaClient, Sale } from '@prisma/client';
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

  // public async findOrders() {
  //   const orders = await this.prisma.order.findMany();
  //   return orders;
  // }

  // public async findOrderById(orderId: number) {
  //   const order = await this.prisma.order.findUnique({ where: { id: orderId } });
  //   if (!order) {
  //     throw new HttpException(404, `Not found order with id ${orderId}`);
  //   }
  //   return order;
  // }

  // public async updateOrder(orderId: number, data: UpdateOrderDto) {
  //   await this.findOrderById(orderId);
  //   const updatedOrder = await this.prisma.order.update({
  //     where: { id: orderId },
  //     data,
  //   });
  //   return updatedOrder;
  // }

  // public async deleteOrderById(orderId: number) {
  //   await this.findOrderById(orderId);
  //   await this.prisma.order.delete({ where: { id: orderId } });
  //   return;
  // }
}
