import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { boardTable, columnTable } from "../../db/schema/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import { createColumnRoute, getColumnsRoute } from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const columnsRouter = createAuthenticatedRouter();

columnsRouter.openapi(createColumnRoute, async (c) => {
  const body = await c.req.valid("json");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, body.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${body.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }

  const [column] = await db
    .insert(columnTable)
    .values({ name: body.name, updatedAt: new Date(), boardId: boards[0]!.boardId, position: body.position, })
    .returning();

  return c.json(column!, HTTP_STATUS_CODES.OK);
});

columnsRouter.openapi(getColumnsRoute, async (c) => {
  const params = c.req.valid("param");

  const boards = await db.select({ boardId: boardTable.id }).from(boardTable).where(eq(boardTable.name, params.boardName));

  if (!boards.length) {
    return c.json({ message: `Cannot find board with name ${params.boardName}` }, HTTP_STATUS_CODES.NOT_FOUND);
  }

  return c.json([], HTTP_STATUS_CODES.OK);
});

export default columnsRouter;
