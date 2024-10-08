import { Column } from "@/components/column";
import { useGetStoreData } from "@/hooks/use-data-store";

export function Columns() {
  const columns = useGetStoreData("columns");

  return (
    <div className="pb-8 overflow-x-auto h-full">
      <ul className="flex gap-4 h-full">
        {columns
          ?.slice()
          .sort((a, b) => a.order - b.order)
          .map((column, _, arr) => (
            <Column
              column={column}
              columnsLength={arr.length}
              key={column.id}
            />
          ))}
      </ul>
    </div>
  );
}
