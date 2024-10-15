import { OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, or } from "drizzle-orm";

import type { AppInstanceType } from "../index.js";

import { db } from "../db/index.js";
import { userTable } from "../db/schema/index.js";
import { invalidateSession } from "../lib/auth.js";
import { deleteSessionTokenCookie, setSession } from "../lib/session.js";
import {
  loginUserRoute,
  logoutRoute,
  registerUserRoute,
} from "../route-schema/auth.js";
import { hashPassword, verifyPassword } from "../utils.js";

const authRouter = new OpenAPIHono<AppInstanceType>();

authRouter.openapi(registerUserRoute, async (c) => {
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

authRouter.openapi(loginUserRoute, async (c) => {
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

authRouter.openapi(logoutRoute, async (c) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ message: "Un authorized" }, 401);
  }

  await invalidateSession(session.id);
  deleteSessionTokenCookie(c);

  return c.json({}, 200);
});

export default authRouter;
