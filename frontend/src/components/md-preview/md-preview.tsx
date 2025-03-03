import { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { cn } from "@/lib/utils";

export default function MdPreview(props: {
  content: string;
  wrapperClassName?: string;
}) {
  const html = useMemo(() => {
    if (!props.content) return "";

    const sanitizedContent = DOMPurify.sanitize(props.content);
    const escapedContent = sanitizedContent.replace(
      /^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,
      ""
    );

    const html = marked.parse(escapedContent);

    return html as string;
  }, [props.content]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 min-h-0">
      <div
        className={cn(
          "prose dark:prose-invert h-full max-w-none",
          props.wrapperClassName
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </div>
  );
}
