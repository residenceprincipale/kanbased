import { createRoute } from "@hono/zod-openapi";

import {
  emptyResponse, jsonContent,
  jsonContentRequired
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columnsTable, tasksTable } from "../../db/schema/index.js";
import z from "zod";
import { ResponseBuilder } from "../../lib/response-builder.js";

const tasksSelectSchema = createSelectSchema(tasksTable).omit({
  createdAt: true,
  updatedAt: true,
});

const columnsInsertSchema = createInsertSchema(columnsTable)
const columnsSelectSchema = createSelectSchema(columnsTable).omit({
  createdAt: true,
  updatedAt: true,
});

const getColumnsResponseSchema = z.object({
  boardId: z.string(),
  boardName: z.string(),
  columns: z.array(columnsSelectSchema),
  tasks: z.array(tasksSelectSchema),
});

const updateColumnsReqBodySchema = z.array(columnsSelectSchema.pick({ id: true, position: true })).nonempty();

export type GetColumnsResponse = z.infer<typeof getColumnsResponseSchema>;

export const createColumnRoute = createRoute({
  method: "post",
  path: "/columns",
  request: {
    body: jsonContentRequired(columnsInsertSchema),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.CREATED]: jsonContent(emptyResponse)
  }),
});


export const reorderColumnsRoute = createRoute({
  method: "patch",
  path: "/columns/reorder",
  request: {
    body: jsonContentRequired(updateColumnsReqBodySchema),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
  }),
});

export const getColumnsRoute = createRoute({
  method: "get",
  path: "/columns",
  request: {
    query: z.object({ boardName: z.string() }),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(getColumnsResponseSchema),
  }),
});


export const updateColumnRoute = createRoute({
  method: "patch",
  path: "/columns/{columnId}",
  request: {
    params: z.object({ columnId: z.string() }),
    body: jsonContentRequired(columnsSelectSchema.pick({ name: true })),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(columnsSelectSchema.pick({ id: true, name: true })),
  }),
});