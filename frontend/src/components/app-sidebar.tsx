import * as React from "react";
import { Separator } from "@/components/ui/separator";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavBoards } from "@/components/nav-boards";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { NavNotes } from "@/components/nav-notes";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  React.useEffect(() => {
    const activeSidebarButton = document.querySelector(
      '[data-sidebar="menu-sub-button"][data-status="active"]',
    );

    if (activeSidebarButton) {
      activeSidebarButton.scrollIntoView({
        block: "nearest",
      });
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser />
        <Separator />
      </SidebarHeader>
      <SidebarContent className="!gap-0">
        <NavBoards />
        <NavNotes />
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
