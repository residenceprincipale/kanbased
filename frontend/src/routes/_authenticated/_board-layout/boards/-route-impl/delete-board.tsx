import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { boardsQuery } from "@/lib/query-options-factory";
import { Board } from "@/routes/_authenticated/_board-layout/boards/-route-impl/board";
import { Route } from "@/routes/_authenticated/_board-layout/boards/route";
import { toast } from "sonner";

export function DeleteBoard(props: { board: Board; onClose: () => void }) {
  const deleteBoardMutation = api.useMutation(
    "patch",
    "/boards/{boardId}/toggle-delete"
  );
  const boardsQueryKey = Route.useRouteContext({
    select: (data) => data.boardsQueryOptions.queryKey,
  });

  const handleUndoDelete = (boardId: string) => {
    toast.promise(
      deleteBoardMutation.mutateAsync(
        {
          params: { path: { boardId } },
          body: { deleted: false },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: boardsQueryKey });
          },
        }
      ),
      {
        loading: "Restoring board...",
        success: "Board restored successfully",
        error: "Failed to restore board",
      }
    );
  };

  const handleDelete = async () => {
    await deleteBoardMutation.mutateAsync(
      {
        params: { path: { boardId: props.board.id } },
        body: { deleted: true },
      },
      {
        onSuccess: (result) => {
          queryClient.invalidateQueries(boardsQuery);

          toast.success(
            <div className="flex items-center justify-between w-full">
              <span>
                <b>{result.name}</b> board deleted successfully
              </span>
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "!h-8",
                })}
                onClick={() => handleUndoDelete(result.id)}
              >
                Undo
              </button>
            </div>
          );

          props.onClose();
        },
      }
    );
  };

  const handleOpenChange = () => {
    props.onClose();
  };

  return (
    <AlertDialog open={true} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete the board {props.board.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will be permanent, but you can undo it from the toast
            message.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={deleteBoardMutation.isPending}
            variant="destructive"
            onClick={handleDelete}
            type="submit"
          >
            {deleteBoardMutation.isPending ? (
              <>
                <Spinner />
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
