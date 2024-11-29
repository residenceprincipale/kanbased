import { Tasks } from "@/features/tasks/tasks";
import { forwardRef } from "react";

type TaskProps = {
  task: Tasks[number];
  boardName: string;
  previousPosition: number;
  nextPosition: number;
};

export const Task = forwardRef<HTMLLIElement, TaskProps>((props, ref) => {
  const { task } = props;

  return (
    <li ref={ref}>
      <div className="bg-background text-foreground p-2 rounded-md h-16">
        {task.name}
      </div>
    </li>
  );
});
