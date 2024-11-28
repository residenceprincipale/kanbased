import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CreateCard } from "@/features/tasks/create-task";
import { Button } from "@/components/ui/button";
import { ColumnsQueryData } from "@/features/columns/queries";
import { Task } from "@/features/tasks/task";

export type Tasks = ColumnsQueryData["columns"][number]["tasks"];

export function Tasks(props: {
  tasks: Tasks;
  columnId: string;
  boardName: string;
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const sortedTasks = [...props.tasks].sort((a, b) => a.position - b.position);

  function scrollList() {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }

  const lastTaskRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    /**
     * How is this not running on app mount?
     *  - Well it runs on app mount but `listRef` will be null because it a parent so does nothing.
     */
    scrollList();
  }, []);

  return (
    <div className="min-h-0 flex-grow flex flex-col">
      <ul
        ref={listRef}
        className="space-y-3 flex-grow overflow-y-auto px-2 min-h-0"
      >
        {sortedTasks.map((task, i, arr) => {
          const isLastEl = arr.length - 1 === i;
          return (
            <Task
              task={task}
              key={task.id}
              ref={isLastEl ? lastTaskRef : undefined}
              boardName={props.boardName}
              previousPosition={
                i == 0 ? arr[i]!.position - 1 : arr[i - 1]!.position
              }
              nextPosition={
                isLastEl ? arr[i]!.position + 1 : arr[i + 1]!.position
              }
            />
          );
        })}
      </ul>

      <div className="shrink-0 mx-2 mt-3">
        {showAddTask ? (
          <CreateCard
            boardName={props.boardName}
            columnId={props.columnId}
            nextPosition={
              sortedTasks.length
                ? sortedTasks[sortedTasks.length - 1]!.position + 1
                : 1
            }
            onComplete={() => {
              setShowAddTask(false);
            }}
          />
        ) : (
          <Button
            onClick={() => {
              flushSync(() => {
                setShowAddTask(true);
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
