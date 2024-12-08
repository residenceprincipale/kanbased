import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  out: "./src/db/migrations",
  dbCredentials: {
    // eslint-disable-next-line node/no-process-env
    url: process.env.DATABASE_URL,
  },
  casing: "snake_case",
});
