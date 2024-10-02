import { WriteTransaction } from 'replicache';

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

export const mutators = {
  createTodo: async (
    tx: WriteTransaction,
    { id, text }: { id: string; text: string }
  ) => {
    await tx.put(`todo/${id}`, {
      id,
      text,
      completed: false,
    });
  },

  updateTodoText: async (
    tx: WriteTransaction,
    { id, text }: { id: string; text: string }
  ) => {
    const todo = await tx.get(`todo/${id}`) as Todo | undefined;
    if (todo) {
      await tx.put(`todo/${id}`, { ...todo, text });
    }
  },

  toggleTodoCompleted: async (
    tx: WriteTransaction,
    { id }: { id: string }
  ) => {
    const todo = await tx.get(`todo/${id}`) as Todo | undefined;
    if (todo) {
      await tx.put(`todo/${id}`, { ...todo, completed: !todo.completed });
    }
  },

  deleteTodo: async (
    tx: WriteTransaction,
    { id }: { id: string }
  ) => {
    await tx.del(`todo/${id}`);
  },
};
