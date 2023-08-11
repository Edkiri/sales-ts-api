import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateProductDto, UpdateProductDto } from './dto';
import { HttpException } from '../../exceptions/httpException';

@Service()
export class ProductService {
  public product = new PrismaClient().product;

  public async createProduct(productData: CreateProductDto) {
    const createdProductData = await this.product.create({
      data: productData,
    });

    return createdProductData;
  }

  public async findProducts() {
    const products = await this.product.findMany();
    return products;
  }

  public async findProductById(productId: number) {
    const product = await this.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new HttpException(404, `Not found product with id ${productId}`);
    }
    return product;
  }

  public async updateProduct(productId: number, data: UpdateProductDto) {
    await this.findProductById(productId);
    const updatedProduct = await this.product.update({
      where: { id: productId },
      data,
    });
    return updatedProduct;
  }

  public async deleteProductById(productId: number) {
    await this.findProductById(productId);
    await this.product.delete({ where: { id: productId } });
    return;
  }
}
