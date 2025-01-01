import { createRoute, z } from "@hono/zod-openapi";

import {
  emptyResponse,
  genericMessageContent,
  jsonContent,
  jsonContentRequired
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { boardsTable } from "../../db/schema/index.js";
import { ResponseBuilder } from "../../lib/response-builder.js";

const createBoardParamsSchema = createInsertSchema(boardsTable).omit({
  creatorId: true,
});

const createBoardResponse = createSelectSchema(boardsTable).omit({
  creatorId: true,
  createdAt: true,
  updatedAt: true,
});

export const createBoardRoute = createRoute({
  method: "post",
  path: "/boards",
  request: {
    body: jsonContentRequired(createBoardParamsSchema),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.CREATED]: jsonContent(emptyResponse),
    [HTTP_STATUS_CODES.BAD_REQUEST]: genericMessageContent,
  }),
});

export const getBoardsRoute = createRoute({
  method: "get",
  path: "/boards",
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(z.array(createBoardResponse)),
  }),
});

export const deleteBoardRoute = createRoute({
  method: "delete",
  path: "/boards/{boardId}",
  request: {
    params: z.object({ boardId: z.string() }),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
  }),
});

export const editBoardRoute = createRoute({
  method: "patch",
  path: "/boards/{boardId}",
  request: {
    params: z.object({ boardId: z.string() }),
    body: jsonContent(
      createBoardParamsSchema.omit({ id: true, createdAt: true })
    ),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    [HTTP_STATUS_CODES.BAD_REQUEST]: genericMessageContent,
  }),
});
