import {
  text,
  pgTable,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  serial,
  unique,
  integer,
} from "drizzle-orm/pg-core";

export const accountTypeEnum = pgEnum("account_type", [
  "email",
  "github",
  "google",
]);

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).unique().notNull(),
  password: text("password").notNull(),
  verified: boolean("verified").default(false),
  accountType: accountTypeEnum("account_type").notNull(),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const boardTable = pgTable(
  "board",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 20 }).notNull(),
    color: varchar("color", { length: 255 }),
    userId: text("user_id")
      .references(() => userTable.id)
      .notNull(),
    isPinned: boolean("is_pinned").default(false),
  },
  (table) => {
    return {
      uniqueBoardNamePerUser: unique().on(table.name, table.userId),
    };
  }
);
