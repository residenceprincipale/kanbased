import z from 'zod';
import { createRoute } from "@hono/zod-openapi";

import {
  emptyResponse, jsonContent,
  jsonContentRequired
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { createInsertSchema } from "drizzle-zod";
import { tasksTable } from "../../db/schema/index.js";
import { ResponseBuilder } from '../../lib/response-builder.js';

const createTaskBodySchema = createInsertSchema(tasksTable);

const updateTasksSchema = z.array(createTaskBodySchema.pick({ position: true, columnId: true, id: true }));

export const createTaskRoute = createRoute({
  method: "post",
  path: "/tasks",
  request: {
    body: jsonContentRequired(createTaskBodySchema),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
  }),
});

export const updateTasksRoute = createRoute({
  method: "put",
  path: "/tasks",
  request: {
    body: jsonContentRequired(updateTasksSchema),
  },
  responses: ResponseBuilder.withAuthAndValidation({
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
  }),
});