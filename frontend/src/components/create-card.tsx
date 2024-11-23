import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRef, type FormEvent } from "react";

export type CreateCardProps = {
  onComplete: () => void;
  onAddCard: (data: { name: string }) => void;
};

export function CreateCard(props: CreateCardProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = textAreaRef.current!.value;

    props.onAddCard({ name });
    textAreaRef.current!.value = "";
  };

  return (
    <Card className="p-2">
      <form onSubmit={handleSubmit} className="space-y-3">
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
