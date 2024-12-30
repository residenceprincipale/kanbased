import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { Api200Response } from "@/types/type-helpers";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical, SquareKanban, Trash } from "lucide-react";
import { useState } from "react";

export type BoardProps = {
  board: Api200Response<"/boards", "get">[number];
};

export function Board(props: BoardProps) {
  const { board } = props;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const deleteBoardMutation = api.useMutation("delete", "/boards/{boardId}");

  const handleDelete = () => {
    deleteBoardMutation.mutate(
      { params: { path: { boardId: board.id } } },
      {
        onSuccess: () => {
          const boardsQuery = api.queryOptions("get", "/boards");
          queryClient.invalidateQueries(boardsQuery);
        },
      }
    );
  };

  return (
    <li>
      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <Card className="flex items-center justify-between gap-2 hover:text-bg-muted-foreground p-4 py-3">
          <Link
            to="/boards/$boardName"
            search={{ open: undefined }}
            params={{ boardName: board.name }}
            className="flex gap-2 flex-1"
          >
            <SquareKanban className="shrink-0" />
            <div className="">{board.name}</div>
          </Link>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="!h-8 !w-8"
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setShowDeleteConfirmation(true);
                }}
                className="!text-red-10 focus:!bg-red-3 dark:focus:!bg-red-2"
              >
                <Trash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your tasks that belong to this board
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBoardMutation.isPending}
            >
              {deleteBoardMutation.isPending ? <Spinner /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
