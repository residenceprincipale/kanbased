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
