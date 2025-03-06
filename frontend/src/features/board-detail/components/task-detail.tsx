import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { taskDetailQueryOptions } from "@/lib/query-options-factory";
import Markdown from "@/components/markdown";
import { FullScreenError } from "@/components/errors";

export function TaskDetail(props: {
  onClose: () => void;
  taskId: string;
  columnsQueryKey: QueryKey;
}) {
  const { data, isPlaceholderData, error, isError } = useQuery(
    taskDetailQueryOptions({
      taskId: props.taskId,
      columnsQueryKey: props.columnsQueryKey,
    })
  );

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent className="min-w-[90%] h-[90%] px-0 pl-5 flex flex-col">
        {isError ? (
          <FullScreenError
            title="Error loading task"
            message={error?.message}
          />
        ) : (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>{data?.name}</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 h-full mt-4">
              <Markdown defaultContent={data?.content ?? undefined} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
