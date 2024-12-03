import { Tasks } from "@/features/tasks/tasks";
import { ColumnWrapper } from "@/components/column";
import { ColumnsQueryData } from "@/features/columns/queries";
import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { useCallback } from "react";

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
            as="li"
            ref={useCallback((node: HTMLElement | null) => {
              provided.innerRef(node);
              columnRef?.(node);
            }, [])}
            {...provided.draggableProps}
          >
            <div className="flex items-center gap-2 justify-between px-3">
              <h1 className="text-center text-xl font-semibold shrink-0">
                {column.name}
              </h1>

              <button {...provided.dragHandleProps}>
                <GripVertical />
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
