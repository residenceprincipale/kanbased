import * as React from "react";
import { Separator } from "@/components/ui/separator";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavBoards } from "@/components/nav-boards";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col gap-2">
        <NavUser />
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <NavBoards />
      </SidebarContent>
      <div
        className={cn(
          "mt-auto p-2 flex flex-col gap-2",
          !isCollapsed && "flex-row justify-between"
        )}
      >
        <ThemeToggle />
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <SidebarTrigger className="self-center" />
          </TooltipTrigger>
          <TooltipContent>Toggle sidebar (⌘+B)</TooltipContent>
        </Tooltip>
      </div>
      <SidebarRail />
    </Sidebar>
  );
}
