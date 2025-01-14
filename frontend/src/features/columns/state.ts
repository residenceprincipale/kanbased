import { CreateColumnProps } from "@/features/columns/create-column";
import { createStore } from "@xstate/store";

type CreateColumnAction = {
  type: "create-column";
};

type Action = CreateColumnAction | null;
type ColumnContext = {
  action: Action;
};

const columnContext: ColumnContext = {
  action: null,
};

export const columnStore = createStore({
  context: columnContext,
  on: {
    createColumn: {
      action: { type: 'create-column' }
    },
    clearAction: {
      action: null
    }
  },
});
