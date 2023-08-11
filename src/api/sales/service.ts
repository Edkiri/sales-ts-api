import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto } from './dtos/sales.dto';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class SaleService {
  private prisma = new PrismaClient();

  public async createSale(data: CreateSaleDto): Promise<Sale | null> {
    const { orders, ...saleData } = data;

    let createdSale: Sale | null = null;

    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        createdSale = await transactionalPrisma.sale.create({
          data: { ...saleData, orders: { createMany: { data: orders } } },
        });

        const updateProducts = orders.map(async (order) => {
          const product = await transactionalPrisma.product.findUniqueOrThrow({
            where: { id: order.productId },
          });

          // Check if there are are enough items in inventory
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
      });
      return createdSale;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
