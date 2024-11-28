import { Tasks } from "@/features/tasks/tasks";
import { ColumnWrapper } from "@/components/column";
import { ColumnsQueryData } from "@/features/columns/queries";
import { forwardRef } from "react";

export const Column = forwardRef<
  HTMLDivElement,
  {
    column: ColumnsQueryData["columns"][number];
    boardName: string;
  }
>(({ column, boardName }, ref) => {
  return (
    <ColumnWrapper ref={ref}>
      <h1 className="text-center px-2 text-xl font-semibold shrink-0">
        {column.name}
      </h1>
      <Tasks boardName={boardName} tasks={column.tasks} columnId={column.id} />
    </ColumnWrapper>
  );
});
