import { db } from "../../db/index.js";
import {
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createTaskRoute, updateTasksRoute } from "./tasks.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { and, count, eq, inArray, sql, SQL } from "drizzle-orm";

const tasksRouter = createAuthenticatedRouter();

tasksRouter.openapi(createTaskRoute, async (c) => {
  const userId = c.get("user").id;
  const body = c.req.valid("json");

  // Validate that the column exists and belongs to the user's board
  const columns = await db
    .select({ id: columnsTable.id })
    .from(columnsTable)
    .where(eq(columnsTable.id, body.columnId))
    .innerJoin(
      boardsTable,
      and(
        eq(boardsTable.id, columnsTable.boardId),
        eq(boardsTable.userId, userId) // Ensuring the board belongs to the user
      )
    );

  if (!columns.length) {
    return c.json(
      { message: "You do not have permission to perform this action" },
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const [task] = await db.insert(tasksTable).values(body).returning();

  return c.json(task, HTTP_STATUS_CODES.OK);
});

tasksRouter.openapi(updateTasksRoute, async (c) => {
  const userId = c.get("user").id;
  const tasks = c.req.valid("json");
  const taskIds = tasks.map((task) => task.id);
  const columnIds = [...new Set(tasks.map((task) => task.columnId))];

  const validColumns = await db
    .select({ id: columnsTable.id })
    .from(columnsTable)
    .where(inArray(columnsTable.id, columnIds))
    .innerJoin(
      boardsTable,
      and(
        eq(boardsTable.id, columnsTable.boardId),
        eq(boardsTable.userId, userId)
      )
    );

  // validates whether the columns belong to the logged in user or not.
  if (validColumns.length !== columnIds.length) {
    return c.json(
      { message: "You are not authorized to perform this action" },
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const validTasks = await db
    .select({ id: tasksTable.id })
    .from(tasksTable)
    .where(inArray(tasksTable.id, taskIds))
    .innerJoin(columnsTable, eq(columnsTable.id, tasksTable.columnId))
    .innerJoin(
      boardsTable,
      and(
        eq(boardsTable.id, columnsTable.boardId),
        eq(boardsTable.userId, userId)
      )
    );

  if (validTasks.length !== taskIds.length) {
    return c.json(
      { message: "You are not authorized to perform this action" },
      HTTP_STATUS_CODES.FORBIDDEN
    );
  }

  const sqlChunksForPosition: SQL[] = [];
  const sqlChunksForColumnId: SQL[] = [];

  sqlChunksForPosition.push(sql`(case`);
  sqlChunksForColumnId.push(sql`(case`);

  for (const task of tasks) {
    sqlChunksForPosition.push(
      sql`when ${tasksTable.id} = ${task.id} then ${task.position}::integer`
    );

    sqlChunksForColumnId.push(
      sql`when ${tasksTable.id} = ${task.id} then ${task.columnId}::uuid`
    );
  }
  sqlChunksForPosition.push(sql`end)`);
  sqlChunksForColumnId.push(sql`end)`);

  const finalSqlForPosition: SQL = sql.join(sqlChunksForPosition, sql.raw(" "));
  const finalSqlForColumnId: SQL = sql.join(sqlChunksForColumnId, sql.raw(" "));

  await db
    .update(tasksTable)
    .set({ position: finalSqlForPosition, columnId: finalSqlForColumnId })
    .where(inArray(tasksTable.id, taskIds));

  return c.json({}, HTTP_STATUS_CODES.OK);
});

export default tasksRouter;

/*
  const body = [{taskId: 'task 1', position: 1 }, {taskId: 'task 2', position: 2 }];



 */
