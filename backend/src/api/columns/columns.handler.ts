import { type GetColumnsResponse } from "./columns.routes.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import type routes from "./columns.routes.js";
import * as columnsService from "../../use-cases/columns.js";
import { sendJson } from "../../lib/request-helpers.js";


const handlers: InferHandlers<typeof routes> = {
  createColumn: async (c) => {
    const userId = c.var.user.id;
    const body = c.req.valid("json");

    await columnsService.createColumn(userId, body);

    return sendJson(c, {}, HTTP_STATUS_CODES.CREATED);
  },

  reorderColumns: async (c) => {
    const userId = c.var.user.id;
    const columns = c.req.valid("json");

    await columnsService.reorderColumns(userId, columns);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  getColumns: async (c) => {
    const userId = c.var.user.id;
    const params = c.req.valid("query");

    const { columns, tasks, boardId } = await columnsService.getColumnsAndTasks(userId, params.boardName);

    const response: GetColumnsResponse = {
      boardId,
      boardName: params.boardName,
      columns,
      tasks,
    };

    return sendJson(c, response, HTTP_STATUS_CODES.OK);
  },

  updateColumnName: async (c) => {
    const userId = c.var.user.id;
    const { columnId } = c.req.valid("param");
    const body = c.req.valid("json");

    const updatedCol = await columnsService.updateColumnName(userId, columnId, body);

    return sendJson(c, { id: updatedCol.id, name: updatedCol.name }, HTTP_STATUS_CODES.OK);
  },

  deleteColumn: async (c) => {
    const userId = c.var.user.id;
    const { columnId } = c.req.valid("param");

    await columnsService.deleteColumn(userId, columnId);

    return sendJson(c, {}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
