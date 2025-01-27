import { useModalControls, useModalState } from "@/state/modals"
import { BoardListResponse } from "@/types/api-response-types";

export interface CreateBoardModal {
  type: 'create-board'
  onClose: () => void
}

export interface EditBoardModal {
  type: 'edit-board',
  board: BoardListResponse[number],
  onClose: () => void
}

export interface DeleteBoardModal {
  type: 'delete-board',
  board: BoardListResponse[number],
  onClose: () => void
}

type BoardModalState = CreateBoardModal | DeleteBoardModal | EditBoardModal | null

export const useBoardModalState = useModalState<BoardModalState>;
export const useBoardModalControls = useModalControls<BoardModalState>;
