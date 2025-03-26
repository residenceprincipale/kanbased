"use client";

import { FileText } from "lucide-react";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { linkOptions } from "@tanstack/react-router";
import { getAllNotesQueryOptions } from "@/lib/query-options-factory";
import { NavGroupType } from "@/components/nav-group";
import { NavGroup } from "@/components/nav-group";

export function NavNotes() {
  const { data, isLoading } = useQuery(getAllNotesQueryOptions);

  const navGroup: NavGroupType = {
    title: "Notes",
    linkProps: linkOptions({ to: "/notes" }),
    icon: FileText,
    isItemsLoading: isLoading,
    items: data?.notes.map((note) => ({
      title: note.name,
      linkProps: linkOptions({
        to: "/notes/$noteId",
        params: { noteId: note.id },
      }),
    })),
  };

  return (
    <SidebarGroup className="py-1">
      <SidebarMenu>
        <NavGroup {...navGroup} />
      </SidebarMenu>
    </SidebarGroup>
  );
}
