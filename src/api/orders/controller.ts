import { Container } from 'typedi';
import { OrderService } from './service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
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
import { SaleService } from '../sales/service';
import { HttpException } from 'src/exceptions/httpException';

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

  // @Get()
  // public async getOrders() {
  //   const orders = await this.order.findOrders();
  //   return orders;
  // }

  // @Patch('/{orderId}')
  // @Middlewares(ValidationMiddleware(UpdateOrderDto))
  // public async updateOrder(@Path() orderId: number, @Body() body: UpdateOrderDto) {
  //   const updatedOrder = await this.order.updateOrder(orderId, body);
  //   return updatedOrder;
  // }

  // @Get('/{orderId}')
  // public async getOrder(@Path() orderId: number) {
  //   const order = await this.order.findOrderById(orderId);
  //   return order;
  // }

  // @Delete('/{orderId}')
  // @SuccessResponse(204, 'Order deleted')
  // public async deleteOrder(@Path('orderId') orderId: number) {
  //   await this.order.deleteOrderById(orderId);
  // }
}
