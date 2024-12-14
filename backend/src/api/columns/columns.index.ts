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

const columnsRouter = createAuthenticatedRouter();

columnsRouter.openapi(createColumnRoute, async (c) => {
  const userId = c.get("user").id;
  const body = c.req.valid("json");

  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .where(
      and(eq(boardsTable.name, body.boardName), eq(boardsTable.userId, userId)),
    );

  if (!boards.length) {
    return c.json(
      { message: `Cannot find board with name ${body.boardName}` },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }
  const boardId = boards[0]!.boardId!;

  const [column] = await db
    .insert(columnsTable)
    .values(Object.assign(body, { boardId }))
    .returning();

  return c.json(column, HTTP_STATUS_CODES.OK);
});

columnsRouter.openapi(updateColumnsRoute, async (c) => {
  const userId = c.get("user").id;
  const { boardId, } = c.req.valid("query");
  const columns = c.req.valid("json");

  const boards = await db
    .select({ id: boardsTable.id })
    .from(boardsTable)
    .where(and(eq(boardsTable.id, boardId), eq(boardsTable.userId, userId)));

  if (!boards.length) {
    return c.json(
      { message: `Cannot find board with id ${boardId}` },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const sqlChunks: SQL[] = [];
  const ids: string[] = [];
  sqlChunks.push(sql`(case`);

  for (const column of columns) {
    sqlChunks.push(
      sql`when ${columnsTable.id} = ${column.id} then ${sql.raw(`${column.position}::integer`)}`,
    );
    ids.push(column.id);
  }
  sqlChunks.push(sql`end)`);

  const finalSql: SQL = sql.join(sqlChunks, sql.raw(" "));

  await db
    .update(columnsTable)
    .set({ position: finalSql })
    .where(inArray(columnsTable.id, ids));

  return c.json({}, HTTP_STATUS_CODES.OK);
});

columnsRouter.openapi(getColumnsRoute, async (c) => {
  const userId = c.get("user").id;
  const params = c.req.valid("query");

  const boards = await db
    .select({ boardId: boardsTable.id })
    .from(boardsTable)
    .where(
      and(
        eq(boardsTable.name, params.boardName),
        eq(boardsTable.userId, userId),
      ),
    );

  if (!boards.length) {
    return c.json(
      { message: `Cannot find board with name ${params.boardName}` },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const boardId = boards[0]!.boardId!;

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
