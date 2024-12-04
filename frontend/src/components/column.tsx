import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export const ColumnWrapper = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...rest }, ref) => {
  return (
    <div
      className={cn(
        "w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit",
        className
      )}
      ref={ref}
      {...rest}
    ></div>
  );
});
