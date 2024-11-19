import { Column } from "@/components/column";
import { api } from "@/lib/openapi-react-query";

export function Columns(props: { boardName: string }) {
  const { data: columns } = api.useQuery("get", "/columns", {
    params: { query: { boardName: props.boardName } },
  });

  return (
    <div className="pb-8 overflow-x-auto h-full">
      <ul className="flex gap-4 h-full">
        {columns!.map((column) => (
          <Column column={column} key={column.id} />
        ))}
      </ul>
    </div>
  );
}
