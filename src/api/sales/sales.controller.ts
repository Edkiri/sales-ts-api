import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { SaleService } from './services/sales.service';

export class SaleController {
  public sale = Container.get(SaleService);

  public createSale = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const saleData = req.body;
      const createSaleData = await this.sale.createSale(saleData);

      res.status(201).json({ data: createSaleData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
