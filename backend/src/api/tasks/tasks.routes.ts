import z from 'zod';
import { createRoute } from "@hono/zod-openapi";

import {
  createMessageContent,
  emptyResponse,
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
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
  },
});

export const updateTasksRoute = createRoute({
  method: "put",
  path: "/tasks",
  request: {
    body: jsonContentRequired(updateTasksSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    [HTTP_STATUS_CODES.FORBIDDEN]: genericMessageContent,
  },
});