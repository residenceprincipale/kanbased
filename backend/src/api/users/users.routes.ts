import { createRoute } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import { profilesTable } from "../../db/schema/index.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { jsonContent } from "../../lib/schema-helpers.js";


const selectUsersSchema = createSelectSchema(profilesTable);


export const getCurrentUser = createRoute({
  method: "get",
  path: "/current-user",
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(selectUsersSchema.omit({ userId: true }))
  }
});