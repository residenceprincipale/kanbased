import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as schema from "./schema/index.js";
import { Table } from "drizzle-orm";

type SchemaKeys = {
  [K in keyof typeof schema]: (typeof schema)[K] extends Table ? K : never;
}[keyof typeof schema];

type TablesMap = {
  [K in SchemaKeys]?: {
    insert: ReturnType<typeof createInsertSchema<(typeof schema)[K]>>;
    select: ReturnType<typeof createSelectSchema<(typeof schema)[K]>>;
  };
};

export const zodDbSchema: TablesMap = {
  usersTable: {
    insert: createInsertSchema(schema.usersTable),
    select: createSelectSchema(schema.usersTable),
  },
  accountsTable: {
    insert: createInsertSchema(schema.accountsTable),
    select: createSelectSchema(schema.accountsTable),
  },
  emailVerificationTokensTable: {
    insert: createInsertSchema(schema.emailVerificationTokensTable),
    select: createSelectSchema(schema.emailVerificationTokensTable),
  },
  sessionsTable: {
    insert: createInsertSchema(schema.sessionsTable),
    select: createSelectSchema(schema.sessionsTable),
  },
  profilesTable: {
    insert: createInsertSchema(schema.profilesTable),
    select: createSelectSchema(schema.profilesTable),
  },
  boardsTable: {
    insert: createInsertSchema(schema.boardsTable),
    select: createSelectSchema(schema.boardsTable),
  },
  columnsTable: {
    insert: createInsertSchema(schema.columnsTable),
    select: createSelectSchema(schema.columnsTable),
  },
  tasksTable: {
    insert: createInsertSchema(schema.tasksTable),
    select: createSelectSchema(schema.tasksTable),
  },
} as const;




