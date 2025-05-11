import {Suspense, lazy, useRef, useState} from "react";
import {useQuery} from "@rocicorp/zero/react";
import {toast} from "sonner";
import type {CodeMirrorEditorRefData} from "@/components/md-editor/md-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getBoardWithColumnsAndTasksQuery,
  getTaskQuery,
} from "@/lib/zero-queries";
import {Spinner} from "@/components/ui/spinner";
import {useZ} from "@/lib/zero-cache";
import {EditableText} from "@/components/editable-text";
import {Button, buttonVariants} from "@/components/ui/button";
import {ArrowDown, ArrowUp} from "lucide-react";
import {WrappedTooltip} from "@/components/ui/tooltip";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";
import {useHotkeys} from "react-hotkeys-hook";
import {Link, useNavigate, useParams} from "@tanstack/react-router";

const EditTaskContentLazy = lazy(
  () => import("@/features/board-detail/edit-task-content"),
);

const ViewTaskContentLazy = lazy(
  () => import("@/features/board-detail/view-task-content"),
);

export function TaskDetail(props: {onClose: () => void; taskId: string}) {
  const editorRef = useRef<CodeMirrorEditorRefData>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const {slug} = useParams({from: "/_authenticated/_layout/boards_/$slug"});
  const z = useZ();
  const [data] = useQuery(getTaskQuery(z, props.taskId));
  const [board] = useQuery(getBoardWithColumnsAndTasksQuery(z, slug));
  const tasks =
    board?.columns?.find((col) => col.id === data?.columnId)?.tasks ?? [];
  const activeTaskIndex = tasks.findIndex((task) => task.id === data?.id);
  const previousTaskId = tasks[activeTaskIndex - 1]?.id;
  const nextTaskId = tasks[activeTaskIndex + 1]?.id;

  const navigateToTask = (taskId: string) => {
    navigate({
      to: ".",
      search: {
        taskId,
      },
    });
  };

  useHotkeys("k", () => previousTaskId && navigateToTask(previousTaskId), [
    previousTaskId,
  ]);

  useHotkeys("j", () => nextTaskId && navigateToTask(nextTaskId), [nextTaskId]);

  const handleTitleChange = (updatedTitle: string) => {
    z.mutate.tasksTable.update({
      id: data!.id,
      name: updatedTitle,
    });
  };

  const handleDelete = async () => {
    await z.mutate.tasksTable.update({
      id: data!.id,
      deletedAt: Date.now(),
    });

    toast.success("Task deleted");
    props.onClose();
  };

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const closeButton = document.querySelector("#dialog-close-button");
          (closeButton as HTMLElement | null)?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "";
        }}
        onEscapeKeyDown={(e) => {
          const vimMode = editorRef.current?.getVimMode();

          if (e.defaultPrevented) {
            e.preventDefault();
            return;
          }

          // Always prevent Dialog from closing on Escape
          e.preventDefault();

          if (!vimMode) {
            props.onClose();
          } else {
            // the prevent default is to prevent the dialog from closing
            // but codemirror vim mode checking defaultPrevented for escape which is not what we want
            // so we are manually handling the escape for vim
            editorRef.current?.handleEscapeForVim();
          }
        }}
        className="min-w-11/12 h-11/12 flex flex-col"
      >
        <>
          <DialogHeader className="w-9/12">
            <DialogTitle>
              <EditableText
                inputLabel="Task Name"
                fieldName="name"
                inputClassName="text-xl font-bold w-full"
                buttonClassName="text-xl font-bold"
                defaultValue={data?.name ?? ""}
                defaultMode="view"
                onSubmit={handleTitleChange}
              />
            </DialogTitle>
            <DialogDescription className="sr-only">
              Task detail for {data?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="absolute right-12 top-2 flex items-center">
            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              {previousTaskId ? (
                <Link
                  to="."
                  search={{taskId: previousTaskId}}
                  className={buttonVariants({variant: "ghost", size: "icon"})}
                >
                  <ArrowUp />
                </Link>
              ) : (
                <Button variant="ghost" size="icon" disabled>
                  <ArrowUp />
                </Button>
              )}

              <KeyboardShortcutIndicator label="Previous Task">
                K
              </KeyboardShortcutIndicator>
            </WrappedTooltip>

            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              {nextTaskId ? (
                <Link
                  to="."
                  search={{taskId: nextTaskId}}
                  className={buttonVariants({variant: "ghost", size: "icon"})}
                >
                  <ArrowDown />
                </Link>
              ) : (
                <Button variant="ghost" size="icon" disabled>
                  <ArrowDown />
                </Button>
              )}

              <KeyboardShortcutIndicator label="Next Task">
                J
              </KeyboardShortcutIndicator>
            </WrappedTooltip>
          </div>

          <div className="min-h-0 flex-1 h-full">
            {!isEditing && (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Spinner size="md" />
                  </div>
                }
              >
                <ViewTaskContentLazy
                  content={data?.content ?? ""}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                />
              </Suspense>
            )}

            {isEditing && (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center gap-2">
                    <Spinner />
                    Loading editor...
                  </div>
                }
              >
                {data !== undefined && (
                  <EditTaskContentLazy
                    defaultContent={data.content ?? ""}
                    editorRef={editorRef}
                    taskId={props.taskId}
                    afterSave={() => {
                      setIsEditing(false);
                    }}
                    exitEditorWithoutSaving={() => setIsEditing(false)}
                  />
                )}
              </Suspense>
            )}
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
}
