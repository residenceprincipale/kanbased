import type { Table } from "drizzle-orm";

import { getTableName, sql } from "drizzle-orm";

import { connection, db, type Db } from "./index.js";
import * as schema from "./schema/index.js";

if (!process.env.DB_SEEDING) {
  throw new Error("You must set DB_SEEDING to \"true\" when running seeds");
}

async function resetTable(db: Db, table: Table) {
  return db.execute(
    sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`),
  );
}

for (const table of [schema.boardTable, schema.sessionTable]) {
  await resetTable(db, table);
}

// await db.delete(table); // clear tables without truncating / resetting ids
await db.delete(schema.userTable);

// TODO: Add seeds later

await connection.end();
