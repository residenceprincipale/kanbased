import z from 'zod';
import { createRoute } from "@hono/zod-openapi";

import {
  createMessageContent,
  genericMessageContent,
  jsonContent,
  jsonContentRequired,
  zodErrorContent,
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema } from "drizzle-zod";
import { tasksTable } from "../../db/schema/index.js";

const createTaskBodySchema = createInsertSchema(tasksTable);

const updateTasksSchema = z.array(createTaskBodySchema.pick({ position: true, columnId: true, id: true }));

export const createTaskRoute = createRoute({
  method: "post",
  path: "/tasks",
  request: {
    body: jsonContentRequired(createTaskBodySchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.object({})),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.FORBIDDEN]: genericMessageContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent(
      "if you provide a board name which is not found in the boards table. You will receive this error code",
    ),
  },
});

export const updateTasksRoute = createRoute({
  method: "put",
  path: "/tasks",
  request: {
    body: jsonContentRequired(updateTasksSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.object({})),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
    [HTTP_STATUS_CODES.FORBIDDEN]: genericMessageContent,
    [HTTP_STATUS_CODES.NOT_FOUND]: createMessageContent(
      "if you provide a board name which is not found in the boards table. You will receive this error code",
    ),
  },
});