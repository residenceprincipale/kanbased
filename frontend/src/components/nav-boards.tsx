"use client";

import { ChevronRight, KanbanSquare } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "@tanstack/react-router";
import { boardsQueryOptions } from "@/lib/query-options-factory";

export function NavBoards() {
  const [open, setOpen] = useState(true);
  const { data: boards, isLoading, isError } = useQuery(boardsQueryOptions);

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
                          to="/boards/$boardUrl"
                          params={{ boardUrl: board.boardUrl }}
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
