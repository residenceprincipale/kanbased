import { cn } from "@/lib/utils";

export function ColumnWrapper(props: { children: any; className?: string }) {
  return (
    <div
      className={cn(
        "w-80 py-2 bg-muted rounded-md space-y-3 shrink-0 border max-h-full flex flex-col h-fit",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
