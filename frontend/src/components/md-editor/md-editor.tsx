import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { vim, getCM, Vim } from "@replit/codemirror-vim";
import { basicExtensions } from "@/components/md-editor/helpers";
import { indentWithTab } from "@codemirror/commands";

const customTheme = EditorView.theme({
  "&": {
    fontSize: "16px",
    fontFamily: "'Manrope', system-ui, sans-serif",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: "'Manrope', system-ui, sans-serif",
    padding: "1rem",
    caretColor: "var(--foreground)",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  ".cm-line": {
    padding: "0 4px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-scroller": {
    fontFamily: "'Manrope', system-ui, sans-serif",
    lineHeight: "1.6",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-selectionBackground": {
    backgroundColor: "var(--gray-a4) !important",
  },
});

export type CodeMirrorEditorRefData = {
  getData: () => string;
  focus: () => void;
  handleEscapeForVim: () => void;
};

export type CodeMirrorEditorRef =
  React.RefObject<CodeMirrorEditorRefData | null>;

interface CodeMirrorEditorProps {
  onChange?: (value: string) => void;
  defaultContent?: string;
  defaultAutoFocus?: boolean;
  ref: CodeMirrorEditorRef;
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
    focus: () => {
      viewRef.current?.focus();
    },
    handleEscapeForVim: () => {
      if (viewRef.current) {
        viewRef.current.focus();
        const cm = getCM(viewRef.current);
        if (cm) {
          Vim.handleKey(cm, "<Esc>");
        }
      }
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
      doc: props.defaultContent,
      extensions: [
        vim(),
        basicExtensions,
        keymap.of([indentWithTab]),
        customTheme,
        markdown(),
        EditorView.lineWrapping,
        updateListenerExtension,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Set up initial mode
    const cm = getCM(view)!;

    cm.on(
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

  return (
    <div className="h-full flex flex-col">
      <div ref={editorRef} className="flex-1 h-full min-h-0" />
      <div
        className={`px-3 py-1 text-xs shrink-0 text-muted-foreground bg-muted uppercase font-bold w-fit rounded`}
      >
        {vimMode} Mode
      </div>
    </div>
  );
}
