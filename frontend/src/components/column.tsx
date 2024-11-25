import { cn } from "@/lib/utils";
import { forwardRef, PropsWithChildren } from "react";

export const ColumnWrapper = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>((props, ref) => {
  return (
    <div
      className={cn(
        "w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit",
        props.className
      )}
      ref={ref}
    >
      {props.children}
    </div>
  );
});
