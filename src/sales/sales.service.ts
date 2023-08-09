import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto } from './sales.dto';

@Service()
export class SaleService {
  public sale = new PrismaClient().sale;

  public async createSale(saleData: CreateSaleDto): Promise<Sale | null> {
    const createUserData = await this.sale.create({
      data: saleData,
    });

    return createUserData;
  }
}
