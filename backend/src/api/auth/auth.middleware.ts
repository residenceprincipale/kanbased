import { createMiddleware } from "hono/factory";

import { validateRequest } from "./auth.utils.js";

export const verifySessionMiddleware = createMiddleware(async (c, next) => {
  const { session, user } = await validateRequest(c);

  if (session) {
    c.set("user", user);
    c.set("session", session);
  }

  return next();
});

export const authenticatedMiddleware = createMiddleware(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Un-authorized access" }, 401);
  }

  return next();
});
