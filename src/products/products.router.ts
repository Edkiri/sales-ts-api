import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { ValidationMiddleware } from '../middlewares';
import { ProductController } from './products.controller';
import { CreateProductDto } from './products.dto';

export class ProductRouter implements Routes {
  public path: string;
  public router = Router();
  public controller = new ProductController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      ValidationMiddleware(CreateProductDto),
      this.controller.createProduct,
    );
  }
}
