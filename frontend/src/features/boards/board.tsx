import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { boardStore } from "@/features/boards/state";
import { Api200Response } from "@/types/type-helpers";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical, Pencil, SquareKanban, Trash } from "lucide-react";

export type Board = Api200Response<"/boards", "get">[number];

export type BoardProps = {
  board: Board;
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
              onClick={() => boardStore.send({ type: "deleteBoard", board })}
            >
              <Trash />
              Delete
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => boardStore.send({ type: "editBoard", board })}
            >
              <Pencil />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </li>
  );
}
