import authRouter from "./api/auth/auth.index.js";
import boardsRouter from "./api/boards/boards.index.js";
import columnsRouter from "./api/columns/columns.index.js";
import tasksRouter from "./api/tasks/tasks.index.js";
import usersRouter from "./api/users/users.index.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

app.get("/", (c) => {
  return c.json("hello hono");
});

const routes = [
  authRouter,
  boardsRouter,
  usersRouter,
  columnsRouter,
  tasksRouter,
];

routes.forEach((route) => {
  app.route("/", route);
});
