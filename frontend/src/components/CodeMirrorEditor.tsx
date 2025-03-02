import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { vim, getCM } from "@replit/codemirror-vim";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";

export type CodeMirrorEditorRef = {
  getData: () => string;
};

interface CodeMirrorEditorProps {
  onChange?: (value: string) => void;
  defaultAutoFocus?: boolean;
  ref: React.RefObject<CodeMirrorEditorRef | null>;
}

export default function CodeMirrorEditor(props: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initializedRef = useRef(false);
  const [vimMode, setVimMode] = useState("normal");

  useImperativeHandle(props.ref, () => ({
    getData: () => {
      return viewRef.current?.state.doc.toString() || "";
    },
  }));

  useEffect(() => {
    if (initializedRef.current || !editorRef.current) return;
    initializedRef.current = true;

    const updateListenerExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        props.onChange?.(newValue);
      }
    });

    const state = EditorState.create({
      doc: "Start document",
      extensions: [
        vim(),
        basicSetup,
        keymap.of([indentWithTab]),
        markdown(),
        updateListenerExtension,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Set up initial mode
    const cm = getCM(view);

    cm?.on(
      "vim-mode-change",
      (data: { mode: "insert" | "normal" | "visual" }) => {
        setVimMode(data.mode);
      }
    );

    if (props.defaultAutoFocus) {
      view.focus();
    }

    return () => {
      view.destroy();
      initializedRef.current = false;
    };
  }, []);

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

  console.log("cm re-rendering");

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
}
