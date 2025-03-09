import React, { memo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ColumnsWithTasksQueryData } from "@/features/board-detail/queries/columns";
import { Task } from "@/features/board-detail/components/task";
import { CreateCard } from "@/features/board-detail/components/create-task";
import { QueryKey } from "@tanstack/react-query";

type TasksProps = {
  tasks: ColumnsWithTasksQueryData["columns"][number]["tasks"];
  columnId: string;
  columnsQueryKey: QueryKey;
};

function TaskList(props: TasksProps) {
  return (
    <>
      {[...props.tasks]
        .sort((a, b) => a.position - b.position)
        .map((task, i, arr) => {
          return (
            <Task
              task={task}
              key={task.id}
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
  const prevTaskCountRef = useRef(props.tasks.length);
  const sortedTasks = [...props.tasks].sort((a, b) => a.position - b.position);

  const scrollList = () => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
  };

  const autoScrollForNewTask = () => {
    // I went with this approach instead of using useEffect
    // because I see there is a delay in the scrolling when using useEffect
    // making it janky. I might refactor this in the future.
    if (props.tasks.length === prevTaskCountRef.current) return;

    const isNewTaskAdded = props.tasks.length > prevTaskCountRef.current;

    if (isNewTaskAdded) {
      requestAnimationFrame(() => {
        scrollList();
      });
      prevTaskCountRef.current = props.tasks.length;
    } else {
      // Update the ref if tasks were removed
      prevTaskCountRef.current = props.tasks.length;
    }
  };

  autoScrollForNewTask();

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
                "custom-scrollbar flex-grow min-h-0 overflow-y-auto overflow-x-hidden"
              )}
              {...droppableProvided.droppableProps}
              ref={containerRef}
              id={`col-${props.columnId}`}
            >
              <div
                ref={droppableProvided.innerRef}
                className="min-h-8 px-2 mt-1"
              >
                <MemoizedTaskList
                  columnId={props.columnId}
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
