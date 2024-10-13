import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export const connection = postgres(process.env.DATABASE_URL, {
  max: process.env.DB_MIGRATING || process.env.DB_SEEDING ? 1 : undefined,
  onnotice: process.env.DB_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, { schema });

export type Db = typeof db;
