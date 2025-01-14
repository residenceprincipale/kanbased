import React, { memo, useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CreateCard } from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/create-task";
import { Button } from "@/components/ui/button";
import { ColumnsQueryData } from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/queries";
import {
  Task,
  TaskProps,
} from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/task";
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { useOverflowDetector } from "react-detectable-overflow";

export type Tasks = ColumnsQueryData["columns"][number]["tasks"];

type TasksProps = {
  tasks: Tasks;
  columnId: string;
};

function TaskList(props: TasksProps & { lastTaskRef: TaskProps["taskRef"] }) {
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
