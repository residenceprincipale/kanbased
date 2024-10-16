import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { GitHub, Google } from "arctic";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import type { Context } from "../../lib/create-app.js";

import { db } from "../../db/index.js";
import {
  type Session,
  sessionTable,
  type User,
  userTable,
} from "../../db/schema/index.js";
import { env } from "../../env.js";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15;
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;
const SESSION_COOKIE_NAME = "session";

export const github = new GitHub(
  env.GITHUB_CLIENT_ID!,
  env.GITHUB_CLIENT_SECRET!,
);

export const google = new Google(
  env.GOOGLE_CLIENT_ID!,
  env.GOOGLE_CLIENT_SECRET!,
  `${env.HOST_NAME}/auth/login/google/callback`,
);

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateRequest(): Promise<SessionValidationResult> {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return { session: null, user: null };
  }
  return validateSessionToken(sessionToken);
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionInDb = await db.query.sessionTable.findFirst({
    where: eq(sessionTable.id, sessionId),
  });
  if (!sessionInDb) {
    return { session: null, user: null };
  }
  if (Date.now() >= sessionInDb.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionInDb.id));
    return { session: null, user: null };
  }
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.id, sessionInDb.userId),
  });

  if (!user) {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionInDb.id));
    return { session: null, user: null };
  }

  if (
    Date.now()
    >= sessionInDb.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS
  ) {
    sessionInDb.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(sessionTable)
      .set({
        expiresAt: sessionInDb.expiresAt,
      })
      .where(eq(sessionTable.id, sessionInDb.id));
  }
  return { session: sessionInDb, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
  await db.delete(sessionTable).where(eq(userTable.id, userId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

const scryptPromise = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptPromise(password, salt, 64);
  return `${salt}:${(key as Buffer).toString("hex")}` as const;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const [salt, key] = hashedPassword.split(":");
  const keyBuffer = Buffer.from(key!, "hex");
  const derivedKey = await scryptPromise(password, salt!, 64);
  return timingSafeEqual(keyBuffer, derivedKey as Buffer);
}

export function setSessionTokenCookie(c: Context, token: string, expiresAt: Date): void {
  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function deleteSessionTokenCookie(c: Context): void {
  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export function getSessionToken(): string | undefined {
  // return cookies().get(SESSION_COOKIE_NAME)?.value;
  return undefined;
}

export async function getCurrentUser() {
  const { user } = await validateRequest();
  return user ?? undefined;
};

export async function setSession(c: Context, userId: number) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  setSessionTokenCookie(c, token, session.expiresAt);
}
