import { CreateCard } from "@/components/create-card";
import { Button } from "@/components/ui/button";
import type { ColumnWithCard } from "@/lib/queries";
import type { Column } from "@kanbased/shared/src/mutators";
import { useState } from "react";

export function Column({
  column,
  columnsLength,
}: {
  column: ColumnWithCard;
  columnsLength: number;
}) {
  const [showAddCard, setShowAddCard] = useState(false);

  return (
    <li
      className="w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border h-full flex flex-col"
      key={column.id}
    >
      <h1 className="text-center px-2 text-xl font-semibold capitalize shrink-0">
        {column.name}
      </h1>

      <ul className="space-y-3 h-full flex-1 overflow-y-auto px-2">
        {column.cards.map((card) => {
          return (
            <li
              key={card.id}
              className="bg-background text-foreground p-2 rounded-md h-16"
            >
              {card.name}
            </li>
          );
        })}
      </ul>

      <div className="shrink-0">
        {showAddCard ? (
          <CreateCard
            columnId={column.id}
            boardId={column.boardId}
            nextOrder={columnsLength}
            onAddCard={() => {}}
            onComplete={() => {
              setShowAddCard(false);
            }}
          />
        ) : (
          <Button
            onClick={() => setShowAddCard(true)}
            className="w-full"
            type="button"
            variant="secondary"
          >
            + Add a card
          </Button>
        )}
      </div>
    </li>
  );
}
