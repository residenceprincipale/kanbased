import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRef, type FormEvent } from "react";

export function CreateCard(props: {
  columnId: string;
  nextOrder: number;
  onComplete: () => void;
  onAddCard: () => void;
}) {
  const rep = useRepContext();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const name = fd.get(props.columnId) as string;
    rep.mutate.createCard({
      name,
      columnId: props.columnId,
      order: props.nextOrder,
    });
    props.onAddCard();
  };

  return (
    <Card className="p-2">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          name={props.columnId}
          ref={textAreaRef}
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
              props.onComplete?.();
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              props.onComplete();
            }
          }}
          autoFocus
          className="!min-h-16 !px-2 resize-none overflow-hidden"
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
    </Card>
  );
}
