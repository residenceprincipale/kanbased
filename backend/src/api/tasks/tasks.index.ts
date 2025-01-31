import { db } from "../../db/index.js";
import {
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createTaskRoute, updateTaskRoute, updateTasksRoute } from "./tasks.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { and, count, eq, inArray, sql, SQL } from "drizzle-orm";
import { checkResourceAccess } from "../shared/board-permissions.utils.js";

const tasksRouter = createAuthenticatedRouter();

tasksRouter.openapi(createTaskRoute, async (c) => {
  const userId = c.var.user.id;
  const body = c.req.valid("json");

  await checkResourceAccess(userId, body.columnId, 'column', 'admin');

  const [task] = await db.insert(tasksTable).values(body).returning();

  return c.json(task, HTTP_STATUS_CODES.OK);
});

tasksRouter.openapi(updateTaskRoute, async (c) => {
  const userId = c.var.user.id;
  const taskId = c.req.valid("param").taskId;
  const body = c.req.valid("json");

  await checkResourceAccess(userId, taskId, 'task', 'editor');
  await db.update(tasksTable).set(body).where(eq(tasksTable.id, taskId));

  return c.json({}, HTTP_STATUS_CODES.OK);
});

tasksRouter.openapi(updateTasksRoute, async (c) => {
  const userId = c.var.user.id
  const tasks = c.req.valid("json");
  const taskIds = tasks.map((task) => task.id);
  const columnIds = [...new Set(tasks.map((task) => task.columnId))];

  await checkResourceAccess(userId, columnIds, 'column', 'editor');
  await checkResourceAccess(userId, taskIds, 'task', 'editor');


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
