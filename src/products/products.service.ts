import { PrismaClient, Product } from '@prisma/client';
import { Service } from 'typedi';
import { CreateProductDto } from './products.dto';

@Service()
export class ProductService {
  public product = new PrismaClient().product;

  public async createProduct(
    productData: CreateProductDto,
  ): Promise<Product | null> {
    const createdProductData = await this.product.create({
      data: productData,
    });

    return createdProductData;
  }
}
