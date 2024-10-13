import { createMiddleware } from "hono/factory";
import { deleteSessionTokenCookie, getSessionToken } from "../lib/session.js";
import { validateRequest } from "../lib/auth.js";

export const verifySessionMiddleware = createMiddleware(async (c, next) => {
  // const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  const sessionId = getSessionToken();

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await validateRequest();

  if (!session) {
    deleteSessionTokenCookie(c);
  }

  c.set("user", user);
  c.set("session", session);

  return next();
});

export const authenticatedMiddleware = createMiddleware(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Un-authorized access" }, 401);
  }

  return next();
});
