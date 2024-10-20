import { createRoute } from "@hono/zod-openapi";
import { errorSchemas } from "../../lib/error-schema.js";
import { createSelectSchema } from "drizzle-zod";
import { profileTable } from "../../db/schema/index.js";


const selectUsersSchema = createSelectSchema(profileTable);


export const getCurrentUser = createRoute({
  method: "get",
  path: "/current-user",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: selectUsersSchema.omit({ userId: true }),
        },
      },
      description: "No content",
    },
    ...errorSchemas,
  },
});