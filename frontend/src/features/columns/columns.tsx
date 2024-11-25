import { Column } from "@/features/columns/column";
import { useCallback, useRef } from "react";
import { CreateColumn } from "@/features/columns/create-column";
import { useColumnsSuspenseQuery } from "@/features/columns/queries";

export function Columns(props: { boardName: string }) {
  const { data } = useColumnsSuspenseQuery(props.boardName);
  const columns = data.columns;

  const containerRef = useRef<HTMLDivElement>(null);

  console.log(
    "columns",
    [...columns].sort((a, b) => a.position - b.position)
  );
  const columnRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    containerRef.current?.scrollTo({
      left: containerRef.current!.scrollWidth,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="pb-8 overflow-x-auto h-full flex gap-4 px-8"
    >
      <ul className="flex gap-4 h-full">
        {[...columns]
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <li key={column.id}>
              <Column
                boardName={props.boardName}
                column={column}
                ref={columnRef}
              />
            </li>
          ))}
      </ul>

      <CreateColumn
        boardName={props.boardName}
        nextPosition={columns?.length ?? 0}
      />
    </div>
  );
}
