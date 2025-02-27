import React, { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { vim, Vim } from "@replit/codemirror-vim";
import { marked } from "marked";

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  onPreviewUpdate: (html: string) => void;
}

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  onPreviewUpdate,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initializedRef = useRef(false);
  const [vimMode, setVimMode] = useState("normal");

  useEffect(() => {
    // Only initialize the editor once
    if (initializedRef.current || !editorRef.current) return;
    initializedRef.current = true;

    // Parse initial markdown for preview
    const initialHtml = marked.parse(value) as string;
    onPreviewUpdate(initialHtml);

    // Create the editor
    const state = EditorState.create({
      doc: value,
      extensions: [
        vim(),
        basicSetup,
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);

            // Update preview
            const html = marked.parse(newValue) as string;
            onPreviewUpdate(html);
          }
        }),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "16px",
          },
          ".cm-scroller": {
            fontFamily: "monospace",
            overflow: "auto",
          },
          ".cm-content": {
            caretColor: "#0e9",
            padding: "10px",
          },
          ".cm-cursor": {
            borderLeftColor: "#0e9",
          },
          "&.cm-focused .cm-cursor": {
            borderLeftWidth: "2px",
          },
          ".cm-line": {
            padding: "0 4px",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Set up some helpful Vim keybindings
    const cm = Vim.cm;
    if (cm) {
      // Add some common Vim mappings
      Vim.map("jj", "<Esc>", "insert");

      // Define a command to save (can be triggered with :w)
      Vim.defineEx("write", "w", () => {
        console.log("Save command triggered");
        // You could implement actual saving functionality here
      });

      // Track Vim mode changes
      const originalSetOption = Vim.setOption;
      // @ts-ignore - We're monkey patching the Vim API
      Vim.setOption = function (...args: any[]) {
        if (args[0] === "keyMap") {
          const mode = args[1].toLowerCase();
          if (mode.includes("insert")) {
            setVimMode("insert");
          } else if (mode.includes("visual")) {
            setVimMode("visual");
          } else {
            setVimMode("normal");
          }
        }
        return originalSetOption.apply(this, args);
      };
    }

    return () => {
      view.destroy();
      initializedRef.current = false;
    };
  }, []);

  // Update the editor content when the value prop changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  }, [value]);

  const getModeColor = () => {
    switch (vimMode) {
      case "insert":
        return "bg-green-600";
      case "visual":
        return "bg-purple-600";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div
        className={`px-3 py-1 text-xs text-white ${getModeColor()} uppercase font-bold`}
      >
        {vimMode} Mode
      </div>
      <div ref={editorRef} className="flex-1" />
    </div>
  );
};

export default CodeMirrorEditor;
