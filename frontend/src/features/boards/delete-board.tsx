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
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BoardProps } from "@/features/boards/board";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { boardsQuery } from "@/lib/query-options-factory";
import { states } from "@/routes/_blayout.boards.index";
import { toast } from "sonner";

export function DeleteBoard(props: { board: BoardProps["board"] }) {
  const urlState = states.use("open");
  const showDeleteModal =
    urlState.state?.type === "delete-board" &&
    urlState.state?.boardId === props.board.id;

  const deleteBoardMutation = api.useMutation(
    "patch",
    "/boards/{boardId}/toggle-delete"
  );

  const handleUndoDelete = (boardId: string) => {
    toast.promise(
      deleteBoardMutation.mutateAsync(
        {
          params: { path: { boardId } },
          body: { deleted: false },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(boardsQuery);
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
        params: { path: { boardId: urlState.state?.boardId! } },
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
        },
      }
    );
  };

  const handleOpenChange = () => {
    urlState.remove(true);
  };

  if (!showDeleteModal) {
    return null;
  }

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
                <Spinner /> Deleting
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
