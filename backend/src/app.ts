import authRouter from "./api/auth/auth.router.js";
import boardsRouter from "./api/boards/boards.router.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

app.get("/", (c) => {
  return c.json("hello hono");
});

const routes = [authRouter, boardsRouter];

routes.forEach((route) => {
  app.route("/", route);
});
