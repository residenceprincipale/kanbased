import type { InsertType } from "../../db/db-table-types.js";
import { db } from "../../db/index.js";
import {
  boardPermissionsTable,
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { and, asc, count, eq, isNull } from "drizzle-orm";
import { checkResourceAccess } from "../../shared/services/board-permissions.js";
import { UnprocessableEntityError } from "../../lib/error-utils.js";

export async function createBoard(
  userId: number,
  body: Omit<InsertType<"boardsTable">, "creatorId">
) {
  const isBoardUnique = await getIsBoardUnique(userId, body.name);

  if (!isBoardUnique) {
    throw new UnprocessableEntityError({
      message: "Board name must be unique",
      displayMessage: "Board name must be unique",
    });
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
}

export async function getIsBoardUnique(userId: number, name: string) {
  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .where(
      and(
        eq(boardsTable.creatorId, userId),
        eq(boardsTable.name, name),
        isNull(boardsTable.deletedAt)
      )
    );

  return boards.length === 0;
}

export function getBoards(userId: number) {
  return db
    .select({
      id: boardsTable.id,
      name: boardsTable.name,
      color: boardsTable.color,
      tasksCount: count(tasksTable.id),
      columnsCount: count(columnsTable.id),
    })
    .from(boardsTable)
    .innerJoin(
      boardPermissionsTable,
      eq(boardPermissionsTable.boardId, boardsTable.id)
    )
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
}

export async function toggleBoardDelete(
  userId: number,
  boardId: string,
  deleted: boolean
) {
  await checkResourceAccess(userId, boardId, "board", "admin");

  const [updatedBoard] = await db
    .update(boardsTable)
    .set({ deletedAt: deleted ? new Date().toISOString() : null })
    .where(eq(boardsTable.id, boardId))
    .returning();

  return updatedBoard!;
}

export async function editBoard(
  userId: number,
  boardId: string,
  body: Omit<InsertType<"boardsTable">, "creatorId" | "id">
) {
  await checkResourceAccess(userId, boardId, "board", "editor");

  const isBoardUnique = await getIsBoardUnique(userId, body.name);

  if (!isBoardUnique) {
    throw new UnprocessableEntityError({
      message: "Board name must be unique",
      displayMessage: "Board name must be unique",
    });
  }

  await db.update(boardsTable).set(body).where(eq(boardsTable.id, boardId));
}
