import { createSignal, Match, Switch } from "solid-js";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "~/components/ui/text-field";
import { Button, buttonVariants } from "~/components/ui/button";
import { usePostMutation } from "~/lib/mutation-client";
import { Loader } from "~/components/ui/loader";
import { queryClient } from "~/lib/query-client";
import { getBoardsQuery } from "~/lib/query-options-factory";

export function CreateBoard(props: { Trigger?: Element | null }) {
  const [open, setOpen] = createSignal(false);
  const createBoardMutation = usePostMutation("/boards");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const boardName = fd.get("board-name") as string;

    createBoardMutation.mutate(
      { body: { name: boardName } },
      {
        onSuccess(result) {
          queryClient.setQueryData(getBoardsQuery().queryKey, (prev) => [
            ...(prev || []),
            result!,
          ]);

          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      {props.Trigger ? (
        <DialogTrigger>{props.Trigger}</DialogTrigger>
      ) : (
        <DialogTrigger class={buttonVariants({ size: "sm" })}>
          Create board
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div class="mt-3 mb-4">
            <TextField>
              <TextFieldLabel class="mb-3 block">
                Enter board name
              </TextFieldLabel>
              <TextFieldInput
                name="board-name"
                type="text"
                required
                autocomplete="off"
                placeholder="Eg: My Progress"
              />
            </TextField>
          </div>
          <DialogFooter>
            <Button type="submit" class="w-fit ml-auto gap-2">
              <Switch>
                <Match when={createBoardMutation.isPending}>
                  <Loader /> Create
                </Match>
                <Match when={!createBoardMutation.isPending}>Create</Match>
              </Switch>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
