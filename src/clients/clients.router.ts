import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { ValidationMiddleware } from '../middlewares';
import { ClientController } from './clients.controller';
import { CreateClientDto } from './clients.dto';

export class ClientRouter implements Routes {
  public path = '/clients';
  public router = Router();
  public controller = new ClientController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      ValidationMiddleware(CreateClientDto),
      this.controller.createClient,
    );
  }
}
