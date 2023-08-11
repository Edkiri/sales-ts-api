import { PrismaClient } from '@prisma/client';
import { Service } from 'typedi';
import { CreateClientDto, UpdateClientDto } from './dto';
import { HttpException } from '../../exceptions/httpException';

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
    if (!client) {
      throw new HttpException(404, `Not found client with id ${clientId}`);
    }
    return client;
  }

  public async updateClient(clientId: number, data: UpdateClientDto) {
    await this.findClientById(clientId);
    const updatedClient = await this.client.update({
      where: { id: clientId },
      data,
    });
    return updatedClient;
  }

  public async deleteClientById(clientId: number) {
    await this.findClientById(clientId);
    await this.client.delete({ where: { id: clientId } });
    return;
  }
}
