import { useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn, getSidebarStateFromCookie } from "@/lib/utils";
import {
  createFileRoute,
  linkOptions,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { BreadcrumbsData, TsrBreadcrumbs } from "@/components/tsr-breadcrumbs";
import { BackButton } from "@/components/back-button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <MainLayoutWrapper>
        <div className="shrink-0 sticky top-0 z-[5] bg-background flex items-center gap-2">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <SidebarTrigger className="self-center" />
            </TooltipTrigger>
            <TooltipContent side="right">Toggle sidebar (⌘+B)</TooltipContent>
          </Tooltip>

          <BackButton />

          <TsrBreadcrumbs />
        </div>
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </MainLayoutWrapper>
    </SidebarProvider>
  );
}

function MainLayoutWrapper(props: React.PropsWithChildren) {
  const location = useLocation();
  const isBoardDetailPage = /\/boards\/[^\/]+$/.test(location.pathname);

  return (
    <main
      className={cn(
        "w-full pb-2 px-2 h-svh flex flex-col",
        // Temp fix to prevent scrollbar from appearing on board detail page,
        // I couldn't figure out how to fix this properly yet.
        isBoardDetailPage && "",
      )}
    >
      {props.children}
    </main>
  );
}
