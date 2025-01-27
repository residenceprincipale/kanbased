import { Tasks } from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/tasks";
import { ColumnWrapper } from "@/components/column-ui";
import { ColumnsQueryData } from "@/features/board-detail/columns/queries";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { EditableColumnName } from "@/features/board-detail/components/editable-column-name";

type ColumnProps = {
  column: ColumnsQueryData["columns"][number];
  index: number;
  columnRef?: (node: HTMLElement | null) => void;
};

export function Column({ column, index, columnRef }: ColumnProps) {
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
            <div className="flex items-center gap-1.5 justify-between shrink-0">
              <EditableColumnName
                columnName={column.name}
                columnId={column.id}
              />

              <button
                className="cursor-grab text-muted-foreground w-10 grid place-content-center h-10 hover:text-foreground shrink-0 hover:bg-gray-a-4 active:bg-gray-a-4 rounded-full active:cursor-grabbing"
                {...provided.dragHandleProps}
              >
                <GripVertical size={20} />
              </button>
            </div>
            <Tasks tasks={column.tasks} columnId={column.id} />
          </ColumnWrapper>
        );
      }}
    </Draggable>
  );
}
