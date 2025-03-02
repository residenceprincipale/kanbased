import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy, useRef } from "react";
import { CodeMirrorEditorRef } from "../components/CodeMirrorEditor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/markdown")({
  component: MarkdownEditor,
});

const CodeMirrorEditor = lazy(() => import("../components/CodeMirrorEditor"));

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  const handleMarkdownChange = (value: string) => {};

  console.log("markdown re-rendering");

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="w-1/2 border-r border-gray-300 overflow-auto">
          <React.Suspense
            fallback={<div className="p-4">Loading editor...</div>}
          >
            <CodeMirrorEditor
              onChange={handleMarkdownChange}
              defaultAutoFocus
              ref={editorRef}
            />
          </React.Suspense>
        </div>

        <Button
          type="button"
          onClick={() => {
            setMarkdown(editorRef.current?.getData() ?? "");
          }}
        >
          See preview
        </Button>

        {/* Preview pane */}
        <div className="w-1/2 p-4 overflow-auto ">
          <div className="prose max-w-none dark:prose-invert" />
          {markdown}
        </div>
      </div>
    </div>
  );
}
