import { Button } from "@/components/ui/button";
import { EditTask } from "@/features/board-detail/components/edit-task";
import { useDeleteTaskMutation } from "@/features/board-detail/queries/tasks";
import { cn } from "@/lib/utils";
import { ColumnsWithTasksResponse } from "@/types/api-response-types";
import { Draggable } from "@hello-pangea/dnd";
import { QueryKey } from "@tanstack/react-query";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TaskProps = {
  task: ColumnsWithTasksResponse["tasks"][number];
  index: number;
  taskRef?: (node: HTMLElement | null) => void;
  columnsQueryKey: QueryKey;
};

function TaskComp(props: TaskProps) {
  const { task } = props;
  const [isEditing, setIsEditing] = useState(false);
  const deleteTaskMutation = useDeleteTaskMutation({
    columnsQueryKey: props.columnsQueryKey,
  });

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
                "text-foreground p-2 rounded-lg min-h-16 border dark:hover:bg-gray-4 hover:bg-gray-3 flex justify-between gap-1",
                snapshot.isDragging
                  ? "shadow-inner bg-gray-4 dark:bg-gray-5 border-gray-10"
                  : "dark:border-transparent bg-white dark:bg-gray-3"
              )}
            >
              <span className="break-words">{task.name}</span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity text-muted-foreground hover:text-foreground w-7 h-7 hover:bg-gray-5"
                    variant="ghost"
                    size="icon"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      deleteTaskMutation.mutate({
                        params: {
                          path: {
                            taskId: task.id,
                          },
                        },
                      });
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

export const Task = memo<TaskProps>(TaskComp);
