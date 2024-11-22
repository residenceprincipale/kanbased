import { createRoute } from "@hono/zod-openapi";

import { createMessageContent, jsonContent, jsonContentRequired, zodErrorContent } from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columnTable, taskTable } from "../../db/schema/index.js";
import z from 'zod';

const createColumnBodySchema = createInsertSchema(columnTable).omit({ updatedAt: true, boardId: true }).extend({
  boardName: z.string()
});

const tasksResponseSchema = createSelectSchema(taskTable).omit({ createdAt: true, updatedAt: true, });
const columnWithTasksSchema = createSelectSchema(columnTable).omit({ createdAt: true, updatedAt: true, }).extend({
  tasks: z.array(tasksResponseSchema)
})

const getColumnsResponseSchema = z.array(columnWithTasksSchema);

export type ColumnWithTasks = z.infer<typeof columnWithTasksSchema>;

export const createColumnRoute = createRoute({
  method: "post",
  path: "/columns",
  request: {
    body: jsonContentRequired(createColumnBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(columnWithTasksSchema),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});

export const getColumnsRoute = createRoute({
  method: "get",
  path: "/columns",
  request: {
    query: z.object({ boardName: z.string() }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(getColumnsResponseSchema),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});
