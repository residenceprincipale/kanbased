import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import type { InferHandlers } from "../../lib/types.js";
import type routes from "./boards.routes.js";
import * as boardsUseCases from "../../use-cases/boards.js";
import * as columnsUseCases from "../../use-cases/columns.js";
import * as tasksUseCases from "../../use-cases/tasks.js";
import { db } from "../../db/index.js";
import { getRandomId } from "../../lib/utils.js";

const handlers: InferHandlers<typeof routes> = {
  createBoard: async (c) => {
    const userId = c.var.user.id;
    const body = c.req.valid("json");

    await boardsUseCases.createBoard(userId, body);

    return c.json({}, HTTP_STATUS_CODES.CREATED);
  },

  getBoards: async (c) => {
    const userId = c.var.user.id;

    const boards = await boardsUseCases.getBoards(userId);

    return c.json(boards, HTTP_STATUS_CODES.OK);
  },

  toggleBoardDelete: async (c) => {
    const userId = c.var.user.id;
    const { boardId } = c.req.valid("param");
    const body = c.req.valid("json");

    const updatedBoard = await boardsUseCases.toggleBoardDelete(
      userId,
      boardId,
      body.deleted
    );

    return c.json(
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

    await boardsUseCases.editBoard(userId, boardId, body);

    return c.json({}, HTTP_STATUS_CODES.OK);
  },

  importBoards: async (c) => {
    const userId = c.var.user.id;
    const { boards } = c.req.valid("json");
    const nowDate = new Date().toISOString();

    await db.transaction(async (tx) => {
      for (let board of boards) {
        const createdBoard = await boardsUseCases.createBoard(userId, {
          id: getRandomId(),
          name: board.boardName,
          createdAt: nowDate,
          updatedAt: nowDate,
        }, tx);

        for (let column of board.columns) {
          const createdColumn = await columnsUseCases.createColumn(userId, {
            id: getRandomId(),
            name: column.name,
            createdAt: nowDate,
            updatedAt: nowDate,
            boardId: createdBoard.id,
            position: column.position,
          }, tx);

          for (let task of column.tasks) {
            await tasksUseCases.createTask(userId, {
              id: getRandomId(),
              name: task.name,
              createdAt: nowDate,
              updatedAt: nowDate,
              position: task.position,
              columnId: createdColumn.id,
            }, tx);
          }
        }
      }
    });

    return c.json({}, HTTP_STATUS_CODES.OK);
  },
};

export default handlers;
