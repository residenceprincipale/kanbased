import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
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
    userId: serial("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
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
  userId: serial("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" })
    .unique(),
  displayName: text("displayName"),
  image: text("image"),
});

export const boardTable = pgTable(
  "board",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 20 }).notNull(),
    color: varchar("color", { length: 255 }),
    userId: serial("userId")
      .references(() => userTable.id)
      .notNull(),
  },
  (table) => {
    return {
      uniqueBoardNamePerUser: unique().on(table.name, table.userId),
    };
  },
);

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: serial("userId")
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

