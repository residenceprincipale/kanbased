import { Board } from '@/features/boards/board';
import { createStore } from '@xstate/store';

type BoardAction = {
  type: 'create-board'
} | {
  type: 'delete-board',
  board: Board,
} | {
  type: 'edit-board',
  board: Board,
} | null


type BoardContext = {
  action: BoardAction
}

const boardContext: BoardContext = {
  action: null
}

export const boardStore = createStore({
  context: boardContext,
  on: {
    createBoard: (context) => ({ action: { type: 'create-board' as const } }),
    editBoard: (context, data: { board: Board }) => ({ action: { type: 'edit-board' as const, board: data.board } }),
    deleteBoard: (context, data: { board: Board }) => ({ action: { type: 'delete-board' as const, board: data.board } }),
    clearAction: () => ({ action: null })
  },
});