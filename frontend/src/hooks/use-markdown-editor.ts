import { CodeMirrorEditorRef } from "@/components/md-editor/md-editor";
import { ctrlKeyLabel } from "@/lib/constants";
import { markdownToHtml } from "@/lib/helpers";
import { useEffect } from "react";
import { useState } from "react";





type Mode = "write" | "preview";

export function useMarkdownEditorPreviewToggle({
  defaultContent = "",
  editorRef,
}: {
  defaultContent?: string;
  editorRef: CodeMirrorEditorRef;
}) {
  const [parsedHtml, setParsedHtml] = useState(() => markdownToHtml(defaultContent));
  const [mode, setMode] = useState<Mode>("write");
  const toggleModeKey = "M";
  const toggleModeShortcutKey = `${ctrlKeyLabel} + ${toggleModeKey}` as const;

  const getMarkdown = () => {
    return editorRef.current?.getData() ?? "";
  };

  const updateMarkdownToHtml = () => {
    const markdown = getMarkdown();
    const html = markdownToHtml(markdown);
    setParsedHtml(html);
  };

  const focusEditor = () => {
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  };

  const handleModeChange = (value: Mode) => {
    setMode(value);

    if (value === "write") {
      focusEditor();
    } else if (value === "preview") {
      updateMarkdownToHtml();
    }
  };

  const toggleMode = () => {
    let newMode: Mode = "write";

    setMode((prev) => {
      newMode = prev === "write" ? "preview" : "write";
      return newMode;
    });

    if (newMode === "write") {
      focusEditor();
    } else if (newMode === "preview") {
      updateMarkdownToHtml();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === toggleModeKey.toLowerCase()) {
        e.preventDefault();
        toggleMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    parsedHtml,
    mode,
    handleModeChange,
    toggleModeShortcutKey,
  };
}
