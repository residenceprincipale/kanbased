import { useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSidebarStateFromCookie } from "@/lib/utils";
import { createFileRoute, linkOptions, Outlet } from "@tanstack/react-router";
import { BreadcrumbsData, TsrBreadcrumbs } from "@/components/tsr-breadcrumbs";
import { BackButton } from "@/components/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/_layout")({
  component: RouteComponent,
  loader: (): BreadcrumbsData => ({
    breadcrumbs: linkOptions([
      {
        to: "/",
        label: "Home",
      },
    ]),
  }),
});

function RouteComponent() {
  const defaultSidebarState = useMemo(getSidebarStateFromCookie, []);

  return (
    <SidebarProvider defaultOpen={defaultSidebarState}>
      <AppSidebar />
      <main className="w-full pb-2 h-svh flex flex-col">
        <div className="shrink-0 sticky top-0 z-[5] bg-background flex items-center gap-2 py-1 px-2 border-b">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <SidebarTrigger className="self-center" />
            </TooltipTrigger>
            <TooltipContent side="right">Toggle sidebar (⌘+B)</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="mr-2 h-4" />
          <TsrBreadcrumbs />
        </div>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
