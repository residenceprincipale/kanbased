import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardPermissionsTable, boardsTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createBoardRoute, getBoardsRoute } from "./boards.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { ApiError } from "../../lib/utils.js";

const boardsRouter = createAuthenticatedRouter();

boardsRouter.openapi(createBoardRoute, async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    await db.transaction(async (tx) => {
      const [createdBoard] = await tx
        .insert(boardsTable)
        .values({
          name: body.name,
          color: body.color,
          userId: user.id,
          createdAt: body.createdAt,
          updatedAt: body.updatedAt,
          id: body.id,
        })
        .returning();

      if (!createdBoard) {
        return tx.rollback();
      }

      await tx.insert(boardPermissionsTable).values({
        boardId: createdBoard.id,
        permission: "owner",
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
    });

    return c.json({}, HTTP_STATUS_CODES.CREATED);
  } catch (err) {
    const isUniqueConstraintError =
      err && typeof err === "object" && "code" in err && err.code === "23505";

    if (isUniqueConstraintError) {
      return c.json(
        { message: "Board name must be unique" },
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    throw new ApiError("An expected error occurred", HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

});

boardsRouter.openapi(getBoardsRoute, async (c) => {
  const user = c.get("user");
  const boards = await db
    .select()
    .from(boardsTable)
    .where(eq(boardsTable.userId, user.id));
  return c.json(boards, 200);
});

export default boardsRouter;
