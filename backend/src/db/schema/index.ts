import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  organization as organizationsTable,
  user as usersTable,
} from "./auth-schema.js";

export const boardsTable = pgTable("boards", {
  id: t.uuid().primaryKey(),
  name: t.varchar({ length: 50 }).notNull(),
  color: t.varchar({ length: 255 }),
  createdAt: t.timestamp({ mode: "string" }),
  updatedAt: t.timestamp({ mode: "string" }).notNull(),
  deletedAt: t.timestamp({ mode: "string" }),
  organizationId: t
    .text()
    .references(() => organizationsTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const columnsTable = pgTable(
  "columns",
  {
    id: t.uuid().primaryKey(),
    name: t.varchar({ length: 100 }).notNull(),
    boardId: t
      .uuid()
      .references(() => boardsTable.id, { onDelete: "cascade" })
      .notNull(),
    position: t.integer().notNull(),
    createdAt: t.timestamp({ mode: "string" }),
    updatedAt: t.timestamp({ mode: "string" }).notNull(),
  },
  (table) => [t.index("column_board_idx").on(table.boardId)]
);

export const tasksTable = pgTable(
  "tasks",
  {
    id: t.uuid().primaryKey(),
    name: t.text().notNull(),
    columnId: t
      .uuid()
      .references(() => columnsTable.id, { onDelete: "cascade" })
      .notNull(),
    position: t.doublePrecision().notNull(),
    createdAt: t.timestamp({ mode: "string" }).notNull(),
    updatedAt: t.timestamp({ mode: "string" }).notNull(),
  },
  (table) => [t.index("column_id_idx").on(table.columnId)]
);

export const boardPermissionsTable = pgTable(
  "board_permissions",
  {
    id: t.serial().primaryKey(),
    boardId: t
      .uuid()
      .references(() => boardsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: t
      .text()
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    permission: t.varchar({ length: 255 }).notNull(),
    createdAt: t.timestamp({ mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    // Ensure user can only have one role per board
    t.unique("unique_board_member").on(table.boardId, table.userId),
    t.index("board_members_user_idx").on(table.userId),
    t.index("board_members_board_idx").on(table.boardId),
  ]
);
