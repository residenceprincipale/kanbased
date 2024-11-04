import { Column } from "@/components/column";

export function Columns() {
  const columns: any[] = [];

  return (
    <div className="pb-8 overflow-x-auto h-full">
      <ul className="flex gap-4 h-full">
        {columns?.map((column) => (
          <Column column={column} key={column.id} />
        ))}
      </ul>
    </div>
  );
}
