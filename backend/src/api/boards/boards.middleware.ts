import type { AppBindings } from "../../lib/create-app.js";
import { createMiddleware } from "hono/factory";
import type { InferMiddlewares } from "../../lib/types.js";
import { routes } from "./boards.routes.js";

const boardMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  console.log("hello from middleware");

  return next();
});

export const middlewares: InferMiddlewares<typeof routes> = {
  createBoardRoute: [],
  getBoardsRoute: [],
}
