import { Order, PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PrismaTransactionClient } from 'types';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class ProductService {
  public prisma = new PrismaClient();

  public async createProduct(productData: CreateProductDto) {
    const createdProductData = await this.prisma.product.create({
      data: productData,
    });

    return createdProductData;
  }

  public async findProducts() {
    const products = await this.prisma.product.findMany();
    return products;
  }

  public async findProductById(productId: number) {
    const product = await this.prisma.product.findFirstOrThrow({
      where: { id: productId },
    });
    return product;
  }

  public async updateProduct(productId: number, data: UpdateProductDto) {
    await this.findProductById(productId);
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data,
    });
    return updatedProduct;
  }

  public async deleteProductById(productId: number) {
    await this.findProductById(productId);
    await this.prisma.product.delete({ where: { id: productId } });
    return;
  }

  public async addOrder(
    order: Order,
    tx?: PrismaTransactionClient | undefined,
  ) {
    const prismaClient = tx || this.prisma;

    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: order.productId },
    });

    // Check if there are enough items in inventory
    const totalStock = product.stock - order.quantity;
    if (totalStock < 0)
      throw new HttpException(
        409,
        `There are not enough '${product.name}' in inventory`,
      );

    return await prismaClient.product.update({
      where: {
        id: order.productId,
      },
      data: {
        stock: {
          decrement: order.quantity,
        },
      },
    });
  }

  public async removeOrder(
    order: Order,
    tx?: PrismaTransactionClient | undefined,
  ) {
    const prismaClient = tx || this.prisma;

    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: order.productId },
    });

    return await prismaClient.product.update({
      where: {
        id: product.id,
      },
      data: {
        stock: {
          increment: order.quantity,
        },
      },
    });
  }
}
