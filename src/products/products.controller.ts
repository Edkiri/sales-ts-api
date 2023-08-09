import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ProductService } from './products.service';
import { CreateProductDto } from './products.dto';

export class ProductController {
  public product = Container.get(ProductService);

  public createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productData: CreateProductDto = req.body;
      const createProductData = await this.product.createProduct(productData);

      res.status(201).json({ data: createProductData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
