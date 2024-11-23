import { Button } from "@/components/ui/button";
import { ColumnWrapper } from "@/components/ui/column";
import { Input } from "@/components/ui/input";
import { FormEventHandler } from "react";

export function CreateColumn(props: {
  onColumnAdd: (newColumnName: string) => void;
  onCreateCancel: () => void;
}) {
  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const fd = new FormData(formEl);
    const name = fd.get("column-name") as string;
    props.onColumnAdd(name);
    formEl.reset();
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
              props.onCreateCancel();
            }
          }}
        />

        <div className="flex gap-4 w-fit ml-auto mt-4">
          <Button
            onClick={props.onCreateCancel}
            type="button"
            variant="ghost"
            size="sm"
          >
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
