import { CreateBoard } from "@/routes/_authenticated/_board-layout/boards/-route-impl/create-board";
import { DeleteBoard } from "@/routes/_authenticated/_board-layout/boards/-route-impl/delete-board";
import { EditBoard } from "@/routes/_authenticated/_board-layout/boards/-route-impl/edit-board";
import { boardStore } from "@/routes/_authenticated/_board-layout/boards/-route-impl/state";
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
