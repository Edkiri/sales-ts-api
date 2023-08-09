import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { ValidationMiddleware } from '../middlewares';
import { CreateSaleDto } from './dtos/sales.dto';
import { SaleController } from './sales.controller';

export class SaleRouter implements Routes {
  public path: string;
  public router = Router();
  public controller = new SaleController();

  constructor(path: string) {
    this.path = path;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      ValidationMiddleware(CreateSaleDto),
      this.controller.createSale,
    );
  }
}
