import { Container } from 'typedi';
import { ClientService } from './clients.service';
import { CreateClientDto } from './clients.dto';
import { Body, Controller, Post, Route } from 'tsoa';

@Route('/api/v1/clients')
export class ClientController extends Controller {
  public client = Container.get(ClientService);

  @Post()
  public async createClient(@Body() requestBody: CreateClientDto) {
    const createClientData = await this.client.createClient(requestBody);
    return createClientData;
  }
}
