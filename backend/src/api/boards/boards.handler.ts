import type { routes } from "./boards.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import { db } from "../../db/index.js";
import { boardsTable } from "../../db/schema/index.js";

import { and, asc, count, eq, isNull } from "drizzle-orm";

import { boardPermissionsTable, columnsTable, tasksTable } from "../../db/schema/index.js";
import { isUniqueConstraintError } from "../../lib/utils.js";
import { checkResourceAccess } from "../shared/board-permissions.utils.js";


export const handlers: InferHandlers<typeof routes> = {
  createBoardRoute: async (c) => {
    const body = c.req.valid("json");
    const userId = c.var.user.id;

    const boards = await db
      .select({ boardId: boardsTable.id })
      .from(boardsTable)
      .where(
        and(
          eq(boardsTable.creatorId, userId),
          eq(boardsTable.name, body.name),
          isNull(boardsTable.deletedAt)
        )
      );

    if (boards.length) {
      return c.json(
        { message: "Board name must be unique", statusCode: HTTP_STATUS_CODES.BAD_REQUEST },
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

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


      await tx.insert(boardPermissionsTable).values({
        boardId: createdBoard!.id,
        permission: "owner",
        userId,
        createdAt: new Date().toISOString(),
      });
    });

    return c.json({}, HTTP_STATUS_CODES.CREATED);

  },

  getBoardsRoute: async (c) => {
    const userId = c.var.user.id;

    const boards = await db
      .select({
        id: boardsTable.id,
        name: boardsTable.name,
        color: boardsTable.color,
        tasksCount: count(tasksTable.id),
        columnsCount: count(columnsTable.id),
      })
      .from(boardsTable)
      .innerJoin(boardPermissionsTable, eq(boardPermissionsTable.boardId, boardsTable.id))
      .leftJoin(columnsTable, eq(columnsTable.boardId, boardsTable.id))
      .leftJoin(tasksTable, eq(tasksTable.columnId, columnsTable.id))
      .where(
        and(
          eq(boardPermissionsTable.userId, userId),
          isNull(boardsTable.deletedAt)
        )
      )
      .groupBy(boardsTable.id)
      .orderBy(asc(boardsTable.createdAt));
    return c.json(boards, HTTP_STATUS_CODES.OK);

  },

  toggleBoardDeleteRoute: async (c) => {
    const userId = c.var.user.id;
    const { boardId } = c.req.valid("param");
    const body = c.req.valid("json");

    await checkResourceAccess(userId, boardId, "board", "admin");

    const [updatedBoard] = await db
      .update(boardsTable)
      .set({ deletedAt: body.deleted ? new Date().toISOString() : null })
      .where(eq(boardsTable.id, boardId))
      .returning();

    return c.json(
      {
        id: updatedBoard!.id,
        name: updatedBoard!.name,
        color: updatedBoard!.color,
      },
      HTTP_STATUS_CODES.OK
    );

  },

  editBoardRoute: async (c) => {
    const userId = c.var.user.id;
    const { boardId } = c.req.valid("param");
    const body = c.req.valid("json");

    await checkResourceAccess(userId, boardId, "board", "editor");

    try {
      await db.update(boardsTable).set(body).where(eq(boardsTable.id, boardId));
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        return c.json(
          { message: "Board name must be unique", statusCode: HTTP_STATUS_CODES.BAD_REQUEST },
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      throw err;
    }

    return c.json({}, HTTP_STATUS_CODES.OK);

  }
};



