import React, { memo, useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CreateCard } from "@/features/tasks/create-task";
import { Button } from "@/components/ui/button";
import { ColumnsQueryData } from "@/features/columns/queries";
import { Task, TaskProps } from "@/features/tasks/task";
import { Droppable } from "@hello-pangea/dnd";

export type Tasks = ColumnsQueryData["columns"][number]["tasks"];

type TasksProps = {
  tasks: Tasks;
  columnId: string;
  boardName: string;
};

function TaskList(props: TasksProps & { lastTaskRef: TaskProps["taskRef"] }) {
  return (
    <>
      {props.tasks.map((task, i, arr) => {
        const isLastEl = arr.length - 1 === i;
        return (
          <Task
            task={task}
            key={task.id}
            taskRef={isLastEl ? props.lastTaskRef : undefined}
            boardName={props.boardName}
            index={i}
            previousPosition={
              i == 0 ? arr[i]!.position - 1 : arr[i - 1]!.position
            }
            nextPosition={
              isLastEl ? arr[i]!.position + 1 : arr[i + 1]!.position
            }
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

  function scrollList() {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  }

  const lastTaskRef = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    /**
     * How is this not running on app mount?
     *  - Well it runs on app mount but `containerRef` will be null because it a parent so does nothing.
     */
    scrollList();
  }, []);

  const updateParentCSSVariable = (isDragging: boolean) => {
    const columnWrapperEl = document.getElementById(`col-${props.columnId}`);
    if (!columnWrapperEl) return;

    if (isDragging) {
      columnWrapperEl.style.height = "100%";
    } else {
      columnWrapperEl.style.height = "fit-content";
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Droppable
        droppableId={props.columnId}
        type="TASK"
        ignoreContainerClipping={false}
        isCombineEnabled={false}
      >
        {(droppableProvided, droppableSnapshot) => {
          return (
            <div
              className="overflow-x-hidden overflow-y-auto flex-grow min-h-0"
              {...droppableProvided.droppableProps}
              ref={containerRef}
            >
              <div
                ref={droppableProvided.innerRef}
                className="min-h-8 px-2 space-y-3"
              >
                <MemoizedTaskList
                  boardName={props.boardName}
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
