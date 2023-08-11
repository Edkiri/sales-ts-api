import { Controller, Tags, Route, Body, Post, Middlewares } from 'tsoa';
import { Container } from 'typedi';
import { SaleService } from './service';
import { CreateSaleDto } from './dtos/sales.dto';
import { ValidationMiddleware } from '../../middlewares';

@Tags('sales')
@Route('api/v1/sales')
export class SaleController extends Controller {
  public sale = Container.get(SaleService);

  @Post()
  @Middlewares(ValidationMiddleware(CreateSaleDto))
  public async createSale(@Body() body: CreateSaleDto) {
    const createSaleData = await this.sale.createSale(body);
    return createSaleData;
  }
}
