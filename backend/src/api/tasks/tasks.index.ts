import { db } from "../../db/index.js";
import {
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createTaskRoute } from "./tasks.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { and, count, eq } from "drizzle-orm";

const tasksRouter = createAuthenticatedRouter();

tasksRouter.openapi(createTaskRoute, async (c) => {
  const userId = c.get("user").id;
  const body = c.req.valid("json");

  const columns = await db
    .select({ id: columnsTable.id })
    .from(columnsTable)
    .where(eq(columnsTable.id, body.columnId))
    .innerJoin(
      boardsTable,
      and(
        eq(boardsTable.id, columnsTable.boardId),
        eq(boardsTable.userId, userId),
      ),
    );

  if (!columns.length) {
    return c.json(
      { message: "You do not have permission to perform this action" },
      HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  const [task] = await db.insert(tasksTable).values(body).returning();

  return c.json(task, HTTP_STATUS_CODES.OK);
});

export default tasksRouter;
