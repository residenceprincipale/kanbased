import { createRoute, z } from "@hono/zod-openapi";

import { jsonContent, zodErrorContent } from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const createBoardParamsSchema = z.object({
  name: z.string().min(1),
  color: z.string().nullable().optional(),
});

const createBoardResponse = createBoardParamsSchema.extend({
  id: z.number(),
});

export const createBoardRoute = createRoute({
  method: "post",
  path: "/boards",
  request: {
    body: jsonContent(createBoardParamsSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(createBoardResponse, "Retrieve the user"),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent
  },
});

export const getBoardsRoute = createRoute({
  method: "get",
  path: "/boards",
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.array(createBoardResponse)),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent
  },
});
