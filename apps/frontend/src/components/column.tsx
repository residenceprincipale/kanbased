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
      className="w-80 p-2 bg-muted rounded-md space-y-3 shrink-0 border"
      key={column.id}
    >
      <h1 className="text-center text-xl font-semibold capitalize">
        {column.name}
      </h1>

      <ul className="space-y-3">
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
    </li>
  );
}
