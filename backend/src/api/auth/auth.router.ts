import { generateCodeVerifier, generateState } from "arctic";
import { and, eq, or } from "drizzle-orm";
import { setCookie } from "hono/cookie";

import { db } from "../../db/index.js";
import { userTable } from "../../db/schema/index.js";
import { env } from "../../env.js";
import { createRouter } from "../../lib/create-app.js";
import * as authRoutes from "./auth.routes.js";
import { deleteSessionTokenCookie, google, hashPassword, invalidateSession, setSession, verifyPassword } from "./auth.utils.js";

const authRouter = createRouter();

authRouter.openapi(authRoutes.registerUserRoute, async (c) => {
  const body = await c.req.json();

  const existingUser = await db
    .select()
    .from(userTable)
    .where(or(eq(userTable.email, body.email), eq(userTable.name, body.name)));

  if (existingUser.length) {
    return c.json(
      {
        message: `A user with this email already exist. Please login`,
      },
      400,
    );
  }

  const hash = await hashPassword(body.password);

  const result = await db
    .insert(userTable)
    .values({
      email: body.email,
      password: hash,
      name: body.name,
      accountType: "email",
    })
    .returning();

  const { password, ...rest } = result[0]!;
  await setSession(c, rest!.id);

  return c.json(rest, 200);
});

authRouter.openapi(authRoutes.loginUserRoute, async (c) => {
  const body = await c.req.json();

  const [user] = await db
    .select()
    .from(userTable)
    .where(
      and(
        or(eq(userTable.name, body.name), eq(userTable.email, body.email)),
        eq(userTable.accountType, "email"),
      ),
    );

  if (!user) {
    return c.json({ message: "User does not exist, Please sign up." }, 400);
  }

  const isPasswordMatched = await verifyPassword(body.password, user.password);

  if (!isPasswordMatched) {
    return c.json({ message: "Invalid credentials" }, 400);
  }

  await setSession(c, user!.id);

  return c.json({ email: user.email, name: user.name }, 200);
});

authRouter.openapi(authRoutes.logoutRoute, async (c) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ message: "Un authorized" }, 401);
  }

  await invalidateSession(session.id);
  deleteSessionTokenCookie(c);

  return c.json({}, 200);
});

authRouter.openapi(authRoutes.loginGoogleRoute, async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["openid", "profile"],
  });

  setCookie(c, "google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  setCookie(c, "google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax",
  });

  return c.newResponse(null, 302, {
    Location: url.toString(),
  });
});

export default authRouter;
