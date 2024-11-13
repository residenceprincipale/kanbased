import { createRoute } from "@hono/zod-openapi";

import { createMessageContent, jsonContent, jsonContentRequired, zodErrorContent } from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { columnTable } from "../../db/schema/index.js";
import z from 'zod'

const createColumnBodySchema = createInsertSchema(columnTable).omit({ updatedAt: true, boardId: true }).extend({
  boardName: z.string()
});
const createColumnResponse = createSelectSchema(columnTable);

export const createColumnRoute = createRoute({
  method: "post",
  path: "/columns",
  request: {
    body: jsonContentRequired(createColumnBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(createColumnResponse),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});

export const getColumnsRoute = createRoute({
  method: "get",
  path: "/columns",
  request: {
    params: z.object({ boardName: z.string() }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.array(createColumnResponse)),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent("if you provide a board name which is not found in the boards table. You will receive this error code")
  },
});
