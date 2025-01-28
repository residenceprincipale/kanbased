import { useBoardModalState } from "@/features/boards/state/board";
import { CreateBoard } from "@/features/boards/components/create-board";
import { DeleteBoard } from "@/features/boards/components/delete-board";
import { EditBoard } from "@/features/boards/components/edit-board";

export function BoardActions() {
  const { activeModal } = useBoardModalState();

  switch (activeModal?.type) {
    case "create-board":
      return <CreateBoard {...activeModal} />;
    case "edit-board":
      return <EditBoard {...activeModal} />;
    case "delete-board":
      return <DeleteBoard {...activeModal} />;
    default:
      return null;
  }
}
