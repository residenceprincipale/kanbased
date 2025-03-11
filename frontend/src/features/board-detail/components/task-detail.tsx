import { useRef, Suspense, lazy, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { taskDetailQueryOptions } from "@/lib/query-options-factory";
import { FullScreenError } from "@/components/errors";
import { CodeMirrorEditorRefData } from "@/components/md-editor/md-editor";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutIndicator } from "@/components/keyboard-shortcut";
import { ctrlKeyLabel } from "@/lib/constants";

const EditTaskContentLazy = lazy(
  () => import("@/features/board-detail/components/edit-task-content")
);

const ViewTaskContentLazy = lazy(
  () => import("@/features/board-detail/components/view-task-content")
);

export function TaskDetail(props: {
  onClose: () => void;
  taskId: string;
  columnsQueryKey: QueryKey;
}) {
  const taskDetailQueryOpt = taskDetailQueryOptions({
    taskId: props.taskId,
    columnsQueryKey: props.columnsQueryKey,
  });

  const { data, isFetching, error, isError } = useQuery(taskDetailQueryOpt);
  const editorRef = useRef<CodeMirrorEditorRefData>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => {
          const vimMode = editorRef.current?.getVimMode();

          // Always prevent Dialog from closing on Escape
          e.preventDefault();

          if (!vimMode || vimMode === "normal") {
            props.onClose();
          } else {
            // the prevent default is to prevent the dialog from closing
            // but codemirror vim mode checking defaultPrevented for escape which is not what we want
            // so we are manually handling the escape for vim
            editorRef.current?.handleEscapeForVim();
          }
        }}
        className="min-w-[90%] h-[90%] flex flex-col gap-2"
      >
        {isError ? (
          <FullScreenError
            title="Error loading task"
            message={error?.message}
          />
        ) : (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle>{data?.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Task detail for {data?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 h-full">
              {isFetching && (
                <div className="w-full h-full flex items-center justify-center gap-2">
                  <Spinner /> <span>Getting task details...</span>
                </div>
              )}

              {!isFetching &&
                data !== undefined &&
                (isEditing ? (
                  <Suspense fallback="Loading editor...">
                    {" "}
                    <div className="w-full h-full relative min-h-0 pt-2 rounded-lg">
                      <EditTaskContentLazy
                        defaultContent={data.content ?? ""}
                        editorRef={editorRef}
                        taskId={props.taskId}
                        afterSave={() => setIsEditing(false)}
                      />
                    </div>
                  </Suspense>
                ) : (
                  <Suspense fallback="Loading content...">
                    <div className="w-full h-full flex flex-col gap-2">
                      <Button
                        className="ml-auto shrink-0"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                        <KeyboardShortcutIndicator>
                          {ctrlKeyLabel} + E
                        </KeyboardShortcutIndicator>
                      </Button>

                      <div className="flex-1 h-full overflow-y-auto">
                        <ViewTaskContentLazy
                          content={data.content ?? ""}
                          wrapperClassName="p-0"
                        />
                      </div>
                    </div>
                  </Suspense>
                ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
