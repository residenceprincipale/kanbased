import type { GoogleTokens } from "arctic";

import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { and, eq, or } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { db } from "../../db/index.js";
import { accountsTable, usersTable } from "../../db/schema/index.js";
import { env } from "../../env.js";
import { createRouter } from "../../lib/create-app.js";
import * as authRoutes from "./auth.routes.js";
import {
  createGoogleAccount,
  deleteSessionTokenCookie,
  google,
  googleUserSchema,
  hashPassword,
  invalidateSession,
  setSession,
  verifyPassword,
} from "./auth.utils.js";

const authRouter = createRouter();

authRouter.openapi(authRoutes.registerUserRoute, async (c) => {
  const body = await c.req.json();

  const existingAccount = await db
    .select()
    .from(usersTable)
    .where(
      or(eq(usersTable.email, body.email), eq(usersTable.name, body.name)),
    );

  if (existingAccount.length) {
    return c.json(
      {
        message: `A user with this email already exist. Please login`,
      },
      400,
    );
  }

  const hash = await hashPassword(body.password);

  const result = await db
    .insert(usersTable)
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
    .from(usersTable)
    .where(
      and(
        or(eq(usersTable.name, body.name), eq(usersTable.email, body.email)),
        eq(usersTable.accountType, "email"),
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
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["openid", "profile", "email"],
  });

  setCookie(c, "google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "Lax",
  });

  setCookie(c, "google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "Lax",
  });

  return c.redirect(url.toString());
});

authRouter.openapi(authRoutes.googleCallbackRoute, async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = getCookie(c, "google_oauth_state") ?? null;
  const codeVerifier = getCookie(c, "google_code_verifier") ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return c.body(null, 400);
  }
  if (state !== storedState) {
    return c.body(null, 400);
  }

  let tokens: GoogleTokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (err) {
    if (err instanceof OAuth2RequestError) {
      // Invalid code or client credentials
      return c.body(null, 400);
    }

    return c.body(null, 500);
  }

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const data = await response.json();
  const googleUser = googleUserSchema.parse(data);

  const existingAccount = await db.query.accountsTable.findFirst({
    where: eq(accountsTable.googleId, googleUser.sub),
  });

  if (existingAccount) {
    await setSession(c, existingAccount.userId);
    return c.redirect(env.FE_ORIGIN);
  }

  const userId = await createGoogleAccount(googleUser);
  await setSession(c, userId);

  return c.redirect(env.FE_ORIGIN);
});

export default authRouter;
