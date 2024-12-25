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
import { ApiError } from "./utils.js";

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
          HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY
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
      origin: env.FE_ORIGIN,
      credentials: true,
    })
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
    })
  );

  app.notFound((c) => {
    return c.json(
      {
        message: `${HTTP_STATUS_PHRASES.NOT_FOUND} - ${c.req.path}`,
      },
      HTTP_STATUS_CODES.NOT_FOUND
    );
  });

  app.onError((err, c) => {
    const isDevelopment = env.NODE_ENV !== "production";
    const statusCode =
      err instanceof ApiError
        ? err.statusCode
        : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

    const data = {
      message:
        err instanceof ApiError
          ? err.message
          : isDevelopment && err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
      stack: err instanceof Error && isDevelopment ? err.stack : undefined,
    };

    isDevelopment && c.var.logger.error(err);

    return c.json(data, statusCode);
  });

  return app;
}

export function createTestApp(router: any) {
  return createApp().route("/", router);
}
