import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto } from '../dtos/sales.dto';

@Service()
export class SaleService {
  private prisma = new PrismaClient();
  private product = this.prisma.product;

  public async createSale(data: CreateSaleDto): Promise<Sale | null> {
    const { orders, ...saleData } = data;

    let createdSale: Sale | null = null;

    try {
      await this.prisma.$transaction(async (transactionalPrisma) => {
        createdSale = await transactionalPrisma.sale.create({
          data: { ...saleData, orders: { createMany: { data: orders } } },
        });

        const updateProducts = orders.map((order) => {
          return this.product.update({
            data: {
              stock: {
                decrement: order.quantity,
              },
            },
            where: {
              id: order.productId,
            },
          });
        });

        await Promise.all(updateProducts);
      });
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }

    return createdSale;
  }
}
