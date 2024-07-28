import { OpenAPIHono } from "@hono/zod-openapi";
import { createBoardRoute, getBoardsRoute } from "../route-schema/boards.js";
import { db } from "../db/index.js";
import { boardTable, userTable } from "../db/schema.js";
import type { AppInstanceType } from "../index.js";
import { eq } from "drizzle-orm";

const boardsRouter = new OpenAPIHono<AppInstanceType>();

boardsRouter.openapi(createBoardRoute, async (c) => {
  const body = await c.req.json();
  const user = c.get("user");

  try {
    const [board] = await db
      .insert(boardTable)
      .values({ name: body.name, color: body.color, userId: user.id })
      .returning();

    return c.json(board!, 200);
  } catch (err) {
    const isUniqueConstraintError =
      err && typeof err === "object" && "code" in err && err.code === "23505";

    if (isUniqueConstraintError) {
      return c.json({ message: "Board name must be unique" }, 400);
    }
  }

  return c.json({ message: "" }, 500);
});

boardsRouter.openapi(getBoardsRoute, async (c) => {
  const user = c.get("user");
  const res = await db
    .select()
    .from(boardTable)
    .where(eq(userTable.id, user.id));

  return c.json(res, 200);
});

export default boardsRouter;
