import { App } from './app';
import { UserRoute } from './users/users.route';
import { AuthRoute } from './auth/auth.router';
import { SaleRouter } from './sales/sales.route';
import { ClientRouter } from './clients/clients.router';

const app = new App([
  new UserRoute(),
  new AuthRoute(),
  new SaleRouter(),
  new ClientRouter(),
]);

app.listen();
