import { PrismaClient, Sale } from '@prisma/client';
import { Service } from 'typedi';
import { CreateSaleDto } from './dtos/sales.dto';

@Service()
export class SaleService {
  public sale = new PrismaClient().sale;

  public async createSale(data: CreateSaleDto): Promise<Sale | null> {
    const { orders, ...saleData } = data;
    const createUserData = await this.sale.create({
      data: {
        ...saleData,
        orders: {
          create: orders,
        },
      },
    });

    return createUserData;
  }
}
