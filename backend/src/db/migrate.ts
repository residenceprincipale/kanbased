import { migrate } from "drizzle-orm/postgres-js/migrator";

import config from "../../drizzle.config.js";
import { env } from "../env.js";
import { connection, db } from "./index.js";

if (!env.DB_MIGRATING) {
  throw new Error(
    "You must set DB_MIGRATING to \"true\" when running migrations",
  );
}

// This will run migrations on the database, skipping the ones already applied
await migrate(db, { migrationsFolder: config.out! });

await connection.end();
