import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardTable, columnTable, taskTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createColumnRoute, getColumnsRoute, type ColumnWithTasks } from "./tasks.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const tasksRouter = createAuthenticatedRouter();

tasksRouter.openapi(createColumnRoute, async (c) => {
  const body = await c.req.valid("json");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, body.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${body.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }

  const [column] = await db
    .insert(columnTable)
    .values({ name: body.name, updatedAt: new Date(), boardId: boards[0]!.boardId, position: body.position, })
    .returning();

  return c.json(Object.assign(column!, { tasks: [] }), HTTP_STATUS_CODES.OK);
});



tasksRouter.openapi(getColumnsRoute, async (c) => {
  const params = c.req.valid("query");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, params.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${params.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }
  const boardId = boards[0]!.boardId!;

  const result = await db.select().from(columnTable).where(eq(columnTable.boardId, boardId)).leftJoin(taskTable, eq(taskTable.columnId, columnTable.id));

  const columnMap: Map<number, ColumnWithTasks> = result.reduce((columnMap: Map<number, ColumnWithTasks>, item) => {
    if (item.task && columnMap.has(item.task.columnId)) {
      const col = columnMap.get(item.task.columnId)!;
      col.tasks.push(item.task);
    } else {
      const data: ColumnWithTasks = Object.assign(item.column, { tasks: item.task ? [item.task] : [] });
      columnMap.set(item.column.id, data);
    }

    return columnMap;
  }, new Map())

  const response = Array.from(columnMap.values()).sort((a, b) => a.position - b.position);
  return c.json(response, HTTP_STATUS_CODES.OK);
});

export default tasksRouter;
