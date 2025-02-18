import { eq, inArray, sql, SQL } from "drizzle-orm";
import type { InsertType } from "../db/table-types.js";
import { db, type DbTypeOrTransaction } from "../db/index.js";
import { db as database } from "../db/index.js";
import { tasksTable } from "../db/schema/index.js";
import { checkResourceAccess } from "./permissions.js";
import type { AuthCtx } from "../lib/types.js";

export async function createTask(
  authCtx: AuthCtx,
  task: InsertType<"tasksTable">,
  db: DbTypeOrTransaction = database
) {
  await checkResourceAccess(authCtx, task.columnId, "column", "admin", db);

  const [newTask] = await db.insert(tasksTable).values(task).returning();

  return newTask!;
}

export async function updateTaskName(
  authCtx: AuthCtx,
  taskId: string,
  task: Pick<InsertType<"tasksTable">, "name" | "updatedAt">
) {
  await checkResourceAccess(authCtx, taskId, "task", "editor");

  await db.update(tasksTable).set(task).where(eq(tasksTable.id, taskId));
}

export async function updateTasksPosition(
  authCtx: AuthCtx,
  tasks: Pick<InsertType<"tasksTable">, "position" | "columnId" | "id">[]
) {
  const taskIds = tasks.map((task) => task.id);
  const columnIds = [...new Set(tasks.map((task) => task.columnId))];

  await checkResourceAccess(authCtx, columnIds, "column", "editor");
  await checkResourceAccess(authCtx, taskIds, "task", "editor");

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
}

export async function deleteTask(authCtx: AuthCtx, taskId: string) {
  await checkResourceAccess(authCtx, taskId, "task", "admin");
  await db.delete(tasksTable).where(eq(tasksTable.id, taskId));
}
