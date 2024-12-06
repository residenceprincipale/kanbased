
import { db } from "../../db/index.js";
import { boardTable, columnTable, taskTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createTaskRoute } from "./tasks.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { and, eq } from "drizzle-orm";

const tasksRouter = createAuthenticatedRouter();

tasksRouter.openapi(createTaskRoute, async (c) => {
  const userId = c.get("user").id;
  const body = c.req.valid("json");

  await db.select({ id: columnTable.id }).from(columnTable).where(eq(columnTable.id, body.columnId)).leftJoin(boardTable, eq(columnTable.boardId, boardTable.id))


  const [task] = await db
    .insert(taskTable)
    .values(body)
    .returning();

  return c.json(task, HTTP_STATUS_CODES.OK);
});


export default tasksRouter;
