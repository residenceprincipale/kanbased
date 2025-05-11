import {Suspense, useRef, useState} from "react";
import {toast} from "sonner";
import {flushSync} from "react-dom";
import {Expand, Eye, Fullscreen, Minimize2, Pencil, Save} from "lucide-react";
import {useHotkeys} from "react-hotkeys-hook";
import type {
  CodeMirrorEditorRefData,
  EditorMode,
} from "@/components/md-editor/md-editor";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useMarkdownEditorPreviewToggle} from "@/hooks/use-markdown-editor";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";
import MdPreview from "@/components/md-preview/md-preview";
import CodeMirrorEditor from "@/components/md-editor/md-editor";
import {useKeyDown} from "@/hooks/use-keydown";
import {cn, createId} from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {EditableText} from "@/components/editable-text";
import {useZ} from "@/lib/zero-cache";
import {useActiveOrganizationId} from "@/queries/session";
import {WrappedTooltip} from "@/components/ui/tooltip";
import {useLocalStorage} from "@/hooks/use-local-storage";

type CommonProps = {
  afterSave: (data: {noteId: string}) => void;
  onClose: () => void;
};

type NoteEditorProps =
  | ({
      content: string;
      title: string;
      mode: "edit";
      noteId: string;
      defaultTab?: "write" | "preview";
    } & CommonProps)
  | ({
      mode: "create";
    } & CommonProps);

