import { UserRoute } from './users/users.route';
import { App } from './app';

const app = new App([new UserRoute()]);

app.listen();
