import { markdownToHtml } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

export default function ViewTaskContent(props: {
  content: string;
  wrapperClassName?: string;
}) {
  const html = useMemo(() => markdownToHtml(props.content), [props.content]);

  return (
    <div className="max-w-[1000px] mx-auto">
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
