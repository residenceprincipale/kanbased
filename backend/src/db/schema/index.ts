import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("accountType", [
  "email",
  "github",
  "google",
]);

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
});

export const accountTable = pgTable(
  "account",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade", }),
    accountType: accountTypeEnum("accountType").notNull(),
    githubId: text("githubId").unique(),
    googleId: text("googleId").unique(),
    password: text("password"),
    salt: text("salt"),
  },
  table => ({
    userIdAccountTypeIdx: index("user_id_account_type_idx").on(
      table.userId,
      table.accountType,
    ),
  }),
);

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  image: text("image"),
});

export const boardTable = pgTable(
  "board",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 255 }),
    userId: integer("userId")
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => {
    return {
      uniqueBoardNamePerUser: unique().on(table.name, table.userId),
    };
  },
);

export const columnTable = pgTable(
  "column",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    boardId: uuid("boardId")
      .references(() => boardTable.id, { onDelete: 'cascade' })
      .notNull(),
    position: integer("order").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => {
    return {
      boardIdIdx: index("columnBoardIdx").on(table.boardId),
    };
  },
)

export const taskTable = pgTable(
  "task",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    columnId: uuid("columnId")
      .references(() => columnTable.id, { onDelete: 'cascade' })
      .notNull(),
    position: integer("order").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt").notNull(),
  },
  (table) => {
    return {
      columnIdIdx: index("columnTaskIdx").on(table.columnId),
    };
  },
)

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: integer("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  table => ({
    userIdIdx: index("sessionsUserIdIdx").on(table.userId),
  }),
);

export type Session = typeof sessionTable.$inferSelect;
export type User = typeof userTable.$inferSelect;

