import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: t.text("id").primaryKey(),
  name: t.text('name').notNull(),
  email: t.text('email').notNull().unique(),
  emailVerified: t.boolean('email_verified').notNull(),
  image: t.text('image'),
  createdAt: t.timestamp('created_at').notNull(),
  updatedAt: t.timestamp('updated_at').notNull()
});

export const sessionsTable = pgTable("sessions", {
  id: t.text("id").primaryKey(),
  expiresAt: t.timestamp("expires_at").notNull(),
  token: t.text('token').notNull().unique(),
  createdAt: t.timestamp('created_at').notNull(),
  updatedAt: t.timestamp('updated_at').notNull(),
  ipAddress: t.text('ip_address'),
  userAgent: t.text('user_agent'),
  userId: t.text('user_id').notNull().references(() => usersTable.id)
});

export const accountsTable = pgTable("accounts", {
  id: t.text("id").primaryKey(),
  accountId: t.text("account_id").notNull(),
  providerId: t.text('provider_id').notNull(),
  userId: t.text('user_id').notNull().references(() => usersTable.id),
  accessToken: t.text('access_token'),
  refreshToken: t.text('refresh_token'),
  idToken: t.text('id_token'),
  accessTokenExpiresAt: t.timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at'),
  scope: t.text('scope'),
  password: t.text('password'),
  createdAt: t.timestamp('created_at').notNull(),
  updatedAt: t.timestamp('updated_at').notNull()
});

export const verificationsTable = pgTable("verifications", {
  id: t.text("id").primaryKey(),
  identifier: t.text('identifier').notNull(),
  value: t.text('value').notNull(),
  expiresAt: t.timestamp('expires_at').notNull(),
  createdAt: t.timestamp('created_at'),
  updatedAt: t.timestamp('updated_at')
});


export const accountTypeEnum = t.pgEnum("accountType", [
  "email",
  "github",
  "google",
]);

export const permissionEnum = t.pgEnum("permission", [
  "owner",
  "admin",
  "editor",
  "viewer",
]);

export const profilesTable = pgTable("profiles", {
  id: t.serial().primaryKey(),
  userId: t
    .text()
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
    creatorId: t
      .text()
      .references(() => usersTable.id)
      .notNull(),
    createdAt: t.timestamp({ mode: "string" }),
    updatedAt: t.timestamp({ mode: "string" }).notNull(),
    deletedAt: t.timestamp({ mode: "string" })
  }
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
    permission: permissionEnum().notNull(),
    createdAt: t.timestamp({ mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    // Ensure user can only have one role per board
    t.unique("unique_board_member").on(table.boardId, table.userId),
    t.index("board_members_user_idx").on(table.userId),
    t.index("board_members_board_idx").on(table.boardId),
  ]
);

export type ResourcePermission = (typeof permissionEnum.enumValues)[number];



