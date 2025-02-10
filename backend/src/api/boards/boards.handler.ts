import routes from "./boards.routes.js";
import * as boardService from "../../use-cases/boards.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import { getUser, sendJson } from "../../lib/request-helpers.js";

const handlers: InferHandlers<typeof routes> = {
  createBoard: async (c) => {
    const body = c.req.valid("json");
    const userId = getUser(c).id;

    await boardService.createBoard(userId, body);

    return sendJson(c, {}, HTTP_STATUS_CODES.CREATED);
  },

  getBoards: async (c) => {
    const userId = getUser(c).id;

    const boards = await boardService.getBoards(userId);

    return sendJson(c, boards, HTTP_STATUS_CODES.OK);
  },

  toggleBoardDelete: async (c) => {
    const userId = getUser(c).id;
    const { boardId } = c.req.valid("param");
    const body = c.req.valid("json");

    const updatedBoard = await boardService.toggleBoardDelete(
      userId,
      boardId,
      body.deleted
    );

    return sendJson(
      c,
      {
        id: updatedBoard.id,
        name: updatedBoard.name,
        color: updatedBoard.color,
      },
      HTTP_STATUS_CODES.OK
    );
  },

  editBoard: async (c) => {
    const userId = c.var.user.id;
    const { boardId } = c.req.valid("param");
    const body = c.req.valid("json");

    await boardService.editBoard(userId, boardId, body);

    return sendJson(c, {}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
