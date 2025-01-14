import { Link } from "@tanstack/react-router";
import { boardStore } from "./state";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Api200Response } from "@/types/type-helpers";

export type Board = Api200Response<"/boards", "get">[number];

export function Board({ board }: { board: Board }) {
  return (
    <Link
      to="/boards/$boardName"
      params={{ boardName: board.name }}
      className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative p-6">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50 transition-opacity group-hover:opacity-70" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-xl tracking-tight line-clamp-1">
              {board.name}
            </h3>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    boardStore.send({ type: "editBoard", board });
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="!text-red-10 focus:!bg-red-3 dark:focus:!bg-red-2"
                  onClick={(e) => {
                    e.preventDefault();
                    boardStore.send({ type: "deleteBoard", board });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{board.columnsCount ?? 0} columns</span>
              <span className="mx-2">•</span>
              <span>{board.tasksCount ?? 0} tasks</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
