import type { StatusCode } from "hono/utils/http-status";
import type { Handler } from "hono";
import type { RouteConfig } from "@hono/zod-openapi";
import type { AppBindings } from "./create-app.js";
import type { InferHandlers } from "./types.js";
import type { OpenAPIHono } from "@hono/zod-openapi";

export class ApiError extends Error {
  statusCode: StatusCode;

  constructor(message: string, statusCode: StatusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "Api Error"
  }
}

export function isUniqueConstraintError(err: any): boolean {
  return err && typeof err === "object" && "code" in err && err.code === "23505";
}

/**
 * Register routes and their handlers to a router in a type-safe way
 * @param router - The router instance to register routes to
 * @param routes - The route definitions
 * @param handlers - The handlers for the routes
 * 
 * @example
 * const router = createAuthenticatedRouter();
 * registerRouteHandlers(router, routes, handlers);
 */
export function registerRouteHandlers<
  TRoutes extends Record<string, RouteConfig>
>(
  router: OpenAPIHono<AppBindings>,
  routes: TRoutes,
  handlers: InferHandlers<TRoutes>
) {
  (Object.keys(routes) as Array<keyof TRoutes>).forEach((key) => {
    router.openapi(routes[key], handlers[key] as Handler<AppBindings>);
  });
  return router;
}