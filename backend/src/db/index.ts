import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "../env.js";
import * as schema from "./schema/index.js";

export const db = drizzle({
  schema,
  connection: {
    url: env.DATABASE_URL,
    max: env.DB_MIGRATING || env.DB_SEEDING ? 1 : undefined,
    onnotice: env.DB_SEEDING ? () => {} : undefined,
  },
  casing: "snake_case",
});

export type Db = typeof db;
