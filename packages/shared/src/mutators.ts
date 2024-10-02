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
  color?: string;
  isPinned: boolean;
};

export type TabState = {
  boardName: Board["name"];
  boardColor: Board["color"];
};

export type Column = {
  id: string;
  name: string;
  createdAt: string;
};

export type Card = {
  name: string;
  createdAt: string;
};

export const mutators = {
  createBoard: async (
    tx: WriteTransaction,
    {
      name,
      isPinned,
      color,
    }: Pick<Board, "name"> & Partial<Pick<Board, "isPinned" | "color">>
  ) => {
    const id = nanoid();
    await tx.set(`boards/${id}`, {
      id,
      name,
      isPinned: !!isPinned,
      color,
    });
  },
  createTab: async (
    tx: WriteTransaction,
    { boardColor, boardName }: TabState
  ) => {
    const id = nanoid();
    await tx.set(`tabsState/${boardName}`, {
      id,
      boardName,
      boardColor,
    });
  },
  createColumn: async (
    tx: WriteTransaction,
    { name }: Pick<Column, "name">
  ) => {
    const id = nanoid();
    await tx.set(`columns/${id}`, {
      id,
      name,
      createdAt: new Date().toISOString(),
    });
  },
  deleteTab: async (
    tx: WriteTransaction,
    { boardName }: Pick<TabState, "boardName">
  ) => {
    await tx.del(`tabsState/${boardName}`);
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
