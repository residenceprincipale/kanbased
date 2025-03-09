import { CodeMirrorEditorRef } from "@/components/md-editor/md-editor";
import { markdownToHtml } from "@/lib/helpers";
import { useEffect } from "react";
import { useState } from "react";


const isMac =
  typeof window !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;



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
  const toggleModeModifierKey = isMac ? "⌘" : "Ctrl";
  const toggleModeKey = "M";
  const toggleModeShortcutKey = `${toggleModeModifierKey} + ${toggleModeKey}` as const;

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
