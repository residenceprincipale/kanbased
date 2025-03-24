"use client";

import { ChevronRight, FileText, KanbanSquare } from "lucide-react";
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
import { getAllNotesQueryOptions } from "@/lib/query-options-factory";

export function NavNotes() {
  const [open, setOpen] = useState(true);
  const { data, isLoading, isError } = useQuery(getAllNotesQueryOptions);

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
              <SidebarMenuButton tooltip="Notes">
                <FileText />
                <span>Notes</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {isLoading ? (
                  <Spinner />
                ) : isError ? (
                  <div>Error</div>
                ) : (
                  data?.notes.map((note) => (
                    <SidebarMenuSubItem key={note.id}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          activeProps={{ className: "!bg-accent" }}
                          to="/notes/$noteId"
                          params={{ noteId: note.id }}
                        >
                          <span>{note.name}</span>
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
