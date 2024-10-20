import type { GoogleTokens } from "arctic";

import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { and, eq, or } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { db } from "../../db/index.js";
import { accountTable, userTable } from "../../db/schema/index.js";
import { env } from "../../env.js";
import { createRouter } from "../../lib/create-app.js";
import * as authRoutes from "./auth.routes.js";
import { createGoogleAccount, deleteSessionTokenCookie, google, hashPassword, invalidateSession, setSession, verifyPassword } from "./auth.utils.js";

const authRouter = createRouter();

authRouter.openapi(authRoutes.registerUserRoute, async (c) => {
  const body = await c.req.json();

  const existingAccount = await db
    .select()
    .from(userTable)
    .where(or(eq(userTable.email, body.email), eq(userTable.name, body.name)));

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

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
});

authRouter.openapi(authRoutes.googleCallbackRoute, async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = getCookie(c, "google_oauth_state") ?? null;
  const codeVerifier = getCookie(c, "google_code_verifier") ?? null;

  if (code === null || state === null || storedState === null || codeVerifier === null) {
    return new Response(null, {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  let tokens: GoogleTokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  }
  catch (err) {
    if (err instanceof OAuth2RequestError) {
      // Invalid code or client credentials
      return new Response(null, {
        status: 400,
      });
    }

    return new Response(null, {
      status: 500,
    });
  }

  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );

  const googleUser = await response.json() as GoogleUser;

  const existingAccount = await db.query.accountTable.findFirst({
    where: eq(accountTable.googleId, googleUser.sub),
  });

  if (existingAccount) {
    await setSession(c, existingAccount.userId);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const userId = await createGoogleAccount(googleUser);
  await setSession(c, userId);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
});

export default authRouter;

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
