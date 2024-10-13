import { setCookie } from "hono/cookie";
import {
  createSession,
  generateSessionToken,
  validateRequest,
} from "./auth.js";
import type { AppContext } from "../index.js";

const SESSION_COOKIE_NAME = "session";

export function setSessionTokenCookie(
  c: AppContext,
  token: string,
  expiresAt: Date
): void {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(c: AppContext): void {
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export function getSessionToken(): string | undefined {
  // TODO
  return undefined;
}

export const getCurrentUser = async () => {
  const { user } = await validateRequest();
  return user ?? undefined;
};

export const assertAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    // TODO
    throw new Error("auth error");
  }
  return user;
};

export async function setSession(c: AppContext, userId: number) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  setSessionTokenCookie(c, token, session.expiresAt);
}
