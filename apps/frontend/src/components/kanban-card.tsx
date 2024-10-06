import { CreateCard } from "@/components/create-card";
import { Button } from "@/components/ui/button";
import { useGetStoreData } from "@/hooks/use-data-store";
import { useState } from "react";

export function KanbanColumns() {
  const columns = useGetStoreData("columns");
  const [showAddCard, setShowAddCard] = useState(false);

  return (
    <div className="pb-8 overflow-x-auto h-full">
      <ul className="flex gap-4">
        {columns
          ?.slice()
          .sort((a, b) => a.order - b.order)
          .map((column) => (
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

              {showAddCard && (
                <CreateCard
                  columnId={column.id}
                  nextOrder={columns.length}
                  onAddCard={() => setShowAddCard(false)}
                  onComplete={() => {
                    setShowAddCard(false);
                  }}
                />
              )}

              <Button
                onClick={() => setShowAddCard(true)}
                className="w-full"
                type="button"
                variant="secondary"
              >
                + Add a card
              </Button>
            </li>
          ))}
      </ul>
    </div>
  );
}
