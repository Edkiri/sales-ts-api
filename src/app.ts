import 'reflect-metadata';
import express, { Response, Request } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from '../dist/routes';

import { config } from './config';
import {
  ErrorMiddleware,
  NotFound,
  PrismaErrorMiddleware,
  tsoaErrorMiddleware,
} from './middlewares';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = config.env || 'development';
    this.port = config.port || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`=================================`);
      console.log(`======= ENV: ${this.env} =======`);
      console.log(`🚀 App listening on the port ${this.port}`);
      console.log(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan('dev'));
    this.app.use(cors({ origin: '*', credentials: true }));
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes() {
    RegisterRoutes(this.app);
    this.app.use(
      '/docs',
      swaggerUi.serve,
      async (_req: Request, res: Response) => {
        return res.send(
          swaggerUi.generateHTML(await import('../dist/swagger.json')),
        );
      },
    );
  }

  private initializeErrorHandling() {
    this.app.use(tsoaErrorMiddleware);
    this.app.use(PrismaErrorMiddleware);
    this.app.use(NotFound);
    this.app.use(ErrorMiddleware);
  }
}
