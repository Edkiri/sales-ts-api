import { Container } from 'typedi';
import { PaymentService } from './service';
import { CreatePaymentDto } from './dto';
import {
  Body,
  Controller,
  Middlewares,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Tags('payments')
@Route('/api/v1/payments')
export class PaymentController extends Controller {
  public payment = Container.get(PaymentService);

  @Post()
  @SuccessResponse('201', 'Payment Created')
  @Response(409, 'There is an issue with creating the payment.')
  @Middlewares(ValidationMiddleware(CreatePaymentDto))
  public async createPayment(@Body() body: CreatePaymentDto) {
    const createdPaymentData = await this.payment.createPayment(body);
    return createdPaymentData;
  }
}
