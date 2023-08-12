import { Container } from 'typedi';
import { SaleService } from './service';
import { CreateSaleDto, UpdateSaleDto } from './dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Tags('sales')
@Route('/api/v1/sales')
export class SaleController extends Controller {
  public sale = Container.get(SaleService);

  @Post()
  @SuccessResponse('201', 'Created')
  @Response(
    409,
    'There is not enough {product_name} in inventory to complete the sale; there are {stock} registered in inventory.',
  )
  @Middlewares(ValidationMiddleware(CreateSaleDto))
  public async createSale(@Body() body: CreateSaleDto) {
    const createdSaleData = await this.sale.createSale(body);
    return createdSaleData;
  }

  @Get()
  public async getSales() {
    const sales = await this.sale.findSales();
    return sales;
  }

  @Patch('/{saleId}')
  @Middlewares(ValidationMiddleware(UpdateSaleDto))
  public async updateSale(@Path() saleId: number, @Body() body: UpdateSaleDto) {
    const updatedSale = await this.sale.updateSale(saleId, body);
    return updatedSale;
  }

  @Get('/{saleId}')
  public async getSale(@Path() saleId: number) {
    const sale = await this.sale.findSaleById(saleId);
    return sale;
  }

  @Delete('/{saleId}')
  @SuccessResponse(204, 'Sale deleted')
  public async deleteSale(@Path('saleId') saleId: number) {
    await this.sale.deleteSaleById(saleId);
  }
}
