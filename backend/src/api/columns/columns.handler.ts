import { type GetColumnsResponse } from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import type routes from "./columns.routes.js";
import * as columnsUseCases from "../../use-cases/columns.js";

const handlers: InferHandlers<typeof routes> = {
  createColumn: async (c) => {
    const userId = c.var.user.id;
    const body = c.req.valid("json");

    await columnsUseCases.createColumn(userId, body);

    return c.json({}, HTTP_STATUS_CODES.CREATED);
  },

  reorderColumns: async (c) => {
    const userId = c.var.user.id;
    const columns = c.req.valid("json");

    await columnsUseCases.reorderColumns(userId, columns);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  getColumns: async (c) => {
    const userId = c.var.user.id;
    const params = c.req.valid("query");

    const { columns, tasks, boardId } = await columnsUseCases.getColumnsAndTasks(userId, params.boardName);

    const response: GetColumnsResponse = {
      boardId,
      boardName: params.boardName,
      columns,
      tasks,
    };

    return c.json(response, HTTP_STATUS_CODES.OK);
  },

  updateColumnName: async (c) => {
    const userId = c.var.user.id;
    const { columnId } = c.req.valid("param");
    const body = c.req.valid("json");

    const updatedCol = await columnsUseCases.updateColumnName(userId, columnId, body);

    return c.json({ id: updatedCol.id, name: updatedCol.name }, HTTP_STATUS_CODES.OK);
  },

  deleteColumn: async (c) => {
    const userId = c.var.user.id;
    const { columnId } = c.req.valid("param");

    await columnsUseCases.deleteColumn(userId, columnId);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
