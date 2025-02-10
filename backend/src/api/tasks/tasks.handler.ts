import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import type routes from "./tasks.routes.js";
import * as tasksUseCases from "../../use-cases/tasks.js";

const handlers: InferHandlers<typeof routes> = {
  createTask: async (c) => {
    const userId = c.var.user.id;
    const body = c.req.valid("json");

    const task = await tasksUseCases.createTask(userId, body);

    return c.json(task, HTTP_STATUS_CODES.OK);
  },

  updateTaskName: async (c) => {
    const userId = c.var.user.id;
    const { taskId } = c.req.valid("param");
    const body = c.req.valid("json");

    await tasksUseCases.updateTaskName(userId, taskId, body);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  updateTasksPosition: async (c) => {
    const userId = c.var.user.id;
    const tasks = c.req.valid("json");

    await tasksUseCases.updateTasksPosition(userId, tasks);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  deleteTask: async (c) => {
    const userId = c.var.user.id;
    const taskId = c.req.valid("param").taskId;

    await tasksUseCases.deleteTask(userId, taskId);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
