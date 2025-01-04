import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteBoard } from "@/features/boards/delete-board";
import { EditBoard } from "@/features/boards/edit-board";
import { Api200Response } from "@/types/type-helpers";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical, Pencil, SquareKanban, Trash } from "lucide-react";

export type BoardProps = {
  board: Api200Response<"/boards", "get">[number];
};

export function Board(props: BoardProps) {
  const { board } = props;

  return (
    <li>
      <Card className="flex items-center justify-between gap-2 hover:text-bg-muted-foreground hover:bg-accent">
        <Link
          to="/boards/$boardName"
          search={{ open: undefined }}
          params={{ boardName: board.name }}
          className="flex gap-2 flex-1 pl-2 py-3"
        >
          <SquareKanban className="shrink-0" />
          <div>{board.name}</div>
        </Link>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="!h-8 !w-8 !mr-2"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="!text-red-10 focus:!bg-red-3 dark:focus:!bg-red-2"
              asChild
            >
              <Link
                preload={false}
                to="."
                search={{ open: { type: "delete-board", boardId: board.id } }}
                replace
              >
                <Trash />
                Delete
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                preload={false}
                to="."
                search={{ open: { type: "edit-board", boardId: board.id } }}
              >
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <EditBoard board={board} />
      <DeleteBoard board={board} />
    </li>
  );
}
