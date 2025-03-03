import { useRef, useState } from "react";
import CodeMirrorEditor, {
  CodeMirrorEditorRef,
} from "@/components/md-editor/md-editor";
import MdPreview from "@/components/md-preview/md-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Markdown(props: { defaultContent?: string }) {
  const [markdownContent, setMarkdownContent] = useState(
    props.defaultContent ?? ""
  );
  const [mode, setMode] = useState<"write" | "preview">("write");
  const editorRef = useRef<CodeMirrorEditorRef>(null);

  const handleModeChange = (value: "write" | "preview") => {
    setMarkdownContent(editorRef.current?.getData() ?? "");
    setMode(value);
    if (value === "write") {
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="flex rounded-lg w-full border">
      <Tabs
        className="w-full h-[500px]"
        value={mode}
        onValueChange={(value) =>
          handleModeChange(value as "write" | "preview")
        }
      >
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent
          value="write"
          className="h-full data-[state=inactive]:hidden"
          forceMount
        >
          <CodeMirrorEditor
            defaultAutoFocus
            ref={editorRef}
            defaultContent={markdownContent}
          />
        </TabsContent>

        <TabsContent value="preview">
          <MdPreview content={markdownContent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
