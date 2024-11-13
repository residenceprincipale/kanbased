import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createBoardRoute, getBoardsRoute } from "./boards.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const boardsRouter = createAuthenticatedRouter();

boardsRouter.openapi(createBoardRoute, async (c) => {
  const body = await c.req.valid("json");
  const user = c.get("user");

  try {
    const [board] = await db
      .insert(boardTable)
      .values({ name: body.name, color: body.color, userId: user.id, updatedAt: new Date() })
      .returning();

    return c.json(board!, 200);
  }
  catch (err) {
    const isUniqueConstraintError
      = err && typeof err === "object" && "code" in err && err.code === "23505";

    if (isUniqueConstraintError) {
      return c.json({ message: "Board name must be unique" }, HTTP_STATUS_CODES.BAD_REQUEST);
    }

    return c.json({ message: "" }, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

});

boardsRouter.openapi(getBoardsRoute, async (c) => {
  const user = c.get("user");
  const boards = await db.select().from(boardTable).where(eq(boardTable.userId, user.id));
  return c.json(boards, 200);
});

export default boardsRouter;
