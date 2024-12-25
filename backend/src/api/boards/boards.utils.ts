import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  boardPermissionsTable,
  boardsTable,
  columnsTable,
  tasksTable,
} from "../../db/schema/index.js";

const permissionLevels = {
  owner: 3,
  admin: 2,
  editor: 1,
  viewer: 0
};

export async function checkBoardPermission(
  userId: number,
  resourceId: string,
  resourceType: "board" | "column" | "task",
  requiredPermission: "owner" | "admin" | "editor" | "viewer"
) {
  let query = db
    .select({
      permission: boardPermissionsTable.permission
    })
    .from(boardPermissionsTable).$dynamic();

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
        .innerJoin(
          tasksTable,
          eq(tasksTable.columnId, columnsTable.id)
        )
        .where(
          and(
            eq(boardPermissionsTable.userId, userId),
            eq(tasksTable.id, resourceId)
          )
        );
      break;
  }

  const result = await query.execute();

  if (!result?.length || !result[0]?.permission) return false;

  return permissionLevels[result[0].permission] >= permissionLevels[requiredPermission];
}
