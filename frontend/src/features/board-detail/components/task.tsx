import { Button } from "@/components/ui/button";
import { EditTask } from "@/features/board-detail/components/edit-task";
import { cn } from "@/lib/utils";
import { ColumnsWithTasksResponse } from "@/types/api-response-types";
import { Draggable } from "@hello-pangea/dnd";
import { QueryKey } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { memo, useCallback, useState } from "react";

export type TaskProps = {
  task: ColumnsWithTasksResponse["tasks"][number];
  index: number;
  taskRef?: (node: HTMLElement | null) => void;
  columnsQueryKey: QueryKey;
};

function TaskComp(props: TaskProps) {
  const { task } = props;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Draggable draggableId={task.id} index={props.index}>
      {(provided, snapshot) => (
        <div
          ref={useCallback((node: HTMLDivElement | null) => {
            provided.innerRef(node);
            props.taskRef?.(node);
          }, [])}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 !cursor-default group"
        >
          {isEditing ? (
            <EditTask
              task={task}
              columnsQueryKey={props.columnsQueryKey}
              onComplete={() => {
                setIsEditing(false);
              }}
            />
          ) : (
            <div
              className={cn(
                "text-foreground p-2 rounded-lg min-h-16 border dark:hover:bg-gray-4 hover:bg-gray-3 flex justify-between",
                snapshot.isDragging
                  ? "shadow-inner bg-gray-4 dark:bg-gray-5 border-gray-10"
                  : "dark:border-transparent bg-white dark:bg-gray-3"
              )}
            >
              <span className="break-words">{task.name}</span>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-5 w-8 h-8 shrink-0"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export const Task = memo<TaskProps>(TaskComp);
