import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { Board } from "@/routes/_authenticated/_board-layout/boards/-route-impl/board";
import { Route } from "@/routes/_authenticated/_board-layout/boards/route";
import { type FormEventHandler } from "react";
import { toast } from "sonner";

export function EditBoard(props: { board: Board; onClose: () => void }) {
  const { board } = props;
  const { mutate, isPending } = api.useMutation("patch", "/boards/{boardId}");
  const boardsQueryKey = Route.useRouteContext({
    select: (data) => data.boardsQueryOptions.queryKey,
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const boardName = fd.get("board-name") as string;
    const currentDate = new Date().toISOString();

    mutate(
      {
        body: {
          name: boardName,
          updatedAt: currentDate,
        },
        params: {
          path: { boardId: board.id },
        },
      },
      {
        onSuccess() {
          queryClient.invalidateQueries({ queryKey: boardsQueryKey });
          toast.success("Board updated successfully");
          props.onClose();
        },
      }
    );
  };

  const handleOpenChange = () => {
    props.onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="!gap-0 sm:max-w-[425px]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit board</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2 mt-4 mb-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input
              id="board-name"
              name="board-name"
              placeholder="eg: work board"
              required
              defaultValue={board.name}
            />
            <DialogDescription className="!text-xs">
              Enter a unique name that reflects the purpose of this board.
            </DialogDescription>
          </div>

          <DialogFooter>
            <Button disabled={isPending} type="submit" className="w-[72px]">
              {isPending ? <Spinner /> : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
