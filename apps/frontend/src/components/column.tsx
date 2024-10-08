import { CreateCard } from "@/components/create-card";
import { Button } from "@/components/ui/button";
import type { ColumnWithCard } from "@/lib/queries";
import { promiseTimeout } from "@/lib/utils";
import type { Column } from "@kanbased/shared/src/mutators";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

export function Column({ column }: { column: ColumnWithCard }) {
  const [showAddCard, setShowAddCard] = useState(false);
  let listRef = useRef<HTMLUListElement>(null);

  const scrollList = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  return (
    <li
      className="w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit"
      key={column.id}
    >
      <h1 className="text-center px-2 text-xl font-semibold capitalize shrink-0">
        {column.name}
      </h1>

      <ul
        ref={listRef}
        className="space-y-3 flex-grow overflow-y-auto px-2 min-h-0"
      >
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

      <div className="shrink-0 mx-2">
        {showAddCard ? (
          <CreateCard
            columnId={column.id}
            boardId={column.boardId}
            nextOrder={column.cards.length}
            onAddCard={() => scrollList()}
            onComplete={() => {
              setShowAddCard(false);
            }}
          />
        ) : (
          <Button
            onClick={() => {
              flushSync(() => {
                setShowAddCard(true);
              });
              scrollList();
            }}
            className="w-full hover:!bg-primary-foreground"
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
