import { Column } from "@/components/column";
import { CreateColumn } from "@/components/create-column";
import { api } from "@/lib/openapi-react-query";
import { useRef } from "react";

export function Columns(props: { boardName: string }) {
  const { data: columns } = api.useQuery("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="pb-8 overflow-x-auto h-full flex gap-4 px-8"
    >
      <ul className="flex gap-4 h-full">
        {columns!.map((column) => (
          <Column column={column} key={column.id} />
        ))}
      </ul>
      <CreateColumn
        boardName={props.boardName}
        lastPosition={columns?.length ?? 0}
        onAdd={() => {
          if (!containerRef.current) return;
          setTimeout(() => {
            containerRef.current!.scrollLeft =
              containerRef.current!.scrollWidth;
          }, 100);
        }}
      />
    </div>
  );
}
