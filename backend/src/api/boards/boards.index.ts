import { desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardPermissionsTable, boardsTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import * as routes from "./boards.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { isUniqueConstraintError } from "../../lib/utils.js";
import { checkResourceAccess } from "../shared/board-permissions.utils.js";

const boardsRouter = createAuthenticatedRouter();

boardsRouter.openapi(routes.createBoardRoute, async (c) => {
  const body = c.req.valid("json");
  const userId = c.var.user.id;

  try {
    await db.transaction(async (tx) => {
      const [createdBoard] = await tx
        .insert(boardsTable)
        .values({
          name: body.name,
          color: body.color,
          creatorId: userId,
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
        userId,
        createdAt: new Date().toISOString(),
      });
    });

    return c.json({}, HTTP_STATUS_CODES.CREATED);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json(
        { message: "Board name must be unique" },
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Let the global error handler take care of this
    throw err;
  }
});

boardsRouter.openapi(routes.getBoardsRoute, async (c) => {
  const userId = c.var.user.id;

  const boards = await db
    .select({
      id: boardsTable.id,
      name: boardsTable.name,
      color: boardsTable.color,
    })
    .from(boardPermissionsTable)
    .innerJoin(boardsTable, eq(boardPermissionsTable.boardId, boardsTable.id))
    .where(eq(boardPermissionsTable.userId, userId))
    .orderBy(desc(boardsTable.createdAt));

  return c.json(boards, HTTP_STATUS_CODES.OK);
});

boardsRouter.openapi(routes.deleteBoardRoute, async (c) => {
  const userId = c.var.user.id;
  const { boardId } = c.req.valid("param");

  await checkResourceAccess(userId, boardId, "board", "admin");

  await db.delete(boardsTable).where(eq(boardsTable.id, boardId));

  return c.json({}, HTTP_STATUS_CODES.OK);
});

boardsRouter.openapi(routes.editBoardRoute, async (c) => {
  const userId = c.var.user.id;
  const { boardId } = c.req.valid("param");
  const body = c.req.valid("json");

  await checkResourceAccess(userId, boardId, "board", "editor");

  try {
    await db.update(boardsTable).set(body).where(eq(boardsTable.id, boardId));
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return c.json(
        { message: "Board name must be unique" },
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    throw err;
  }

  return c.json({}, HTTP_STATUS_CODES.OK);
});

export default boardsRouter;
