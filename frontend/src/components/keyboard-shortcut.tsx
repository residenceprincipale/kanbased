import { useIsMobile } from "@/hooks/use-mobile";

export function KeyboardShortcutIndicator(
  props: React.PropsWithChildren<{
    label?: string;
  }>
) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  if (props.label) {
    return (
      <div className="flex items-center text-xs text-muted-foreground rounded px-1.5 py-1 w-fit h-fit self-center shrink-0">
        <span>{props.label}: </span>
        <kbd className="inline-flex ml-1 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono font-medium">
          {props.children}
        </kbd>
      </div>
    );
  }

  return (
    <kbd className="inline-flex ml-1 select-none items-center gap-1 rounded border px-1.5 font-mono font-medium text-[0.625rem]">
      {props.children}
    </kbd>
  );
}
