import { CreateCard } from "@/components/create-card";
import { Button } from "@/components/ui/button";
import { ColumnWrapper } from "@/components/ui/column";
import { Api200Response } from "@/types/type-helpers";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

export function Column({
  column,
}: {
  column: Api200Response<"/columns", "get">[number];
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  let listRef = useRef<HTMLUListElement>(null);

  const scrollList = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  return (
    <ColumnWrapper>
      <h1 className="text-center px-2 text-xl font-semibold capitalize shrink-0">
        {column.name}
      </h1>

      <ul
        ref={listRef}
        className="space-y-3 flex-grow overflow-y-auto px-2 min-h-0"
      >
        {column.tasks.map((task) => {
          return (
            <li
              key={task.id}
              className="bg-background text-foreground p-2 rounded-md h-16"
            >
              {task.name}
            </li>
          );
        })}
      </ul>

      <div className="shrink-0 mx-2">
        {showAddCard ? (
          <CreateCard
            columnId={column.id}
            nextOrder={column.tasks.length}
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
            + Add a task
          </Button>
        )}
      </div>
    </ColumnWrapper>
  );
}
