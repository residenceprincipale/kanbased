import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy, useRef } from "react";
import { CodeMirrorEditorRef } from "../components/md-editor/md-editor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/markdown")({
  component: MarkdownEditor,
});

const CodeMirrorEditor = lazy(
  () => import("../components/md-editor/md-editor")
);

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  const handleMarkdownChange = (value: string) => {};

  console.log("markdown re-rendering");

  return (
    <div className="flex flex-col h-screen">
      <React.Suspense fallback={<div className="p-4">Loading editor...</div>}>
        <CodeMirrorEditor
          onChange={handleMarkdownChange}
          defaultAutoFocus
          ref={editorRef}
        />
      </React.Suspense>
    </div>
  );
}
