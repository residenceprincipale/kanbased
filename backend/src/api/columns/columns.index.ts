import { and, eq, inArray, sql, SQL } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import {
  createColumnRoute,
  getColumnsRoute,
  updateColumnsRoute,
  type GetColumnsResponse,
} from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { checkResourceAccess } from "../shared/board-permissions.utils.js";

const columnsRouter = createAuthenticatedRouter();

columnsRouter.openapi(createColumnRoute, async (c) => {
  const userId = c.var.user.id;
  const body = c.req.valid("json");

  await checkResourceAccess(userId, body.boardId, "board", "admin");

  await db
    .insert(columnsTable)
    .values(body)

  return c.json({}, HTTP_STATUS_CODES.CREATED);
});

columnsRouter.openapi(updateColumnsRoute, async (c) => {
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

columnsRouter.openapi(getColumnsRoute, async (c) => {
  const userId = c.var.user.id;
  const params = c.req.valid("query");

  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .where(
      eq(boardsTable.name, params.boardName),
    );

  if (!boards.length) {
    return c.json(
      { message: `You do not have access to this resource` },
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const boardId = boards[0]!.boardId;

  await checkResourceAccess(userId, boardId, 'board', 'viewer');

  const result = await db
    .select()
    .from(columnsTable)
    .where(eq(columnsTable.boardId, boardId))
    .leftJoin(tasksTable, eq(tasksTable.columnId, columnsTable.id));

  const response: GetColumnsResponse = {
    boardId,
    boardName: params.boardName,
    columns: [],
    tasks: [],
  };

  const columnMap = new Map<string, GetColumnsResponse["columns"][number]>();

  for (let item of result) {
    if (!columnMap.has(item.columns.id)) {
      columnMap.set(item.columns.id, item.columns);
    }

    if (item.tasks) {
      response.tasks.push(item.tasks);
    }
  }

  response.columns = Array.from(columnMap.values());

  return c.json(response, HTTP_STATUS_CODES.OK);
});

export default columnsRouter;
