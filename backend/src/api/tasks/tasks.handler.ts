import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import type routes from "./tasks.routes.js";
import * as tasksUseCases from "../../use-cases/tasks.js";

const handlers: InferHandlers<typeof routes> = {
  createTask: async (c) => {
    const authCtx = c.var.authCtx;
    const body = c.req.valid("json");

    const task = await tasksUseCases.createTask(authCtx, body);

    return c.json(task, HTTP_STATUS_CODES.OK);
  },

  updateTaskName: async (c) => {
    const authCtx = c.var.authCtx;
    const { taskId } = c.req.valid("param");
    const body = c.req.valid("json");

    await tasksUseCases.updateTaskName(authCtx, taskId, body);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  updateTasksPosition: async (c) => {
    const authCtx = c.var.authCtx;
    const tasks = c.req.valid("json");

    await tasksUseCases.updateTasksPosition(authCtx, tasks);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  deleteTask: async (c) => {
    const authCtx = c.var.authCtx;
    const { taskId } = c.req.valid("param");

    await tasksUseCases.deleteTask(authCtx, taskId);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
