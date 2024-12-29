import authRouter from "./api/auth/auth.index.js";
import boardsRouter from "./api/boards/boards.index.js";
import columnsRouter from "./api/columns/columns.index.js";
import tasksRouter from "./api/tasks/tasks.index.js";
import usersRouter from "./api/users/users.index.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

app.get("/", (c) => {
  return c.html(`
    <html>
      <style>
        * {
        font-family: system-ui, sans-serif;
      }
      </style>
      <head>
        <title>Kanbased API</title>
      </head>
      <body>
        <h1>Api for <a href="https://kanbased.com" target"_blank" rel="noopener noreferrer">Kanbased App</a></h1>
        <h2>Documentation</h2>
        <ul>
          <li><a href="/reference">Scalar Documentation</a></li>
          <li><a href="/doc">OpenAPI Documentation</a></li>
        </ul>
      </body>
    </html>
    `)
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
