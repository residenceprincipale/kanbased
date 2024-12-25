import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  boardPermissionsTable,
  columnsTable,
  tasksTable,
  type ResourcePermission,
} from "../../db/schema/index.js";
import { ApiError } from "../../lib/utils.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
const permissionLevels = {
  owner: 3,
  admin: 2,
  editor: 1,
  viewer: 0,
};

export type ResourceType = "board" | "column" | "task";

/*
  Note: I wanted to handle this in a middleware, but with @hono/zod-openapi
  middlewares are not typesafe, if I get req body like this `c.req.valid("json")`
  You don't get the typesafe req body. It was a bit annoying.
  
  Throwing the error and catching it with the global error handler seemed cleaner and simpler
  I will re-write if If middlewares become typesafe in this package.
 */


/**
 * Checks if the user has the required permission for a given resource.
 * Throws an ApiError with a FORBIDDEN status if the user does not have permission.
 */
export async function checkResourceAccess(
  userId: number,
  resourceId: string,
  resourceType: ResourceType,
  requiredPermission: ResourcePermission
) {

  let query = db
    .select({
      permission: boardPermissionsTable.permission,
    })
    .from(boardPermissionsTable)
    .$dynamic();

  switch (resourceType) {
    case "board":
      query = query.where(
        and(
          eq(boardPermissionsTable.userId, userId),
          eq(boardPermissionsTable.boardId, resourceId)
        )
      );
      break;

    case "column":
      query = query
        .innerJoin(
          columnsTable,
          eq(columnsTable.boardId, boardPermissionsTable.boardId)
        )
        .where(
          and(
            eq(boardPermissionsTable.userId, userId),
            eq(columnsTable.id, resourceId)
          )
        );
      break;

    case "task":
      query = query
        .innerJoin(
          columnsTable,
          eq(columnsTable.boardId, boardPermissionsTable.boardId)
        )
        .innerJoin(tasksTable, eq(tasksTable.columnId, columnsTable.id))
        .where(
          and(
            eq(boardPermissionsTable.userId, userId),
            eq(tasksTable.id, resourceId)
          )
        );
      break;
  }

  const result = await query.execute();

  if (!result?.length || result[0]?.permission == undefined) {
    throw new ApiError("You do not have permission to perform this action.", HTTP_STATUS_CODES.FORBIDDEN);
  }

  const hasPermission =
    permissionLevels[result[0].permission] >=
    permissionLevels[requiredPermission]


  if (!hasPermission) {
    throw new ApiError("You do not have permission to perform this action.", HTTP_STATUS_CODES.FORBIDDEN);
  }

  return true;
}
