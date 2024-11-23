import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CreateCard, CreateCardProps } from "@/components/create-card";
import { Button } from "@/components/ui/button";
import { Api200Response } from "@/types/type-helpers";
import { api } from "@/lib/openapi-react-query";
import { getOptimisticQueryHelpers } from "@/lib/rq-helpers";
import { QueryKey } from "@tanstack/react-query";

export function Tasks(props: {
  tasks: Api200Response<"/columns", "get">[number]["tasks"];
  columnId: number;
  columnsQueryKey: QueryKey;
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const optimisticHelpers = getOptimisticQueryHelpers(props.columnsQueryKey);
  const createTaskMutation = api.useMutation("post", "/tasks", {
    onMutate: (variables) =>
      optimisticHelpers.onMutate(
        (oldData: Api200Response<"/columns", "get">) => {
          return oldData.map((column) => {
            if (column.id === props.columnId) {
              return {
                ...column,
                tasks: [
                  ...column.tasks,
                  {
                    columnId: props.columnId,
                    id: crypto.randomUUID() as any,
                    name: variables.body.name,
                    position: props.tasks.length ?? 0,
                  },
                ],
              };
            }
            return column;
          });
        }
      ),
    onError: optimisticHelpers.onError,
    onSettled: optimisticHelpers.onSettled,
  });

  const handleAddCard: CreateCardProps["onAddCard"] = (data) => {
    createTaskMutation.mutate({
      body: {
        columnId: props.columnId,
        name: data.name,
        position: props.tasks.length ?? 0,
      },
    });
  };

  const scrollList = () => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  return (
    <div>
      <ul
        ref={listRef}
        className="space-y-3 flex-grow overflow-y-auto px-2 min-h-0"
      >
        {props.tasks.map((task) => {
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
            onAddCard={handleAddCard}
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
    </div>
  );
}
