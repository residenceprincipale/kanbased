import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/state/app-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, updateTheme } = useAppContext();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={
                isCollapsed ? "w-full px-2" : "w-full justify-start px-4 py-2"
              }
            >
              <div className="flex items-center">
                <div className="relative flex h-5 w-5 shrink-0 items-center">
                  <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
                {!isCollapsed && <span className="ml-3 text-sm">Theme</span>}
              </div>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">Theme</TooltipContent>}
      </Tooltip>
      <DropdownMenuContent
        align={isCollapsed ? "center" : "start"}
        side="right"
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) =>
            updateTheme(value as "light" | "dark" | "system")
          }
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
