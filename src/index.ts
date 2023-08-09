import { App } from './app';
import { UserRoute } from './users/users.route';
import { AuthRoute } from './auth/auth.router';
import { SaleRouter } from './sales/sales.route';
import { ClientRouter } from './clients/clients.router';

const API_PATH = '/api/v1';

const app = new App([
  new UserRoute(`${API_PATH}/users`),
  new AuthRoute(`${API_PATH}/auth`),
  new SaleRouter(`${API_PATH}/sales`),
  new ClientRouter(`${API_PATH}/clients`),
]);

app.listen();
