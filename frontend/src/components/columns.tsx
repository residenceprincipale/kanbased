import { Column } from "@/components/column";
import { useEffect, useRef, type FormEventHandler } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/openapi-react-query";
import { ColumnWrapper } from "@/components/ui/column";
import {
  setIsCreateColumnOpen,
  useGetIsCreateColumnOpen,
} from "@/routes/_blayout.boards.$boardName";
import { createOptimisticUpdate } from "@/lib/rq-helpers";
export function Columns(props: { boardName: string }) {
  const columnsQueryOptions = api.queryOptions("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });
  const { data: columns } = api.useQuery("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isCreateColOpen = useGetIsCreateColumnOpen();

  const createColumnMutation = api.useMutation(
    "post",
    "/columns",
    createOptimisticUpdate({
      queryKey: columnsQueryOptions.queryKey,
      optimisticUpdate: (old, mutationVariables: any) => [
        ...old,
        {
          boardId: columns?.[0]?.boardId ?? 0,
          id: crypto.randomUUID() as any,
          name: mutationVariables.body.name,
          position: columns?.length ?? 0 + 1,
          tasks: [],
        },
      ],
    })
  );

  const scrollToRight = () => {
    containerRef.current?.scrollTo({
      left: containerRef.current!.scrollWidth,
    });
  };

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const fd = new FormData(formEl);
    const name = fd.get("column-name") as string;

    createColumnMutation.mutate({
      body: {
        boardName: props.boardName,
        name,
        position: columns?.length ?? 0,
      },
    });
    formEl.reset();
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
            <Column column={column} />
          </li>
        ))}
      </ul>

      {isCreateColOpen && (
        <ColumnWrapper className="!h-[110px]">
          <form onSubmit={handleSubmit} className="px-2 pt-0.5">
            <Input
              id="column-name"
              name="column-name"
              placeholder="eg: work column"
              required
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsCreateColumnOpen(false);
                }
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsCreateColumnOpen(false);
                }
              }}
            />
          </form>
        </ColumnWrapper>
      )}
    </div>
  );
}
