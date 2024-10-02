import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import { listColumns } from "@/lib/queries";
import { useSubscribe } from "replicache-react";

export function KanbanCard() {
  const rep = useRepContext();
  const columns = useSubscribe(rep, listColumns, { default: [] });

  return columns.map((column) => (
    <ul className="w-80 bg-muted p-2 rounded-md space-y-3" key={column.id}>
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
    </ul>
  ));
}
