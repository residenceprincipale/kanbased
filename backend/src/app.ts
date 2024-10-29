import authRouter from "./api/auth/auth.router.js";
import boardsRouter from "./api/boards/boards.router.js";
import syncRouter from "./api/sync/sync.router.js";
import usersRouter from "./api/users/users.router.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

app.get("/", (c) => {
  return c.json("hello hono");
});

const routes = [authRouter, boardsRouter, usersRouter, syncRouter];

routes.forEach((route) => {
  app.route("/", route);
});
