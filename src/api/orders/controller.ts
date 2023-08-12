import { Container } from 'typedi';
import { OrderService } from './service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import {
  Body,
  Controller,
  Delete,
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
import { SaleService } from '../sales/service';

@Tags('orders')
@Route('/api/v1/orders')
export class OrderController extends Controller {
  public order = Container.get(OrderService);
  public sale = Container.get(SaleService);

  @Post()
  @SuccessResponse('201', 'Created')
  @Response(
    409,
    'There is not enough {product_name} in inventory to complete the sale; there are {stock} registered in inventory.',
  )
  @Middlewares(ValidationMiddleware(CreateOrderDto))
  public async createOrder(@Body() body: CreateOrderDto) {
    const createdOrderData = await this.order.createOrder(body);
    return createdOrderData;
  }

  @Patch('/{orderId}')
  @Middlewares(ValidationMiddleware(UpdateOrderDto))
  @Response(
    409,
    'There is not enough {product_name} in inventory to complete the sale; there are {stock} registered in inventory.',
  )
  public async updateOrder(
    @Path() orderId: number,
    @Body() body: UpdateOrderDto,
  ) {
    const updatedOrder = await this.order.updateOrder(orderId, body);
    return updatedOrder;
  }

  @Delete('/{orderId}')
  @SuccessResponse(204, 'Order deleted')
  public async deleteOrder(@Path('orderId') orderId: number) {
    await this.order.deleteOrder(orderId);
  }
}
