import z from "zod";
import { createRoute } from "@hono/zod-openapi";

import {
  emptyResponse,
  jsonContent,
  jsonContentRequired,
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { ResponseBuilder } from "../../lib/response-builder.js";
import { zodDbSchema } from "../../db/zod-db-schema.js";

const createTaskBodySchema = zodDbSchema.tasksTable.insert;

const updateTasksSchema = z.array(
  createTaskBodySchema.pick({ position: true, columnId: true, id: true })
);

const routes = {
  createTask: createRoute({
    method: "post",
    path: "/tasks",
    request: {
      body: jsonContentRequired(createTaskBodySchema),
    },
    responses: ResponseBuilder.withAuthAndValidation({
      [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    }),
  }),

  updateTaskName: createRoute({
    method: "patch",
    path: "/tasks/{taskId}",
    request: {
      body: jsonContentRequired(
        createTaskBodySchema.pick({ name: true, updatedAt: true })
      ),
      params: z.object({ taskId: z.string() }),
    },
    responses: ResponseBuilder.withAuthAndValidation({
      [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    }),
  }),

  updateTasksPosition: createRoute({
    method: "put",
    path: "/tasks",
    request: {
      body: jsonContentRequired(updateTasksSchema),
    },
    responses: ResponseBuilder.withAuthAndValidation({
      [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    }),
  }),

  deleteTask: createRoute({
    method: "delete",
    path: "/tasks/{taskId}",
    request: {
      params: z.object({ taskId: z.string() }),
    },
    responses: ResponseBuilder.withAuthAndValidation({
      [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    }),
  }),
};

export default routes;
