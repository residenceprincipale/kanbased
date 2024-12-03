import { Tasks } from "@/features/tasks/tasks";
import { Draggable } from "@hello-pangea/dnd";
import { forwardRef, useCallback } from "react";

type TaskProps = {
  task: Tasks[number];
  boardName: string;
  previousPosition: number;
  nextPosition: number;
  index: number;
  taskRef?: (node: HTMLElement | null) => void;
};

export function Task(props: TaskProps) {
  const { task } = props;

  return (
    <Draggable draggableId={task.id} index={props.index}>
      {(provided, snapshot) => (
        <li
          ref={useCallback((node: HTMLLIElement | null) => {
            provided.innerRef(node);
            props.taskRef?.(node);
          }, [])}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-is-dragging={snapshot.isDragging}
          data-testid={task.id}
          data-index={props.index}
        >
          <div className="bg-background text-foreground p-2 rounded-md h-16">
            {task.name}
          </div>
        </li>
      )}
    </Draggable>
  );
}
