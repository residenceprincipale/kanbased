import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, lazy } from "react";

export const Route = createFileRoute("/markdown")({
  component: MarkdownEditor,
});

const CodeMirrorEditor = lazy(() => import("../components/CodeMirrorEditor"));

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(
    "# Hello Markdown\n\nStart typing here...\n\n## Formatting Examples\n\n**Bold text**\n\n*Italic text*\n\n- List item 1\n- List item 2\n\n1. Numbered item 1\n2. Numbered item 2\n\n```\nCode block\n```\n\n> Blockquote\n\n[Link text](https://example.com)\n\n![Image alt text](https://via.placeholder.com/150)"
  );
  const [preview, setPreview] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
  };

  const handlePreviewUpdate = (html: string) => {
    setPreview(html);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">
            Markdown Editor with Vim Motions
          </h1>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {showHelp ? "Hide Help" : "Show Vim Help"}
          </button>
        </div>
        <div className="text-sm mt-1">
          <span className="bg-gray-700 px-2 py-1 rounded">
            Vim mode enabled
          </span>
          <span className="ml-2 text-gray-300">
            Use Vim commands for navigation and editing
          </span>
        </div>
      </header>

      {showHelp && (
        <div className="bg-gray-100 p-4 border-b border-gray-300">
          <h2 className="font-bold mb-2">Basic Vim Commands</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-sm">Navigation</h3>
              <ul className="text-sm">
                <li>
                  <code className="bg-gray-200 px-1">h j k l</code> - Left,
                  down, up, right
                </li>
                <li>
                  <code className="bg-gray-200 px-1">w</code> - Next word
                </li>
                <li>
                  <code className="bg-gray-200 px-1">b</code> - Previous word
                </li>
                <li>
                  <code className="bg-gray-200 px-1">0</code> - Start of line
                </li>
                <li>
                  <code className="bg-gray-200 px-1">$</code> - End of line
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Editing</h3>
              <ul className="text-sm">
                <li>
                  <code className="bg-gray-200 px-1">i</code> - Insert mode
                </li>
                <li>
                  <code className="bg-gray-200 px-1">a</code> - Append after
                  cursor
                </li>
                <li>
                  <code className="bg-gray-200 px-1">o</code> - New line below
                </li>
                <li>
                  <code className="bg-gray-200 px-1">Esc</code> - Exit to normal
                  mode
                </li>
                <li>
                  <code className="bg-gray-200 px-1">jj</code> - Exit to normal
                  mode (custom)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Operations</h3>
              <ul className="text-sm">
                <li>
                  <code className="bg-gray-200 px-1">dd</code> - Delete line
                </li>
                <li>
                  <code className="bg-gray-200 px-1">yy</code> - Copy line
                </li>
                <li>
                  <code className="bg-gray-200 px-1">p</code> - Paste
                </li>
                <li>
                  <code className="bg-gray-200 px-1">u</code> - Undo
                </li>
                <li>
                  <code className="bg-gray-200 px-1">Ctrl+r</code> - Redo
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="w-1/2 border-r border-gray-300 overflow-auto">
          <React.Suspense
            fallback={<div className="p-4">Loading editor...</div>}
          >
            <CodeMirrorEditor
              value={markdown}
              onChange={handleMarkdownChange}
              onPreviewUpdate={handlePreviewUpdate}
            />
          </React.Suspense>
        </div>

        {/* Preview pane */}
        <div className="w-1/2 p-4 overflow-auto bg-gray-50">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>
      </div>
    </div>
  );
}
