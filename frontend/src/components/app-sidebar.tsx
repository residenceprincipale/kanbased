import * as React from "react";
import { Separator } from "@/components/ui/separator";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavBoards } from "@/components/nav-boards";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col gap-2">
        <NavUser />
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <NavBoards />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
