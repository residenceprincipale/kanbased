import { useMemo } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";

export default function MdPreview(props: { content: string }) {
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
    <div
      className="prose dark:prose-invert p-4"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );
}
