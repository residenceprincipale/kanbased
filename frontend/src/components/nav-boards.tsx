"use client";

import { ChevronRight, Icon, KanbanSquare } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Route } from "@/routes/_authenticated/_board-layout";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@tanstack/react-router";

export function NavBoards() {
  const [open, setOpen] = useState(true);
  const { boardsQueryOptions } = Route.useRouteContext();
  const {
    data: boards,
    isLoading,
    isError,
  } = useQuery({ ...boardsQueryOptions, enabled: open });

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Collapsible
          asChild
          className="group/collapsible"
          open={open}
          onOpenChange={setOpen}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Boards">
                <KanbanSquare />
                <span>Boards</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="">
              <SidebarMenuSub>
                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <div>Error</div>
                ) : (
                  boards?.map((board) => (
                    <SidebarMenuSubItem key={board.id}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to="/boards/$boardName"
                          params={{ boardName: board.name }}
                        >
                          <span>{board.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
