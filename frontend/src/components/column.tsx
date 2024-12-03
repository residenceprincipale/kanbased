import { cn } from "@/lib/utils";
import React, { forwardRef, PropsWithChildren } from "react";

export const ColumnWrapper = forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { as?: React.ElementType }
>(({ className, as, ...rest }, ref) => {
  const Comp = as || "div";
  return (
    <Comp
      className={cn(
        "w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit",
        className
      )}
      ref={ref}
      {...rest}
    ></Comp>
  );
});
