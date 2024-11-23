import { Tasks } from "@/components/tasks";
import { ColumnWrapper } from "@/components/ui/column";
import { Api200Response } from "@/types/type-helpers";
import { QueryKey } from "@tanstack/react-query";

export function Column({
  column,
  columnsQueryKey,
}: {
  column: Api200Response<"/columns", "get">[number];
  columnsQueryKey: QueryKey;
}) {
  return (
    <ColumnWrapper>
      <h1 className="text-center px-2 text-xl font-semibold capitalize shrink-0">
        {column.name}
      </h1>
      <Tasks
        tasks={column.tasks}
        columnId={column.id}
        columnsQueryKey={columnsQueryKey}
      />
    </ColumnWrapper>
  );
}
