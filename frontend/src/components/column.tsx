import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

export const ColumnWrapper = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...rest }, ref) => {
  return (
    <div
      className={cn(
        "w-72 py-2 shadow-sm bg-gray-3 rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit",
        className
      )}
      ref={ref}
      {...rest}
    ></div>
  );
});
