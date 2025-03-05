import { useRouter } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { TaskDetail } from "@/features/board-detail/components/task-detail";

const routeApi = getRouteApi("/_authenticated/_layout/boards_/$boardUrl");

export function TaskDetailPage() {
  const router = useRouter();
  const { taskId } = routeApi.useSearch();

  if (!taskId) {
    return null;
  }

  const handleClose = () => {
    router.navigate({
      to: ".",
      search: { taskId: undefined },
    });
  };

  return <TaskDetail onClose={handleClose} />;
}
