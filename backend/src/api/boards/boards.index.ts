import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { routes } from "./boards.routes.js";
import { handlers } from "./boards.handler.js";
import { registerRouteHandlers } from "../../lib/utils.js";

const boardsRouter = createAuthenticatedRouter();
export default registerRouteHandlers(boardsRouter, routes, handlers);
