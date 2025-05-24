import React, {memo, useRef, useState} from "react";
import {flushSync} from "react-dom";
import {Droppable} from "@hello-pangea/dnd";
import type {GetBoardWithColumnsAndTasksQueryResult} from "@/lib/zero-queries";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Task} from "@/features/board-detail/task";
import {CreateTask} from "@/features/board-detail/create-task";
import {FocusScope} from "@/components/focus-scope";

type TasksProps = {
  tasks: NonNullable<GetBoardWithColumnsAndTasksQueryResult>["columns"][number]["tasks"];
  columnId: string;
  readonly?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  autoFocusElementIndex?: number;
};

function TaskList(props: TasksProps) {
  return (
    <div ref={props.ref} className="min-h-8 px-2 mt-1">
      {props.tasks.map((task, i) => {
        return (
          <Task task={task} key={task.id} index={i} readonly={props.readonly} />
        );
      })}
    </div>
  );
}

const MemoizedTaskList = memo<React.ComponentProps<typeof TaskList>>(TaskList);

export function Tasks(props: TasksProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const addTaskButtonRef = useRef<HTMLButtonElement | null>(null);
  const sortedTasks = props.tasks;

  const scrollList = () => {
    containerRef.current?.scrollTo({top: containerRef.current.scrollHeight});
  };

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
                "custom-scrollbar grow min-h-0 overflow-y-auto overflow-x-hidden",
              )}
              {...droppableProvided.droppableProps}
              ref={containerRef}
              id={`col-${props.columnId}`}
            >
              <FocusScope
                autoFocusElementIndex={props.autoFocusElementIndex}
                shortcutType="list"
                eventListenerType="parent"
              >
                <MemoizedTaskList
                  columnId={props.columnId}
                  tasks={props.tasks}
                  readonly={props.readonly}
                  ref={droppableProvided.innerRef}
                />

                {droppableProvided.placeholder}
              </FocusScope>
            </div>
          );
        }}
      </Droppable>

      <div className="shrink-0 mx-2 mt-3">
        {showAddTask ? (
          <CreateTask
            columnId={props.columnId}
            nextPosition={
              sortedTasks.length
                ? sortedTasks[sortedTasks.length - 1]!.position + 1
                : 1000
            }
            onComplete={() => {
              flushSync(() => {
                setShowAddTask(false);
              });

              addTaskButtonRef.current?.focus();
            }}
            onAdd={() => {
              scrollList();
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
            ref={addTaskButtonRef}
            disabled={props.readonly}
          >
            + Add a task
          </Button>
        )}
      </div>
    </div>
  );
}
