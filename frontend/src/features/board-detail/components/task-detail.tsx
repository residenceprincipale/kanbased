import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TaskDetail(props: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Task Detail</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
