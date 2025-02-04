import routes from "./boards.routes.js";
import handlers from "./boards.handler.js";
import middlewares from "./boards.middleware.js";
import { registerRouteHandlers } from "../../lib/utils.js";
import { createAuthenticatedRouter } from "../../lib/router.js";
const boardsRouter = createAuthenticatedRouter();

registerRouteHandlers(boardsRouter, routes, middlewares, handlers);

export default boardsRouter;
