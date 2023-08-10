import { Client, PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateClientDto } from './clients.dto';

@Service()
export class ClientService {
  public client = new PrismaClient().client;

  public async createClient(
    clientData: CreateClientDto,
  ): Promise<Client | null> {
    const createdClientData = await this.client.create({
      data: clientData,
    });

    return createdClientData;
  }
}
