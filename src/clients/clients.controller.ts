import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { ClientService } from './clients.service';
import { CreateClientDto } from './clients.dto';

export class ClientController {
  public client = Container.get(ClientService);

  public createClient = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const clientData: CreateClientDto = req.body;
      const createClientData = await this.client.createClient(clientData);

      res.status(201).json({ data: createClientData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}
