import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { GitHub, Google } from "arctic";
import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import type { Context } from "../../lib/create-app.js";

import { db } from "../../db/index.js";
import {
  accountsTable,
  profilesTable,
  type Session,
  sessionsTable,
  type User,
  usersTable,
} from "../../db/schema/index.js";
import { env } from "../../env.js";
import { z } from "zod";

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
  `${env.BE_ORIGIN}/auth/login/google/callback`,
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
  await db.insert(sessionsTable).values(session);
  return session;
}

export async function validateRequest(c: Context): Promise<SessionValidationResult> {
  const sessionToken = getSessionToken(c);
  if (!sessionToken) {
    return { session: null, user: null };
  }
  return validateSessionToken(sessionToken);
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionInDb = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.id, sessionId),
  });
  if (!sessionInDb) {
    return { session: null, user: null };
  }
  if (Date.now() >= sessionInDb.expiresAt.getTime()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionInDb.id));
    return { session: null, user: null };
  }
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, sessionInDb.userId),
  });

  if (!user) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionInDb.id));
    return { session: null, user: null };
  }

  if (
    Date.now()
    >= sessionInDb.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS
  ) {
    sessionInDb.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(sessionsTable)
      .set({
        expiresAt: sessionInDb.expiresAt,
      })
      .where(eq(sessionsTable.id, sessionInDb.id));
  }
  return { session: sessionInDb, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
  await db.delete(sessionsTable).where(eq(usersTable.id, userId));
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

export function getSessionToken(c: Context): string | undefined {
  return getCookie(c, SESSION_COOKIE_NAME);
}

export async function setSession(c: Context, userId: number) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  setSessionTokenCookie(c, token, session.expiresAt);
}

export async function createGoogleAccount(googleUser: GoogleUser) {
  let existingUser = await getUserByEmail(googleUser.email);

  if (!existingUser) {
    existingUser = await createUser(googleUser.email);
  }

  await db
    .insert(accountsTable)
    .values({
      userId: existingUser.id,
      accountType: "google",
      googleId: googleUser.sub,
    })
    .onConflictDoNothing()
    .returning();

  await createProfile(existingUser.id, googleUser.name ?? googleUser.email, googleUser.picture);

  return existingUser.id;
}

export async function createUser(email: string) {
  const [user] = await db
    .insert(usersTable)
    .values({
      email,
    })
    .returning();
  return user!;
}

export async function createProfile(
  userId: number,
  displayName: string,
  image: string | null,
) {
  const [profile] = await db
    .insert(profilesTable)
    .values({
      userId,
      image,
      displayName,
    })
    .onConflictDoNothing()
    .returning();
  return profile;
}

export async function getUserByEmail(email: string) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  return user;
}


export const googleUserSchema = z.object({
  name: z.string().nullable(),
  picture: z.string().nullable().default(null),
  email: z.string(),
  sub: z.string()
});

export type GoogleUser = z.infer<typeof googleUserSchema>;