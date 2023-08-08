import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { ValidationMiddleware } from '../middlewares';
import { CreateSaleDto } from './sales.dto';
import { SaleController } from './sales.controller';

export class SaleRouter implements Routes {
  public path = '/sales';
  public router = Router();
  public controller = new SaleController();

  constructor() {
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
