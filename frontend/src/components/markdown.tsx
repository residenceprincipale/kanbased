import { useRef, useState, useEffect } from "react";
import CodeMirrorEditor, {
  CodeMirrorEditorRef,
} from "@/components/md-editor/md-editor";
import MdPreview from "@/components/md-preview/md-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Markdown({
  defaultContent = "",
}: {
  defaultContent?: string;
}) {
  const [markdownContent, setMarkdownContent] = useState(defaultContent);

  const [mode, setMode] = useState<"write" | "preview">("write");
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifierKey = isMac ? "⌘" : "Ctrl";

  const focusEditor = () => {
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  };

  const handleModeChange = (value: "write" | "preview") => {
    setMarkdownContent(editorRef.current?.getData() ?? "");
    setMode(value);
    if (value === "write") {
      focusEditor();
    }
  };

  const toggleMode = () => {
    let newMode: "write" | "preview" = "write";

    setMarkdownContent(editorRef.current?.getData() ?? "");
    setMode((prev) => {
      newMode = prev === "write" ? "preview" : "write";
      return newMode;
    });

    if (newMode === "write") {
      focusEditor();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+M or Cmd+M
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        toggleMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-full relative min-h-0 border rounded-lg">
      <div className="absolute top-2 right-5 z-10">
        <div className="flex items-center text-xs text-muted-foreground bg-muted rounded px-2 py-1">
          <span>Toggle: </span>
          <kbd className="inline-flex ml-1 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
            <span>{modifierKey} + M</span>
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
              defaultContent={markdownContent}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="preview"
          className="h-full w-full flex-1 min-h-0 data-[state=inactive]:hidden"
          forceMount
        >
          <MdPreview
            content={markdownContent}
            wrapperClassName="max-w-[1000px] mx-auto"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
