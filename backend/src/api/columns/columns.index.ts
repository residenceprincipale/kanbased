import { and, eq, inArray, sql, SQL } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  boardPermissionsTable,
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import * as routes from "./columns.routes.js";
import { type GetColumnsResponse } from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { checkResourceAccess } from "../shared/board-permissions.utils.js";

const columnsRouter = createAuthenticatedRouter();

columnsRouter.openapi(routes.createColumnRoute, async (c) => {
  const userId = c.var.user.id;
  const body = c.req.valid("json");

  await checkResourceAccess(userId, body.boardId, "board", "admin");

  await db.insert(columnsTable).values(body);

  return c.json({}, HTTP_STATUS_CODES.CREATED);
});

columnsRouter.openapi(routes.reorderColumnsRoute, async (c) => {
  const userId = c.var.user.id;
  const columns = c.req.valid("json");
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

  return c.json({}, HTTP_STATUS_CODES.OK);
});

columnsRouter.openapi(routes.getColumnsRoute, async (c) => {
  const userId = c.var.user.id;
  const params = c.req.valid("query");

  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .innerJoin(
      boardPermissionsTable,
      eq(boardPermissionsTable.boardId, boardsTable.id)
    )
    .where(
      and(
        eq(boardsTable.name, params.boardName),
        eq(boardPermissionsTable.userId, userId)
      )
    );

  if (!boards.length) {
    return c.json(
      {
        message: `You do not have access to this resource`,
        statusCode: HTTP_STATUS_CODES.FORBIDDEN,
      },
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const boardId = boards[0]?.boardId;
  if (!boardId) {
    return c.json(
      {
        message: `Invalid board data`,
        statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
    );
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
    .where(inArray(tasksTable.columnId, columns.map(col => col.id)));

  const response: GetColumnsResponse = {
    boardId,
    boardName: params.boardName,
    columns,
    tasks,
  };

  return c.json(response, HTTP_STATUS_CODES.OK);
});

columnsRouter.openapi(routes.updateColumnRoute, async (c) => {
  const userId = c.var.user.id;
  const { columnId } = c.req.valid("param");

  await checkResourceAccess(userId, columnId, "column", "admin");

  const body = c.req.valid("json");

  const [updatedCol] = await db
    .update(columnsTable)
    .set(body)
    .where(eq(columnsTable.id, columnId))
    .returning();

  return c.json(
    { id: updatedCol!.id, name: updatedCol!.name },
    HTTP_STATUS_CODES.OK
  );
});

columnsRouter.openapi(routes.deleteColumnRoute, async (c) => {
  const userId = c.var.user.id;
  const { columnId } = c.req.valid("param");

  await checkResourceAccess(userId, columnId, "column", "admin");

  await db.delete(columnsTable).where(eq(columnsTable.id, columnId));

  return c.json({}, HTTP_STATUS_CODES.OK);
});

export default columnsRouter;
