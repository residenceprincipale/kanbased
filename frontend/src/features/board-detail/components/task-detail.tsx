import { useRef } from "react";
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
import CodeMirrorEditor from "@/components/md-editor/md-editor";
import MdPreview from "@/components/md-preview/md-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkdownEditorPreviewToggle } from "@/hooks/use-markdown-editor";

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

  const editorRef = useRef<CodeMirrorEditorRefData>(null);
  const defaultContent = data?.content ?? "";

  const { parsedHtml, mode, handleModeChange, toggleModeShortcutKey } =
    useMarkdownEditorPreviewToggle({
      defaultContent,
      editorRef,
    });

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent
        onEscapeKeyDown={(e) => {
          const vimMode = editorRef.current?.getVimMode();

          // Always prevent Dialog from closing on Escape
          e.preventDefault();

          if (vimMode === "normal") {
            props.onClose();
          } else {
            // the prevent default is to prevent the dialog from closing
            // but codemirror vim mode checking defaultPrevented for escape which is not what we want
            // so we are manually handling the escape for vim
            editorRef.current?.handleEscapeForVim();
          }
        }}
        className="min-w-[90%] h-[90%] px-0 pl-5 flex flex-col"
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

            <div className="min-h-0 flex-1 h-full mt-4">
              <div className="w-full h-full relative min-h-0 border rounded-lg">
                <div className="absolute top-2 right-5 z-10">
                  <div className="flex items-center text-xs text-muted-foreground bg-muted rounded px-2 py-1">
                    <span>Toggle: </span>
                    <kbd className="inline-flex ml-1 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                      <span>{toggleModeShortcutKey}</span>
                    </kbd>
                  </div>
                </div>

                <Tabs
                  className="w-full h-full flex flex-col"
                  value={mode}
                  onValueChange={(value) =>
                    handleModeChange(value as "write" | "preview")
                  }
                >
                  <TabsList className="shrink-0 self-start flex items-center gap-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="write"
                    className="h-full flex-1 data-[state=inactive]:hidden min-h-0"
                    forceMount
                  >
                    <div className="min-h-0 h-full">
                      <CodeMirrorEditor
                        defaultAutoFocus={mode === "write"}
                        ref={editorRef}
                        defaultContent={defaultContent}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="preview"
                    className="h-full w-full flex-1 min-h-0 data-[state=inactive]:hidden"
                    forceMount
                  >
                    <MdPreview
                      html={parsedHtml}
                      wrapperClassName="max-w-[1000px] mx-auto"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
