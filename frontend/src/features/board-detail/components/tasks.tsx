import React, { memo, useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { useOverflowDetector } from "react-detectable-overflow";
import { ColumnsWithTasksQueryData } from "@/features/board-detail/queries/columns";
import { Task } from "@/features/board-detail/components/task";
import { CreateCard } from "@/features/board-detail/components/create-task";
import { QueryKey } from "@tanstack/react-query";

type TasksProps = {
  tasks: ColumnsWithTasksQueryData["columns"][number]["tasks"];
  columnId: string;
  columnsQueryKey: QueryKey;
};

function TaskList(
  props: TasksProps & { lastTaskRef: (node: HTMLElement | null) => void }
) {
  return (
    <>
      {[...props.tasks]
        .sort((a, b) => a.position - b.position)
        .map((task, i, arr) => {
          const isLastEl = arr.length - 1 === i;
          return (
            <Task
              task={task}
              key={task.id}
              taskRef={isLastEl ? props.lastTaskRef : undefined}
              index={i}
              columnsQueryKey={props.columnsQueryKey}
            />
          );
        })}
    </>
  );
}

const MemoizedTaskList = memo<React.ComponentProps<typeof TaskList>>(TaskList);

export function Tasks(props: TasksProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sortedTasks = [...props.tasks].sort((a, b) => a.position - b.position);
  const { ref: overflowRef, overflow } = useOverflowDetector({
    handleHeight: true,
    handleWidth: false,
  });

  function scrollList() {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  }

  const containerCbRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    containerRef.current = node;
    // @ts-ignore
    overflowRef.current = node;
  }, []);

  const lastTaskRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    /**
     * How is this not running on app mount?
     *  - Well it runs on app mount but `containerRef` will be null because it's a parent so does nothing.
     */
    scrollList();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Droppable
        droppableId={props.columnId}
        type="TASK"
        ignoreContainerClipping={false}
        isCombineEnabled={false}
      >
        {(droppableProvided) => {
          return (
            <div
              className={cn(
                "overflow-x-hidden custom-scrollbar flex-grow min-h-0",
                overflow ? "overflow-y-auto" : "overflow-y-hidden"
              )}
              {...droppableProvided.droppableProps}
              ref={containerCbRef}
            >
              <div ref={droppableProvided.innerRef} className="min-h-8 px-2">
                <MemoizedTaskList
                  columnId={props.columnId}
                  lastTaskRef={lastTaskRef}
                  tasks={props.tasks}
                  columnsQueryKey={props.columnsQueryKey}
                />

                {droppableProvided.placeholder}
              </div>
            </div>
          );
        }}
      </Droppable>

      <div className="shrink-0 mx-2 mt-3">
        {showAddTask ? (
          <CreateCard
            columnId={props.columnId}
            nextPosition={
              sortedTasks.length
                ? sortedTasks[sortedTasks.length - 1]!.position + 1
                : 10
            }
            onComplete={() => {
              setShowAddTask(false);
            }}
            columnsQueryKey={props.columnsQueryKey}
          />
        ) : (
          <Button
            onClick={() => {
              flushSync(() => {
                setShowAddTask(true);
              });
              scrollList();
            }}
            className="w-full"
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
