import { Button } from "@/components/ui/button";
import { useSubscribe } from "@/hooks/useSubscribe";
import { listColumns } from "@/lib/queries";

export function KanbanColumns() {
  const columns = useSubscribe(
    listColumns,
    (state) => state.boards,
    (state) => state.updateBoards
  );

  return (
    <div className="pb-8 overflow-x-auto">
      <ul className="flex gap-4">
        {columns.map((column) => (
          <li
            className="w-80 p-2 bg-muted rounded-md space-y-3 shrink-0 border"
            key={column.id}
          >
            <h1 className="text-center text-xl font-semibold capitalize">
              {column.name}
            </h1>

            <ul className="space-y-3">
              <li className="bg-background text-foreground p-2 rounded-md h-16">
                New e-commerce for designer
              </li>
            </ul>
            <Button className="w-full" type="button" variant="secondary">
              + Add a card
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
