import { PrismaClient, Product } from '@prisma/client';
import { Service } from 'typedi';
import { CreateProductDto, UpdateProductDto } from './products.dto';
import { HttpException } from '../../exceptions/httpException';

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
  public async updateProduct(
    productId: number,
    productData: UpdateProductDto,
  ): Promise<Product> {
    const findProduct = await this.product.findUnique({
      where: { id: productId },
    });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    const updateUserData = await this.product.update({
      where: { id: productId },
      data: productData,
    });

    return updateUserData;
  }

  public async findProductById(proudctId: number): Promise<Product> {
    const findProduct = await this.product.findUnique({
      where: { id: proudctId },
    });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    return findProduct;
  }
}
