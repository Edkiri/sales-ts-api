import { UserRoute } from './users/users.route';
import { App } from './app';
import { AuthRoute } from './auth/auth.router';

const app = new App([new UserRoute(), new AuthRoute()]);

app.listen();
