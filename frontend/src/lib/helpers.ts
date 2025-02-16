import { ColumnsWithTasksResponse } from "@/types/api-response-types";

export function transformColumnsQuery(data: ColumnsWithTasksResponse) {
  type ColumnWithTasks = (typeof data.columns)[number] & {
    tasks: typeof data.tasks;
  };
  const columnWithTasksMap = new Map<string, ColumnWithTasks>();

  for (let column of data.columns) {
    columnWithTasksMap.set(column.id, Object.assign(column, { tasks: [] }));
  }

  for (let task of data.tasks) {
    if (columnWithTasksMap.has(task.columnId)) {
      const tasks = columnWithTasksMap.get(task.columnId)!.tasks;
      tasks.push(task);
    }
  }

  return {
    boardId: data.boardId,
    boardName: data.boardName,
    columns: Array.from(columnWithTasksMap.values()).sort(
      (a, b) => a.position - b.position
    ),
  };
}