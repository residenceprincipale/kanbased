import {SearchIcon} from "lucide-react";
import {TsrBreadcrumbs} from "@/components/tsr-breadcrumbs";
import {SidebarTrigger, useSidebar} from "@/components/ui/sidebar";
import {WrappedTooltip} from "@/components/ui/tooltip";
import {Separator} from "@/components/ui/separator";
import {KeyboardShortcutIndicator} from "@/components/keyboard-shortcut";
import {useAppContext} from "@/state/app-state";

export function TopSection() {
  const {isMobile, state} = useSidebar();
  const {openSearch} = useAppContext();

  const getSidebarWidth = () => {
    if (isMobile) {
      return "0px";
    }

    if (state === "collapsed") {
      return "var(--sidebar-width-icon)";
    }

    return "var(--sidebar-width)";
  };

  return (
    <div
      className="sticky top-0 right-0 z-5 flex items-center gap-2 justify-between py-1 px-2 border-b bg-background shrink-0"
      style={{
        left: getSidebarWidth(),
        width: `calc(100vw - ${getSidebarWidth()} - 1rem)`,
      }}
    >
      <div className="flex items-center gap-2 py-1">
        <WrappedTooltip
          tooltipProps={{delayDuration: 300}}
          tooltipContentProps={{
            side: "right",
          }}
        >
          <SidebarTrigger className="self-center" />
          <span>Toggle sidebar (⌘+B)</span>
        </WrappedTooltip>

        <Separator orientation="vertical" className="mr-2 h-4" />
        <TsrBreadcrumbs />
      </div>

      <button
        type="button"
        className="shrink-0 flex items-center gap-10 text-sm font-medium cursor-pointer bg-muted text-muted-foreground px-2 py-1 rounded-md hover:text-foreground w-60 border border-transparent hover:border-accent justify-between"
        onClick={openSearch}
      >
        <div className="shrink-0 flex items-center gap-1">
          <SearchIcon className="size-4" />
          Search
        </div>
        <KeyboardShortcutIndicator commandOrCtrlKey className="text-sm">
          K
        </KeyboardShortcutIndicator>
      </button>
    </div>
  );
}
