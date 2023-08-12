import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto, UpdateSaleDto } from './dto';
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
          include: { orders: true },
        });

        // Delete all orders associated with this sale and update inventory
        const deleteOrders = saleToDelete.orders.map(async (order) => {
          const orderToDelete = await this.prisma.order.findFirstOrThrow({
            where: { id: order.id },
          });

          const product = await transactionalPrisma.product.findUniqueOrThrow({
            where: { id: orderToDelete.productId },
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

          await transactionalPrisma.order.delete({
            where: { id: orderToDelete.id },
          });
        });
        await Promise.all(deleteOrders);
        await transactionalPrisma.sale.delete({ where: { id: saleId } });
      });
      return;
    } catch (error) {
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
