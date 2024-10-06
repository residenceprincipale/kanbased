import { type WriteTransaction } from "replicache";
import { nanoid } from "nanoid";

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
    await tx.set(`boards/${id}`, {
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
    await tx.set(`columns/${boardId}/${id}`, {
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
    await tx.set(`tabs/${id}`, {
      id,
      name,
      color,
      order,
    });
  },
  createCard: async (
    tx: WriteTransaction,
    { name, order, columnId }: Omit<Card, "id">
  ) => {
    const id = nanoid();
    await tx.set(`cards/${columnId}/${id}`, {
      id,
      name,
      order,
      columnId,
    });
  },
  deleteTab: async (tx: WriteTransaction, { id }: Pick<Tab, "id">) => {
    await tx.del(`tabs/${id}`);
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