export default function NoteEditor(props: NoteEditorProps) {
  const [isDirty, setIsDirty] = useState(false);
  const isCreate = props.mode === "create";
  const editorRef = useRef<CodeMirrorEditorRefData>(null);
  const z = useZ();

  const defaultTitle = isCreate ? "Untitled Note" : props.title;
  const defaultContent = isCreate ? "" : props.content;

  const {
    parsedHtml,
    mode,
    handleModeChange,
    toggleModeKey,
    editorMode,
    setEditorMode,
  } = useMarkdownEditorPreviewToggle({
    defaultContent,
    editorRef,
    isDirty,
    defaultTab: !isCreate ? props.defaultTab : undefined,
  });

  const activeOrganizationId = useActiveOrganizationId();
  const [title, setTitle] = useState(defaultTitle);
  const content = useRef(defaultContent);
  const [isFullscreen, setIsFullscreen] = useLocalStorage(
    "note-editor-fullscreen",
    false,
  );

  useKeyDown((e) => {
    const isCtrlKey = e.metaKey || e.ctrlKey;
    if (isCtrlKey && e.key === "s") {
      e.preventDefault();
      if (!isDirty) return;

      handleSave();
    }

    if (isCtrlKey && e.shiftKey && e.key === "e") {
      e.preventDefault();
      props.onClose();
    }
  });

  useHotkeys(
    "Escape",
    () => {
      const vimMode = editorRef.current?.getVimMode();

      if (!vimMode || vimMode === "normal" || mode !== "write") {
        props.onClose();
      } else {
        // handle escape for vim, because it's not working in Codemirror editor
        editorRef.current?.handleEscapeForVim();
      }
    },

    {enableOnContentEditable: true},
  );

  const handleSave = () => {
    const noteId = isCreate ? createId() : props.noteId;
    const now = Date.now();

    z.mutate.notesTable.upsert({
      id: noteId,
      name: title,
      content: content.current,
      createdAt: now,
      updatedAt: isCreate ? null : now,
      organizationId: activeOrganizationId,
      creatorId: z.userID,
    });

    flushSync(() => {
      setIsDirty(false);
    });

    toast.success(isCreate ? "Note created" : "Note updated");
    props.afterSave({noteId});
  };

  const handleEditorModeChange = (mode: EditorMode) => {
    setEditorMode(mode);

    toast.info(`Editor mode changed to ${mode}`, {
      position: "bottom-center",
    });
  };

  const handleContentChange = (value: string) => {
    content.current = value;
    setIsDirty(true);
  };

  return (
    <Dialog open onOpenChange={props.onClose}>
      <DialogContent
        className={cn(
          "flex flex-col",
          isFullscreen
            ? "min-w-full h-screen p-4 gap-0"
            : "min-w-[95%] h-[95%] gap-2",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="min-w-80 max-w-fit">
            <EditableText
              inputLabel="Title"
              fieldName="title"
              inputClassName="text-xl font-bold w-80"
              buttonClassName="text-xl font-bold"
              defaultValue={title}
              defaultMode={isCreate ? "edit" : "view"}
              onSubmit={(updatedTitle) => {
                setTitle(updatedTitle);
                if (updatedTitle !== title) {
                  setIsDirty(true);
                }
                editorRef.current?.focus();
              }}
            />
          </DialogTitle>
          <DialogDescription className="sr-only">Create Note</DialogDescription>
        </DialogHeader>

        <div className="absolute right-10 top-1.5">
          {mode === "write" ? (
            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              <Button
                onClick={() => handleModeChange("preview")}
                variant="ghost"
                size="icon"
              >
                <Eye />
              </Button>

              <span>
                See Preview
                <KeyboardShortcutIndicator commandOrCtrlKey>
                  M
                </KeyboardShortcutIndicator>
              </span>
            </WrappedTooltip>
          ) : (
            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              <Button
                onClick={() => handleModeChange("write")}
                variant="ghost"
                size="icon"
              >
                <Pencil />
              </Button>

              <span>
                Edit
                <KeyboardShortcutIndicator commandOrCtrlKey>
                  M
                </KeyboardShortcutIndicator>
              </span>
            </WrappedTooltip>
          )}

          <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
            <Button
              onClick={handleSave}
              variant="ghost"
              size="icon"
              disabled={!isDirty}
              className={!isFullscreen ? "hidden" : ""}
            >
              <Save />
            </Button>

            <span>
              Save
              <KeyboardShortcutIndicator commandOrCtrlKey>
                S
              </KeyboardShortcutIndicator>
            </span>
          </WrappedTooltip>

          {isFullscreen ? (
            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              <Button
                onClick={() => setIsFullscreen(false)}
                variant="ghost"
                size="icon"
              >
                <Minimize2 />
              </Button>

              <span>Exit Zen Mode</span>
            </WrappedTooltip>
          ) : (
            <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(true)}
              >
                <Expand className="size-4" />
              </Button>

              <span>Toggle Zen Mode</span>
            </WrappedTooltip>
          )}
        </div>

        <div className="min-h-0 flex-1 h-full">
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center gap-2">
                <Spinner />
                Loading editor...
              </div>
            }
          >
            <div className="w-full h-full relative min-h-0">
              <Tabs
                className="w-full h-full flex flex-col"
                value={mode}
                onValueChange={(value) =>
                  handleModeChange(value as "write" | "preview")
                }
              >
                <div
                  className={cn(
                    "shrink-0 justify-between",
                    isFullscreen ? "hidden" : "flex",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <WrappedTooltip tooltipContentProps={{side: "bottom"}}>
                      <TabsList className="shrink-0 self-start flex items-center gap-2">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>

                      <KeyboardShortcutIndicator
                        label="Toggle mode"
                        commandOrCtrlKey
                      >
                        {toggleModeKey}
                      </KeyboardShortcutIndicator>
                    </WrappedTooltip>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSave}
                      type="button"
                      size="sm"
                      className="h-9"
                      disabled={!isDirty}
                    >
                      <>
                        <span>Save</span>
                        <KeyboardShortcutIndicator commandOrCtrlKey>
                          S
                        </KeyboardShortcutIndicator>
                      </>
                    </Button>
                  </div>
                </div>
                <TabsContent
                  value="write"
                  className={cn(
                    "h-full flex-1 data-[state=inactive]:hidden min-h-0",
                    isFullscreen && "mt-0",
                  )}
                  forceMount
                >
                  <div className="min-h-0 h-full">
                    <CodeMirrorEditor
                      ref={editorRef}
                      defaultContent={content.current}
                      defaultMode={editorMode}
                      defaultAutoFocus={!isCreate}
                      onModeChange={handleEditorModeChange}
                      onChange={handleContentChange}
                      key={editorMode}
                      onSave={handleSave}
                      onExitEditorWithoutSaving={props.onClose}
                      placeholder="Write your note here"
                      viewStyle={isFullscreen ? "zen" : "normal"}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="preview"
                  className={cn(
                    "h-full w-full flex-1 min-h-0 data-[state=inactive]:hidden",
                    isFullscreen && "mt-0",
                  )}
                  forceMount
                >
                  <MdPreview
                    html={parsedHtml}
                    wrapperClassName="max-w-[1000px] mx-auto"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
