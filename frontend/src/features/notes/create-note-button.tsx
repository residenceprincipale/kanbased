import {CirclePlus} from "lucide-react";
import {Button} from "@/components/ui/button";

export function CreateNoteButton({
  size,
  onClick,
}: {
  size?: "sm" | "lg";
  onClick: () => void;
}) {
  return (
    <Button
      id="create-note-button"
      size={size}
      onClick={onClick}
      className="gap-2"
    >
      <CirclePlus className="w-5 h-5" />
      Create Note
    </Button>
  );
}
