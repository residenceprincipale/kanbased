import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { getColumnsQuery } from "@/lib/query-options-factory";
import { Api200Response } from "@/types/type-helpers";
import { QueryKey, useSuspenseQuery } from "@tanstack/react-query";

export type ColumnsQueryResponse = Api200Response<"/columns", "get">;

export function useColumnsSuspenseQuery(boardName: string) {
  const queryOptions = getColumnsQuery(boardName);
  return useSuspenseQuery({
    ...queryOptions,
    select: transformColumnsQuery,
  });
}

export function transformColumnsQuery(data: ColumnsQueryResponse) {
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
    columns: Array.from(columnWithTasksMap.values()),
  };
}

export type ColumnsQueryData = ReturnType<typeof transformColumnsQuery>;

export function useCreateColumnMutation(boardName: string) {
  const queryKey = getColumnsQuery(boardName).queryKey;
  const mutationKey = ["post", "/columns"];

  return api.useMutation("post", "/columns", {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
          return {
            ...oldData,
            columns: [
              ...oldData.columns,
              {
                boardId: oldData.boardId,
                id: variables.body.id!,
                name: variables.body.name,
                position: variables.body.position,
              },
            ],
          };
        }
      );

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      const isMutating = queryClient.isMutating({ mutationKey });
      if (isMutating <= 1) {
        return queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useMoveColumnsMutation(
  boardName: string,
  afterOptimisticUpdate?: () => void
) {
  const queryKey = getColumnsQuery(boardName).queryKey;
  const mutationKey = ["put", "/columns"];

  return api.useMutation("patch", "/columns/reorder", {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);
      const updatedColPositions = variables.body;

      queryClient.setQueryData(
        queryKey,
        (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
          return {
            ...oldData,
            columns: oldData.columns.map((col) => {
              const updatedPosition = updatedColPositions.find(
                (updatedCol) => updatedCol.id === col.id
              )?.position;
              return { ...col, position: updatedPosition ?? col.position };
            }),
          };
        }
      );

      afterOptimisticUpdate?.();

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      const isMutating = queryClient.isMutating({ mutationKey });
      if (isMutating <= 1) {
        return queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useCreateTaskMutation(boardName: string) {
  const queryKey = getColumnsQuery(boardName).queryKey;
  const mutationKey = ["post", "/tasks"];

  return api.useMutation("post", "/tasks", {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
          return {
            ...oldData,
            tasks: [
              ...oldData.tasks,
              {
                columnId: variables.body.columnId,
                id: variables.body.id,
                name: variables.body.name,
                position: variables.body.position,
              },
            ],
          };
        }
      );

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      const isMutating = queryClient.isMutating({ mutationKey });
      if (isMutating <= 1) {
        return queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useMoveTasksMutation(
  boardName: string,
  afterOptimisticUpdate?: () => void
) {
  const queryKey = getColumnsQuery(boardName).queryKey;
  const mutationKey = ["put", "/tasks/{id}"];

  return api.useMutation("put", "/tasks", {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      const taskPositionMap = new Map<
        string,
        { columnId: string; position: number }
      >(
        variables.body.map((task) => [
          task.id,
          { columnId: task.columnId, position: task.position },
        ])
      );

      queryClient.setQueryData(
        queryKey,
        (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
          return {
            ...oldData,
            tasks: oldData.tasks.map((task) =>
              taskPositionMap.has(task.id)
                ? { ...task, ...taskPositionMap.get(task.id) }
                : task
            ),
          };
        }
      );

      afterOptimisticUpdate?.();

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      const isMutating = queryClient.isMutating({ mutationKey });
      if (isMutating <= 1) {
        return queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

export function useEditColumnMutation({ getColumnsApiQueryKey: queryKey, afterOptimisticUpdate }: { getColumnsApiQueryKey: QueryKey, afterOptimisticUpdate?: () => void }) {
  return api.useMutation("patch", "/columns/{columnId}", {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: ColumnsQueryResponse): ColumnsQueryResponse => {
          return {
            ...oldData,
            columns: oldData.columns.map((column) =>
              column.id === variables.params.path.columnId
                ? { ...column, name: variables.body.name }
                : column
            ),
          };
        }
      );

      afterOptimisticUpdate?.();

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
  });
}
