import { createRoute } from "@hono/zod-openapi";

import {
  emptyResponse,
  genericMessageContent,
  jsonContent,
  jsonContentRequired
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columnsTable, tasksTable } from "../../db/schema/index.js";
import z from "zod";

const createColumnBodySchema = createInsertSchema(columnsTable)
const tasksResponseSchema = createSelectSchema(tasksTable).omit({
  createdAt: true,
  updatedAt: true,
});
const columnResponseSchema = createSelectSchema(columnsTable).omit({
  createdAt: true,
  updatedAt: true,
});

const getColumnsResponseSchema = z.object({
  boardId: z.string(),
  boardName: z.string(),
  columns: z.array(columnResponseSchema),
  tasks: z.array(tasksResponseSchema),
});

const updateColumnsReqBodySchema = z.array(columnResponseSchema.pick({ id: true, position: true })).nonempty();

export type GetColumnsResponse = z.infer<typeof getColumnsResponseSchema>;

export const createColumnRoute = createRoute({
  method: "post",
  path: "/columns",
  request: {
    body: jsonContentRequired(createColumnBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.CREATED]: jsonContent(emptyResponse)
  },
});


export const updateColumnsRoute = createRoute({
  method: "put",
  path: "/columns",
  request: {
    body: jsonContentRequired(updateColumnsReqBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
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
    [HTTP_STATUS_CODES.FORBIDDEN]: genericMessageContent,
  },
});
