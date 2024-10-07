import { type WriteTransaction } from "replicache";
import { nanoid } from "nanoid";

export const prefixMap = {
  boards: "boards/",
  board(boardId: string) {
    return `${this.boards}${boardId}/`;
  },
  tabs: "tabs/",
  tab(tabId: string) {
    return `${this.tabs}${tabId}/`;
  },
  columns(boardId: string) {
    return `${this.board(boardId)}columns/`;
  },
  column(boardId: string, columnId: string) {
    return `${this.columns(boardId)}${columnId}/`;
  },
  cards(boardId: string, columnId: string) {
    return `${this.column(boardId, columnId)}cards/`;
  },
  card(boardId: string, columnId: string, cardId: string) {
    return `${this.cards(boardId, columnId)}${cardId}/`;
  },
} as const;

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export type Board = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Tab = {
  id: string;
  name: Board["name"];
  color: Board["color"];
  order: number;
};

export type Column = {
  id: string;
  name: string;
  boardId: string;
  order: number;
};

export type Card = {
  id: string;
  name: string;
  order: number;
  columnId: string;
};

export const mutators = {
  createBoard: async (
    tx: WriteTransaction,
    { name, color }: Omit<Board, "id" | "createdAt">
  ) => {
    const id = nanoid();
    await tx.set(prefixMap.board(id), {
      id,
      name,
      color,
      createdAt: new Date().toISOString(),
    });
  },
  createColumn: async (
    tx: WriteTransaction,
    { name, boardId, order }: Omit<Column, "id">
  ) => {
    const id = nanoid();
    await tx.set(prefixMap.column(boardId, id), {
      id,
      name,
      boardId,
      order,
    });
  },
  createTab: async (
    tx: WriteTransaction,
    { color, name, order }: Omit<Tab, "id">
  ) => {
    const id = nanoid();
    await tx.set(prefixMap.tab(id), {
      id,
      name,
      color,
      order,
    });
  },
  createCard: async (
    tx: WriteTransaction,
    { name, order, columnId, boardId }: Omit<Card, "id"> & { boardId: string }
  ) => {
    const id = nanoid();
    await tx.set(prefixMap.card(boardId, columnId, id), {
      id,
      name,
      order,
      columnId,
    });
  },
  deleteTab: async (tx: WriteTransaction, { id }: Pick<Tab, "id">) => {
    await tx.del(prefixMap.tab(id));
  },
  updateTodoText: async (
    tx: WriteTransaction,
    { id, text }: { id: string; text: string }
  ) => {
    const todo = (await tx.get(`todo/${id}`)) as Todo | undefined;
    if (todo) {
      await tx.put(`todo/${id}`, { ...todo, text });
    }
  },

  toggleTodoCompleted: async (tx: WriteTransaction, { id }: { id: string }) => {
    const todo = (await tx.get(`todo/${id}`)) as Todo | undefined;
    if (todo) {
      await tx.put(`todo/${id}`, { ...todo, completed: !todo.completed });
    }
  },

  deleteTodo: async (tx: WriteTransaction, { id }: { id: string }) => {
    await tx.del(`todo/${id}`);
  },
};

export type Mutators = typeof mutators;
