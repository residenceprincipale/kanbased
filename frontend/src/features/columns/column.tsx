import { Tasks } from "@/features/tasks/tasks";
import { ColumnWrapper } from "@/components/column";
import { ColumnsQueryData } from "@/features/columns/queries";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

type ColumnProps = {
  column: ColumnsQueryData["columns"][number];
  boardName: string;
  index: number;
  columnRef?: (node: HTMLElement | null) => void;
};

export function Column({ column, boardName, index, columnRef }: ColumnProps) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => {
        return (
          <ColumnWrapper
            ref={useCallback((node: HTMLElement | null) => {
              provided.innerRef(node);
              columnRef?.(node);
            }, [])}
            {...provided.draggableProps}
            id={`col-${column.id}`}
            className={cn(
              "mx-2",
              snapshot.isDragging && "!border-gray-10 !shadow-xl"
            )}
          >
            <div className="flex items-center gap-2 justify-between shrink-0">
              <h1 className="text-lg font-semibold flex-1 pl-3">
                {column.name}
              </h1>

              <button
                className="cursor-grab text-muted-foreground w-10 grid place-content-center h-10 hover:text-foreground shrink-0 hover:scale-110 transition-transform active:scale-90 hover:bg-gray-a-4 active:bg-gray-a-4 rounded-full active:cursor-grabbing"
                {...provided.dragHandleProps}
              >
                <GripVertical size={20} />
              </button>
            </div>
            <Tasks
              boardName={boardName}
              tasks={column.tasks}
              columnId={column.id}
            />
          </ColumnWrapper>
        );
      }}
    </Draggable>
  );
}
