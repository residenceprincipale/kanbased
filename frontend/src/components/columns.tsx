import { Column } from "@/components/column";
import { useEffect, useRef } from "react";
import { api } from "@/lib/openapi-react-query";
import {
  setIsCreateColumnOpen,
  useGetIsCreateColumnOpen,
} from "@/routes/_blayout.boards.$boardName";
import { getOptimisticQueryHelpers } from "@/lib/rq-helpers";
import { CreateColumn } from "@/components/create-column";

export function Columns(props: { boardName: string }) {
  const columnsQueryOptions = api.queryOptions("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });
  const { data: columns } = api.useQuery("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isCreateColOpen = useGetIsCreateColumnOpen();

  const scrollToRight = () => {
    containerRef.current?.scrollTo({
      left: containerRef.current!.scrollWidth,
    });
  };

  const optimisticHelpers = getOptimisticQueryHelpers(
    columnsQueryOptions.queryKey
  );

  const createColumnMutation = api.useMutation("post", "/columns", {
    onMutate: (variables) =>
      optimisticHelpers.onMutate((oldData: NonNullable<typeof columns>) => [
        ...oldData,
        {
          boardId: columns?.[0]?.boardId ?? 0,
          id: crypto.randomUUID() as any,
          name: variables.body.name,
          position: columns?.length ?? 0 + 1,
          tasks: [],
        },
      ]),
    onError: optimisticHelpers.onError,
    onSettled: optimisticHelpers.onSettled,
  });

  const closeCreateColumn = () => {
    setIsCreateColumnOpen(undefined);
  };

  const handleAddColumn = (newColumnName: string) => {
    createColumnMutation.mutate({
      body: {
        boardName: props.boardName,
        name: newColumnName,
        position: columns?.length ?? 0,
      },
    });
  };

  useEffect(() => {
    if (isCreateColOpen) {
      scrollToRight();
    }
  }, [columns, isCreateColOpen]);

  return (
    <div
      ref={containerRef}
      className="pb-8 overflow-x-auto h-full flex gap-4 px-8"
    >
      <ul className="flex gap-4 h-full">
        {columns!.map((column) => (
          <li key={column.id}>
            <Column
              column={column}
              columnsQueryKey={columnsQueryOptions.queryKey}
            />
          </li>
        ))}
      </ul>

      {isCreateColOpen && (
        <CreateColumn
          onCreateCancel={closeCreateColumn}
          onColumnAdd={handleAddColumn}
        />
      )}
    </div>
  );
}
