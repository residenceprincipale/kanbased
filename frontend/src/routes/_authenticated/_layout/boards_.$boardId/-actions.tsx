import {getRouteApi, useRouter} from "@tanstack/react-router";
import {TaskDetail} from "@/features/board-detail/task-detail";

const routeApi = getRouteApi("/_authenticated/_layout/boards_/$boardId");

export function TaskDetailPage() {
  const router = useRouter();
  const {taskId} = routeApi.useSearch();

  if (!taskId) {
    return null;
  }

  const handleClose = () => {
    router.navigate({
      to: ".",
      search: {taskId: undefined},
      replace: true,
    });

    setTimeout(() => {
      const el = document.querySelector(`#task-${taskId}`);
      if (el) {
        (el as HTMLElement).focus();
      }
    }, 100);
  };

  return <TaskDetail onClose={handleClose} taskId={taskId} />;
}
