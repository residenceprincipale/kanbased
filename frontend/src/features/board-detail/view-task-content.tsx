import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";
import {Button} from "@/components/ui/button";
import {useKeyDown} from "@/hooks/use-keydown";
import {markdownToHtml} from "@/lib/helpers";
import {cn} from "@/lib/utils";
import {useMemo} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {EllipsisVertical, Plus, Trash2} from "lucide-react";

export default function ViewTaskContent(props: {
  content: string;
  wrapperClassName?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const html = useMemo(() => markdownToHtml(props.content), [props.content]);

  useKeyDown((e) => {
    if (e.key === "e") {
      e.preventDefault();
      props.onEdit();
    }
  });

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-2",
        props.wrapperClassName,
      )}
    >
      <div className="ml-auto shrink-0 flex items-center gap-3">
        <Button size="sm" onClick={props.onEdit}>
          Edit
          <KeyboardShortcutIndicator>E</KeyboardShortcutIndicator>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="size-8">
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={props.onDelete}
              className="!text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 h-full overflow-y-auto">
        <div className="max-w-[1000px] mx-auto">
          {props.content.trim() ? (
            <div
              className={cn(
                "prose dark:prose-invert h-full max-w-none",
                props.wrapperClassName,
              )}
              dangerouslySetInnerHTML={{__html: html}}
            ></div>
          ) : (
            <div>
              <Button variant="ghost" onClick={props.onEdit}>
                <Plus />
                Add description
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
