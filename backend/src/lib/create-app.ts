import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";

import packageJSON from "../../package.json" with { type: "json" };

interface Variables {
  user: any;
  session: any;
}

export function createRouter() {
  return new OpenAPIHono<{ Variables: Variables }>({
    strict: false,
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
}

export default function createApp() {
  const app = createRouter();

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

  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: packageJSON.name,
    },
  });

  app.get(
    "/reference",
    apiReference({
      theme: "kepler",
      layout: "classic",
      defaultHttpClient: {
        targetKey: "javascript",
        clientKey: "fetch",
      },
      spec: {
        url: "/doc",
      },
    }),
  );

  // app.notFound(notFound);
  // app.onError(onError);
  return app;
}

export function createTestApp(router: any) {
  return createApp().route("/", router);
}
