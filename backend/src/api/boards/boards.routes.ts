import { createRoute, z } from "@hono/zod-openapi";

import {
  createMessageContent,
  genericMessageContent,
  jsonContent,
  jsonContentRequired,
  zodErrorContent,
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { boardsTable } from "../../db/schema/index.js";

const createBoardParamsSchema = createInsertSchema(boardsTable).omit({
  userId: true,
});
const createBoardResponse = createSelectSchema(boardsTable).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const createBoardRoute = createRoute({
  method: "post",
  path: "/boards",
  request: {
    body: jsonContentRequired(createBoardParamsSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.CREATED]: jsonContent(z.object({})),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.FORBIDDEN]: genericMessageContent,
    [HTTP_STATUS_CODES.BAD_REQUEST]: createMessageContent(),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: genericMessageContent,
  },
});

export const getBoardsRoute = createRoute({
  method: "get",
  path: "/boards",
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.array(createBoardResponse)),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
  },
});
