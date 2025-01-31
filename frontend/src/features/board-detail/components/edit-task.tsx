import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskMutation } from "@/features/board-detail/queries/tasks";
import { getId } from "@/lib/utils";
import { ColumnsWithTasksResponse } from "@/types/api-response-types";
import { QueryKey } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useRef, type FormEvent } from "react";

export type EditTaskProps = {
  task: ColumnsWithTasksResponse["tasks"][number];
  onComplete: () => void;
  columnsQueryKey: QueryKey;
};

export function EditTask(props: EditTaskProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const createTaskMutation = useCreateTaskMutation({
    columnsQueryKey: props.columnsQueryKey,
  });

  const handleSubmit = async () => {
    const name = textAreaRef.current!.value;
    textAreaRef.current!.value = "";
    const currentDate = new Date().toISOString();

    // createTaskMutation.mutate({
    //   body: {
    //     id: getId(),
    //     name,
    //     createdAt: currentDate,
    //     updatedAt: currentDate,
    //   },
    // });

    props.onComplete();
  };

  return (
    <div>
      <form>
        <Textarea
          name="task"
          ref={useCallback((node: HTMLTextAreaElement | null) => {
            textAreaRef.current = node;

            if (node) {
              node.select();
            }
          }, [])}
          defaultValue={props.task.name}
          required
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
            if (event.key === "Escape") {
              props.onComplete();
            }
          }}
          className="min-h-16 !px-2 resize-none !ring-transparent text-base"
        />
      </form>
    </div>
  );
}
