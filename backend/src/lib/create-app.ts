import type { Context as HonoContext } from "hono";

import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import packageJSON from "../../package.json" with { type: "json" };
import {
  authenticatedMiddleware,
  verifySessionMiddleware,
} from "../api/auth/auth.middleware.js";
import { env } from "../env.js";
import { pinoLogger } from "./pino-logger.js";
import type { PinoLogger } from "hono-pino";
import { HTTP_STATUS_CODES, HTTP_STATUS_PHRASES } from "./constants.js";
import type { StatusCode } from "hono/utils/http-status";
import type { User } from "../db/schema/index.js";
import type { Session } from "inspector";

export interface AppBindings {
  Variables: {
    user: User;
    session: Session;
    logger: PinoLogger;
  };
}

export type Context = HonoContext<AppBindings>;

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: result.success,
            error: result.error,
          },
          422,
        );
      }
    },
  });
}

export function createAuthenticatedRouter() {
  const router = createRouter();
  router.use(verifySessionMiddleware, authenticatedMiddleware);
  return router;
}

export default function createApp() {
  const app = createRouter();

  app.use(
    "/*",
    cors({
      // TODO: Change origin later
      origin: "*",
      credentials: true,
    }),
  );

  app.use(csrf({ origin: env.FE_ORIGIN }));
  app.use(pinoLogger());

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

  app.notFound((c) => {
    return c.json(
      {
        message: `${HTTP_STATUS_PHRASES.NOT_FOUND} - ${c.req.path}`,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  });

  app.onError((err, c) => {
    const currentStatus =
      "status" in err ? err.status : c.newResponse(null).status;

    const statusCode =
      currentStatus !== HTTP_STATUS_CODES.OK
        ? (currentStatus as StatusCode)
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    env.NODE_ENV !== "production" && c.var.logger.error(err);

    const data = {
      message: err.message,
      stack: env.NODE_ENV === "production" ? undefined : err.stack,
    };

    console.log(data);

    return c.json(data, statusCode);
  });

  return app;
}

export function createTestApp(router: any) {
  return createApp().route("/", router);
}
