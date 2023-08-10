import { AuthRoute } from './api/auth/auth.router';
import { ClientRouter } from './api/clients/clients.router';
import { ProductRouter } from './api/products/products.router';
import { SaleRouter } from './api/sales/sales.route';
import { UserRoute } from './api/users/users.route';
import { App } from './app';

const API_PATH = '/api/v1';

const app = new App([
  new UserRoute(`${API_PATH}/users`),
  new AuthRoute(`${API_PATH}/auth`),
  new SaleRouter(`${API_PATH}/sales`),
  new ClientRouter(`${API_PATH}/clients`),
  new ProductRouter(`${API_PATH}/products`),
]);

app.listen();
