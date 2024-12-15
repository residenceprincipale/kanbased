import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskMutation } from "@/features/columns/queries";
import { getId } from "@/lib/utils";
import { useRef, type FormEvent } from "react";

export type CreateCardProps = {
  boardName: string;
  columnId: string;
  nextPosition: number;
  onComplete: () => void;
};

export function CreateCard(props: CreateCardProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const createTaskMutation = useCreateTaskMutation(props.boardName);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = textAreaRef.current!.value;
    textAreaRef.current!.value = "";
    const currentDate = new Date().toISOString();

    createTaskMutation.mutate({
      body: {
        id: getId(),
        columnId: props.columnId,
        name,
        position: props.nextPosition,
        createdAt: currentDate,
        updatedAt: currentDate,
      },
    });
  };

  return (
    <div>
      <form
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            props.onComplete();
          }
        }}
        onSubmit={handleSubmit}
        className="space-y-3"
      >
        <Textarea
          name="task"
          ref={textAreaRef}
          required
          onChange={(e) => {
            let el = e.currentTarget;
            el.style.height = `${el.scrollHeight}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              buttonRef.current!.click();
            }
            if (event.key === "Escape") {
              props.onComplete();
            }
          }}
          autoFocus
          className="!min-h-16 !px-2 resize-none overflow-hidden !ring-transparent text-base"
        />

        <div className="flex gap-4 w-fit ml-auto">
          <Button
            onClick={props.onComplete}
            type="button"
            variant="ghost"
            size="sm"
          >
            Cancel
          </Button>

          <Button ref={buttonRef} type="submit" size="sm">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
