import { CreateBoard } from "@/features/boards/create-board";
import { DeleteBoard } from "@/features/boards/delete-board";
import { EditBoard } from "@/features/boards/edit-board";
import { boardStore } from "@/features/boards/state";
import { useSelector } from "@xstate/store/react";

export function ActionsRenderer() {
  const action = useSelector(boardStore, (state) => state.context.action);

  const clearAction = () => {
    boardStore.send({ type: "clearAction" });
  };

  switch (action?.type) {
    case "create-board":
      return <CreateBoard onClose={clearAction} />;
    case "edit-board":
      return <EditBoard board={action.board} onClose={clearAction} />;
    case "delete-board":
      return <DeleteBoard board={action.board} onClose={clearAction} />;
    default:
      return null;
  }
}
