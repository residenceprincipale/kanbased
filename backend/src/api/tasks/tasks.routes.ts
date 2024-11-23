import { createRoute } from "@hono/zod-openapi";

import { createMessageContent, jsonContent, jsonContentRequired, zodErrorContent } from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { taskTable } from "../../db/schema/index.js";

const createTaskBodySchema = createInsertSchema(taskTable).omit({ updatedAt: true, createdAt: true, id: true, });
const tasksResponseSchema = createSelectSchema(taskTable).omit({ createdAt: true, updatedAt: true });

export const createTaskRoute = createRoute({
  method: "post",
  path: "/tasks",
  request: {
    body: jsonContentRequired(createTaskBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(tasksResponseSchema),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});
