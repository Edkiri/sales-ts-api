import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { SaleService } from './sales.service';

export class SaleController {
  public sale = Container.get(SaleService);

  public createSale = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userData = req.body;
      const createUserData = await this.sale.createSale(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
