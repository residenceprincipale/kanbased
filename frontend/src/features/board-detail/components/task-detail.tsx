import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { taskDetailQueryOptions } from "@/lib/query-options-factory";

export function TaskDetail(props: {
  onClose: () => void;
  taskId: string;
  columnsQueryKey: QueryKey;
}) {
  const { data } = useQuery(
    taskDetailQueryOptions({
      taskId: props.taskId,
      columnsQueryKey: props.columnsQueryKey,
    })
  );

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data?.name}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
