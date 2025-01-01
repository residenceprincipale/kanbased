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
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { states } from "@/routes/_blayout.boards.index";

export function DeleteBoardModal() {
  const state = states.use("open");
  const showDeleteConfirmation =
    state.state?.type === "delete-board" && !!state.state?.boardId;
  const deleteBoardMutation = api.useMutation("delete", "/boards/{boardId}");

  if (!showDeleteConfirmation) {
    return null;
  }

  const handleDelete = () => {
    deleteBoardMutation.mutate(
      { params: { path: { boardId: state.state?.boardId! } } },
      {
        onSuccess: () => {
          const boardsQuery = api.queryOptions("get", "/boards");
          queryClient.invalidateQueries(boardsQuery);
        },
      }
    );
  };

  const handleOpenChange = () => {
    state.remove();
  };

  return (
    <AlertDialog open={showDeleteConfirmation} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all your
            tasks that belong to this board
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
  );
}
