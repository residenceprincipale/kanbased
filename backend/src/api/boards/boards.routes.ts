import { createRoute, z } from "@hono/zod-openapi";

import { errorSchemas } from "../../lib/error-schema.js";

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
    body: {
      content: {
        "application/json": {
          schema: createBoardParamsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createBoardResponse,
        },
      },
      description: "Retrieve the user",
    },
    ...errorSchemas,
  },
});

export const getBoardsRoute = createRoute({
  method: "get",
  path: "/boards",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(createBoardResponse),
        },
      },
      description: "",
    },
    ...errorSchemas,
  },
});
