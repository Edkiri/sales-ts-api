import { Router } from 'express';
import { Routes } from '../../interfaces/routes.interface';
import { ValidationMiddleware } from '../../middlewares';
import { ClientController } from './clients.controller';
import { CreateClientDto } from './clients.dto';

export class ClientRouter implements Routes {
  public path: string;
  public router = Router();
  public controller = new ClientController();

  constructor(path: string) {
    this.path = path;
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
