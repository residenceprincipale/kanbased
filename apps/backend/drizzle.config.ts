import { defineConfig } from "drizzle-kit";

console.log("process", process.env);
export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
