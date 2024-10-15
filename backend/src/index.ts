import type { Context } from "hono";

import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";

import {
  authenticatedMiddleware,
  verifySessionMiddleware,
} from "./middlewares/auth.js";
import authRouter from "./router/auth.js";
import boardsRouter from "./router/boards.js";

interface Variables {
  user: any;
  session: any;
}

export interface AppInstanceType {
  Variables: Variables;
}

export type AppContext = Context<AppInstanceType>;

export const app = new OpenAPIHono<{ Variables: Variables }>({
  defaultHook: (result, c) => {
    if (result.success) {
      return;
    }

    return c.json(
      {
        message: result.error.format(),
      },
      422,
    );
  },
});

export type AppInstance = typeof app;

app.use(
  "/*",
  cors({
    // TODO: Change origin later
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(csrf({ origin: "http://localhost:3000" }));

app.use(logger());

// ====== Public routes goes here ======

app.get("/", (c) => {
  return c.json("hello hono");
});

// The OpenAPI documentation.
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Kanban API",
  },
});

// Swagger documentation
app.get(
  "/api-docs",
  swaggerUI({
    url: "/doc",
  }),
);

// ====== end of public routes ======

// Verify if the user is logged in, if yes, adds the `user` object to the context.
app.use("*", verifySessionMiddleware);

// ====== Logged in and non-logged in user routes ======

app.route("/", authRouter);

// ====== End of logged in and non-logged in user routes ======

// Checks for `user` object in the context, if it is not available returns 401.
app.use("*", authenticatedMiddleware);

// ====== Protected routes goes here ======
app.route("/", boardsRouter);
// ====== End of protected routes ======

const port = 5000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${info.port}`);
  },
);
