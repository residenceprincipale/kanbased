import { Button } from "@/components/ui/button";
import { ColumnWrapper } from "@/components/column";
import { Input } from "@/components/ui/input";
import { FormEventHandler } from "react";
import { useCreateColumnMutation } from "@/features/columns/queries";
import {
  setIsCreateColumnOpen,
  useGetIsCreateColumnOpen,
} from "@/routes/_blayout.boards.$boardName";
import { getId } from "@/lib/utils";

export function CreateColumn(props: {
  boardName: string;
  nextPosition: number;
}) {
  const isCreateColOpen = useGetIsCreateColumnOpen();
  const createColumnMutation = useCreateColumnMutation(props.boardName);

  if (!isCreateColOpen) {
    return null;
  }

  const onClose = () => {
    setIsCreateColumnOpen(undefined);
  };

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const fd = new FormData(formEl);
    const name = fd.get("column-name") as string;
    const currentDate = new Date().toISOString();
    formEl.reset();

    createColumnMutation.mutate({
      body: {
        id: getId(),
        boardName: props.boardName,
        name,
        position: props.nextPosition,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
    });
  };

  return (
    <ColumnWrapper className="!h-[110px]">
      <form onSubmit={handleSubmit} className="px-2 pt-0.5">
        <Input
          id="column-name"
          name="column-name"
          placeholder="eg: work column"
          required
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onClose();
            }
          }}
        />

        <div className="flex gap-4 w-fit ml-auto mt-4">
          <Button onClick={onClose} type="button" variant="ghost" size="sm">
            Cancel
          </Button>

          <Button type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    </ColumnWrapper>
  );
}
