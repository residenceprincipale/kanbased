import type { InferHandlers } from "../../lib/types.js";
import routes from "./tasks.routes.js";

import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import * as tasksService from "../../use-cases/tasks.js";
import { sendJson } from "../../lib/request-helpers.js";

const handlers: InferHandlers<typeof routes> = {
  // @ts-ignore
  createTask: async (c) => {
    const userId = c.var.user.id;
    const body = c.req.valid("json");

    const task = await tasksService.createTask(userId, body);

    return sendJson(c, task, HTTP_STATUS_CODES.OK);
  },

  // @ts-ignore
  updateTaskName: async (c) => {
    const userId = c.var.user.id;
    const taskId = c.req.valid("param").taskId;
    const body = c.req.valid("json");

    await tasksService.updateTaskName(userId, taskId, body);

    return sendJson(c, {}, HTTP_STATUS_CODES.OK);
  },

  // @ts-ignore
  updateTasksPosition: async (c) => {
    const userId = c.var.user.id;
    const tasks = c.req.valid("json");

    await tasksService.updateTasksPosition(userId, tasks);

    return sendJson(c, {}, HTTP_STATUS_CODES.OK);
  },

  // @ts-ignore
  deleteTask: async (c) => {
    const userId = c.var.user.id;
    const taskId = c.req.valid("param").taskId;

    await tasksService.deleteTask(userId, taskId);

    return sendJson(c, {}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
