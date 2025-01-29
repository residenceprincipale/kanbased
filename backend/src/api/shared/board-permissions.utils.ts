import { and, eq, inArray } from "drizzle-orm";
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
  resourceId: string | string[],
  resourceType: ResourceType,
  requiredPermission: ResourcePermission
): Promise<void> {
  let query = db
    .select({
      permission: boardPermissionsTable.permission,
      resourceId:
        resourceType === "board"
          ? boardPermissionsTable.boardId
          : resourceType === "column"
            ? columnsTable.id
            : tasksTable.id,
    })
    .from(boardPermissionsTable)
    .$dynamic();

  switch (resourceType) {
    case "board":
      query = query.where(
        and(
          eq(boardPermissionsTable.userId, userId),
          Array.isArray(resourceId)
            ? inArray(boardPermissionsTable.boardId, resourceId)
            : eq(boardPermissionsTable.boardId, resourceId)
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
            Array.isArray(resourceId)
              ? inArray(columnsTable.id, resourceId)
              : eq(columnsTable.id, resourceId)
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
            Array.isArray(resourceId)
              ? inArray(tasksTable.id, resourceId)
              : eq(tasksTable.id, resourceId)
          )
        );
      break;
  }

  const results = await query;

  // Handle case where no results found
  if (!results?.length) {
    throwForbiddenErr();
  }

  if (Array.isArray(resourceId)) {
    // Create a Set of found resource IDs for O(1) lookup
    const foundResourceIds = new Set(results.map(r => r.resourceId));

    // Verify we got back the same number of results as requested IDs
    if (foundResourceIds.size !== resourceId.length) {
      throwForbiddenErr();
    }

    // Check if all requested IDs exist and have sufficient permissions
    for (const id of resourceId) {
      if (!foundResourceIds.has(id)) {
        throwForbiddenErr();
      }
    }
  }

  // Check permissions for all results
  for (const result of results) {
    const hasPermission =
      permissionLevels[result.permission] >=
      permissionLevels[requiredPermission];

    if (!hasPermission) {
      throwForbiddenErr();
    }
  }
}

function throwForbiddenErr() {
  throw new ApiError(
    "You do not have permission to perform this action.",
    HTTP_STATUS_CODES.FORBIDDEN
  );
}