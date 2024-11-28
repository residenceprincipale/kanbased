import { ColumnsQueryResponse } from "@/features/columns/queries";
import { Tasks } from "@/features/tasks/tasks";
import { queryClient } from "@/lib/query-client";
import { getColumnsQuery } from "@/lib/query-options-factory";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

type TaskProps = {
  task: Tasks[number];
  boardName: string;
  previousPosition: number;
  nextPosition: number;
};

export const Task = forwardRef<HTMLLIElement, TaskProps>((props, ref) => {
  const { task } = props;
  const [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">(
    "none"
  );

  return (
    <li
      key={task.id}
      className={cn(
        "border-2",
        acceptDrop === "top"
          ? "border-t-primary"
          : acceptDrop === "bottom"
            ? "border-b-primary"
            : "border-transparent"
      )}
      ref={ref}
      onDragOver={(e) => {
        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = (rect.top + rect.bottom) / 2;
        const isTop = e.clientY <= midpoint;
        setAcceptDrop(isTop ? "top" : "bottom");
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(e) => {
        const dropTaskId = JSON.parse(e.dataTransfer.getData("task")).id;

        queryClient.setQueryData(
          getColumnsQuery(props.boardName).queryKey,
          (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
            const position =
              acceptDrop === "top"
                ? props.previousPosition
                : props.nextPosition;

            const updatedPosition = (task.position + position) / 2;
            const columnId = task.columnId;

            return {
              ...oldData,
              tasks: oldData.tasks.map((task) =>
                task.id === dropTaskId
                  ? {
                      ...task,
                      columnId,
                      position: updatedPosition,
                    }
                  : task
              ),
            };
          }
        );

        setAcceptDrop("none");
      }}
    >
      <div
        className="bg-background text-foreground p-2 rounded-md h-16"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";

          e.dataTransfer.setData(
            "task",
            JSON.stringify({ id: task.id, name: task.name })
          );
        }}
      >
        {task.name}
      </div>
    </li>
  );
});
