import type { GoogleTokens } from "arctic";

import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { and, eq, or } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import { db } from "../../db/index.js";
import { accountsTable, profilesTable, usersTable, type User } from "../../db/schema/index.js";
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
  createUser,
  createProfile,
  validatePassword,
  checkLoginAttempts,
  getLoginBlockDuration,
  createEmailVerificationToken,
  verifyEmail,
  sendVerificationEmail,
} from "./auth.utils.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const authRouter = createRouter();

authRouter.openapi(authRoutes.registerUserRoute, async (c) => {
  const body = c.req.valid("json")

  const passwordErrors = await validatePassword(body.password);
  if (passwordErrors.length > 0) {
    return c.json(
      {
        success: false,
        error: {
          name: "ValidationError",
          issues: passwordErrors.map(error => ({
            path: ["password"],
            code: error.code,
            message: error.message,
          })),
        },
        statusCode: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
      },
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
    );
  }

  // Check if user already exists
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, body.email),
  });

  if (existingUser) {
    return c.json(
      {
        success: false,
        error: {
          name: "ValidationError",
          issues: [{
            path: ["email"],
            code: "custom",
            message: "A user with this email already exists. Please login.",
          }],
        },
        statusCode: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
      },
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
    );
  }

  // Create user
  const user = await createUser(body.email);

  // Create account with password
  const hashedPassword = await hashPassword(body.password);
  await db.insert(accountsTable).values({
    userId: user.id,
    accountType: "email",
    password: hashedPassword,
  });

  // Create profile
  await createProfile(user.id, body.name || body.email, null);

  // Create and send verification email
  const verificationToken = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, verificationToken);

  // Set session
  await setSession(c, user.id);

  return c.json({
    email: user.email,
    name: body.name,
  }, HTTP_STATUS_CODES.OK);
});

authRouter.openapi(authRoutes.loginUserRoute, async (c) => {
  const body = await c.req.json();
  const email = body.email || "";

  // Check rate limiting
  if (!checkLoginAttempts(email)) {
    const blockDuration = getLoginBlockDuration(email);
    return c.json(
      {
        success: false,
        error: {
          name: "TooManyRequests",
          message: `Too many login attempts. Please try again in ${Math.ceil(blockDuration / 1000 / 60)} minutes.`,
        },
        statusCode: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
      },
      HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
    );
  }

  // Find user by email
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!user) {
    return c.json({
      name: null,
      email: email,
    }, HTTP_STATUS_CODES.OK);
  }

  // Get account with password
  const account = await db.query.accountsTable.findFirst({
    where: and(
      eq(accountsTable.userId, user.id),
      eq(accountsTable.accountType, "email"),
    ),
  });

  if (!account || !account.password) {
    return c.json({
      name: null,
      email: email,
    }, HTTP_STATUS_CODES.OK);
  }

  // Verify password
  const isPasswordValid = await verifyPassword(body.password, account.password);
  if (!isPasswordValid) {
    return c.json({
      name: null,
      email: email,
    }, HTTP_STATUS_CODES.OK);
  }

  // Set session
  await setSession(c, user.id);

  // Get profile for name
  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, user.id),
  });

  return c.json({
    email: user.email,
    name: profile?.displayName || null,
  }, HTTP_STATUS_CODES.OK);
});

// TODO: Fix type errors
authRouter.openapi(authRoutes.logoutRoute, async (c) => {
  const session = c.get("session");

  // @ts-ignore
  await invalidateSession(session.id);

  // @ts-ignore
  deleteSessionTokenCookie(c);

  return c.json({}, HTTP_STATUS_CODES.OK);
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

authRouter.openapi(authRoutes.verifyEmailRoute, async (c) => {
  const query = c.req.query();
  const token = query.token;
  if (!token) {
    return c.json({
      success: false,
      message: "Verification token is required",
    }, HTTP_STATUS_CODES.OK);
  }

  const success = await verifyEmail(token);

  return c.json({
    success,
    message: success
      ? "Email verified successfully"
      : "Invalid or expired verification token",
  }, HTTP_STATUS_CODES.OK);
});

authRouter.openapi(authRoutes.resendVerificationRoute, async (c) => {
  const user = c.get("user") as User;

  if (user.emailVerified) {
    return c.json({
      success: false,
      message: "Email is already verified",
    }, HTTP_STATUS_CODES.OK);
  }

  const verificationToken = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, verificationToken);

  return c.json({
    success: true,
    message: "Verification email sent",
  }, HTTP_STATUS_CODES.OK);
});

export default authRouter;
