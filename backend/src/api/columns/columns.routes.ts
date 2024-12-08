import { createRoute } from "@hono/zod-openapi";

import { createMessageContent, jsonContent, jsonContentRequired, zodErrorContent } from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columnsTable, tasksTable } from "../../db/schema/index.js";
import z from 'zod';

const createColumnBodySchema = createInsertSchema(columnsTable).omit({ boardId: true, }).extend({
  boardName: z.string()
});

const tasksResponseSchema = createSelectSchema(tasksTable).omit({ createdAt: true, updatedAt: true });
const columnResponseSchema = createSelectSchema(columnsTable).omit({ createdAt: true, updatedAt: true });

const getColumnsResponseSchema = z.object({
  boardId: z.string(),
  boardName: z.string(),
  columns: z.array(columnResponseSchema),
  tasks: z.array(tasksResponseSchema)
})

export type GetColumnsResponse = z.infer<typeof getColumnsResponseSchema>;

export const createColumnRoute = createRoute({
  method: "post",
  path: "/columns",
  request: {
    body: jsonContentRequired(createColumnBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(columnResponseSchema),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});

export const updateColumnsRoute = createRoute({
  method: "put",
  path: "/columns",
  request: {
    body: jsonContentRequired(z.array(columnResponseSchema).nonempty()),
    query: z.object({ boardId: z.string() }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(columnResponseSchema),
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
