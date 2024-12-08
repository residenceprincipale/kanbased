import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const accountTypeEnum = t.pgEnum("accountType", [
  "email",
  "github",
  "google",
]);

export const usersTable = pgTable("users", {
  id: t.serial().primaryKey(),
  email: t.varchar({ length: 256 }).unique().notNull(),
  emailVerified: t.timestamp({ mode: "date" }),
});

export const accountsTable = pgTable(
  "accounts",
  {
    id: t.serial().primaryKey(),
    userId: t
      .integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accountType: accountTypeEnum().notNull(),
    githubId: t.text().unique(),
    googleId: t.text().unique(),
    password: t.text(),
    salt: t.text(),
  },
  (table) => [
    t.index("user_id_account_type_idx").on(table.userId, table.accountType),
  ],
);

export const sessionsTable = pgTable(
  "sessions",
  {
    id: t.text().primaryKey(),
    userId: t
      .integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: t
      .timestamp({
        withTimezone: true,
        mode: "date",
      })
      .notNull(),
  },
  (table) => [t.index("user_id_idx").on(table.userId)],
);

export const profilesTable = pgTable("profiles", {
  id: t.serial().primaryKey(),
  userId: t
    .integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  displayName: t.text(),
  image: t.text(),
});

export const boardsTable = pgTable(
  "boards",
  {
    id: t.uuid().primaryKey(),
    name: t.varchar({ length: 50 }).notNull(),
    color: t.varchar({ length: 255 }),
    userId: t
      .integer()
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: t.timestamp({ mode: "string" }),
    updatedAt: t.timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    t.unique("unique_board_name_per_user").on(table.name, table.userId),
  ],
);

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
  (table) => [t.index("column_board_idx").on(table.boardId)],
);

export const tasksTable = pgTable(
  "tasks",
  {
    id: t.uuid().primaryKey(),
    name: t.varchar({ length: 100 }).notNull(),
    columnId: t
      .uuid()
      .references(() => columnsTable.id, { onDelete: "cascade" })
      .notNull(),
    position: t.integer().notNull(),
    createdAt: t.timestamp({ mode: "string" }),
    updatedAt: t.timestamp({ mode: "string" }).notNull(),
  },
  (table) => [t.index("column_id_idx").on(table.columnId)],
);

export type Session = typeof sessionsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
