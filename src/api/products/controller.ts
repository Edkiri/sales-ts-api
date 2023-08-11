import { Container } from 'typedi';
import { ProductService } from './service';
import { CreateProductDto, UpdateProductDto } from './dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Tags('products')
@Route('/api/v1/products')
export class ProductController extends Controller {
  public product = Container.get(ProductService);

  @Post()
  @SuccessResponse('201', 'Created')
  @Middlewares(ValidationMiddleware(CreateProductDto))
  public async createProduct(@Body() body: CreateProductDto) {
    const createdProductData = await this.product.createProduct(body);
    return createdProductData;
  }

  @Get()
  public async getProducts() {
    const products = await this.product.findProducts();
    return products;
  }

  @Get('/{productId}')
  public async getProduct(@Path() productId: number) {
    const product = await this.product.findProductById(productId);
    return product;
  }

  @Patch('/{productId}')
  @Middlewares(ValidationMiddleware(UpdateProductDto))
  public async updateProduct(
    @Path() productId: number,
    @Body() body: UpdateProductDto,
  ) {
    const updatedProduct = await this.product.updateProduct(productId, body);
    return updatedProduct;
  }

  @Delete('/{productId}')
  @SuccessResponse(204, 'Product deleted')
  public async deleteProduct(@Path('productId') productId: number) {
    await this.product.deleteProductById(productId);
  }
}
