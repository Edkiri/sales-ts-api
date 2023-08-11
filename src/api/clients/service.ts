import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateClientDto, UpdateClientDto } from './dto';

@Service()
export class ClientService {
  public client = new PrismaClient().client;

  public async createClient(clientData: CreateClientDto) {
    const createdClientData = await this.client.create({
      data: clientData,
    });

    return createdClientData;
  }

  public async findClients() {
    const clients = await this.client.findMany();
    return clients;
  }

  public async findClientById(clientId: number) {
    const client = await this.client.findUnique({ where: { id: clientId } });
    return client;
  }

  public async updateClient(clientId: number, data: UpdateClientDto) {
    const updatedClient = await this.client.update({
      where: { id: clientId },
      data,
    });
    return updatedClient;
  }

  public async deleteClientById(clientId: number) {
    await this.client.delete({ where: { id: clientId } });
    return;
  }
}
