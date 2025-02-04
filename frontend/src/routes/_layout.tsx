import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { queryClient } from "@/lib/query-client";
import { sessionQueryOptions } from "@/lib/query-options-factory";
import { cn } from "@/lib/utils";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  loader: async () => {
    // TODO: set stale time later
    await queryClient.fetchQuery(sessionQueryOptions);
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainLayoutWrapper>
        <div className="shrink-0 sticky top-0 z-10 bg-background py-2">
          <SidebarTrigger />
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
