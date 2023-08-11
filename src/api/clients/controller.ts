import { Container } from 'typedi';
import { ClientService } from './service';
import { CreateClientDto, UpdateClientDto } from './dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Middlewares,
  Patch,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { ValidationMiddleware } from '../../middlewares';

@Tags('clients')
@Route('/api/v1/clients')
export class ClientController extends Controller {
  public client = Container.get(ClientService);

  @Post()
  @SuccessResponse('201', 'Created')
  @Middlewares(ValidationMiddleware(CreateClientDto))
  public async createClient(@Body() body: CreateClientDto) {
    const createClientData = await this.client.createClient(body);
    return createClientData;
  }

  @Get()
  public async getClients() {
    const clients = await this.client.findClients();
    return clients;
  }

  @Get('/{clientId}')
  public async getClient(@Path() clientId: number) {
    const clients = await this.client.findClientById(clientId);
    return clients;
  }

  @Patch('/{clientId}')
  @Middlewares(ValidationMiddleware(UpdateClientDto))
  public async updateClient(
    @Path() clientId: number,
    @Body() body: UpdateClientDto,
  ) {
    const clients = await this.client.updateClient(clientId, body);
    return clients;
  }

  @Delete('/:clientId')
  @SuccessResponse(204, 'client deleted')
  public async deleteClient(@Path('clientId') clientId: number) {
    await this.client.deleteClientById(clientId);
  }
}
