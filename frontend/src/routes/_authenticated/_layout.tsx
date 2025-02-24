import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainLayoutWrapper>
        <div className="shrink-0 sticky top-0 z-10 bg-background py-2">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar (⌘+B)</TooltipContent>
          </Tooltip>
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
        isBoardDetailPage && ""
      )}
    >
      {props.children}
    </main>
  );
}
