import { Container } from 'typedi';
import { ClientService } from './service';
import { CreateClientDto } from './dto';
import {
  Body,
  Controller,
  Middlewares,
  Post,
  Response,
  Route,
  SuccessResponse,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Route('/api/v1/clients')
export class ClientController extends Controller {
  public client = Container.get(ClientService);

  @Middlewares(ValidationMiddleware(CreateClientDto))
  @Response(422, 'Validation Failed')
  @SuccessResponse('201', 'Created')
  @Post()
  public async createClient(@Body() requestBody: CreateClientDto) {
    const createClientData = await this.client.createClient(requestBody);
    return createClientData;
  }
}
