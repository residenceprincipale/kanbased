import { and, eq, inArray, SQL, sql } from "drizzle-orm";
import type { InsertType } from "../../db/db-table-types.js";
import { db } from "../../db/index.js";
import {
  boardPermissionsTable,
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { checkResourceAccess } from "../shared/board-permissions.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import {
  PermissionError,
  UnprocessableEntityError,
} from "../../lib/error-utils.js";

export async function createColumn(
  userId: number,
  body: InsertType<"columnsTable">
) {
  await checkResourceAccess(userId, body.boardId, "board", "admin");
  await db.insert(columnsTable).values(body);
}

export async function reorderColumns(
  userId: number,
  columns: Pick<InsertType<"columnsTable">, "id" | "position">[]
) {
  const columnIds = columns.map((col) => col.id);

  await checkResourceAccess(userId, columnIds, "column", "editor");

  const sqlChunks: SQL[] = [];
  sqlChunks.push(sql`(case`);

  for (const column of columns) {
    sqlChunks.push(
      sql`when ${columnsTable.id} = ${column.id} then ${sql.raw(`${column.position}::integer`)}`
    );
  }
  sqlChunks.push(sql`end)`);

  const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

  await db
    .update(columnsTable)
    .set({ position: finalSql })
    .where(inArray(columnsTable.id, columnIds));
}

export async function getColumnsAndTasks(userId: number, boardName: string) {
  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .innerJoin(
      boardPermissionsTable,
      eq(boardPermissionsTable.boardId, boardsTable.id)
    )
    .where(
      and(
        eq(boardsTable.name, boardName),
        eq(boardPermissionsTable.userId, userId)
      )
    );

  if (!boards.length) {
    throw new PermissionError({
      message: `You do not have access to this resource`,
      displayMessage: `You do not have access to this resource`,
    });
  }

  const boardId = boards[0]?.boardId;
  if (!boardId) {
    throw new UnprocessableEntityError({
      message: `Invalid board data`,
      displayMessage: `Invalid board data`,
    });
  }

  await checkResourceAccess(userId, boardId, "board", "viewer");

  // First get columns
  const columns = await db
    .select()
    .from(columnsTable)
    .where(eq(columnsTable.boardId, boardId));

  // Then get tasks for these columns
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(
      inArray(
        tasksTable.columnId,
        columns.map((col) => col.id)
      )
    );

  return { columns, tasks, boardId };
}

export async function updateColumnName(userId: number, columnId: string, body: Pick<InsertType<"columnsTable">, 'name'>) {
  await checkResourceAccess(userId, columnId, "column", "admin");

  const [updatedCol] = await db
    .update(columnsTable)
    .set(body)
    .where(eq(columnsTable.id, columnId))
    .returning();

  return updatedCol!;
}

export async function deleteColumn(userId: number, columnId: string) {
  await checkResourceAccess(userId, columnId, "column", "admin");
  await db.delete(columnsTable).where(eq(columnsTable.id, columnId));
}