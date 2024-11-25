import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardTable, columnTable, taskTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createColumnRoute, getColumnsRoute, type GetColumnsResponse } from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const columnsRouter = createAuthenticatedRouter();

columnsRouter.openapi(createColumnRoute, async (c) => {
  const body = await c.req.valid("json");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, body.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${body.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }
  const boardId = boards[0]!.boardId!;

  const [column] = await db
    .insert(columnTable)
    .values(Object.assign(body, { boardId }))
    .returning();

  return c.json(column, HTTP_STATUS_CODES.OK);
});



columnsRouter.openapi(getColumnsRoute, async (c) => {
  const params = c.req.valid("query");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, params.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${params.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }
  const boardId = boards[0]!.boardId!;

  const result = await db.select().from(columnTable).where(eq(columnTable.boardId, boardId)).leftJoin(taskTable, eq(taskTable.columnId, columnTable.id));


  const response: GetColumnsResponse = {
    boardId,
    boardName: params.boardName,
    columns: [],
    tasks: []
  }

  const columnMap = new Map<string, GetColumnsResponse['columns'][number]>();

  for (let item of result) {
    if (!columnMap.has(item.column.id)) {
      columnMap.set(item.column.id, item.column);
    }

    if (item.task) {
      response.tasks.push(item.task);
    }

  }

  response.columns = Array.from(columnMap.values());

  return c.json(response, HTTP_STATUS_CODES.OK);
});

export default columnsRouter;
