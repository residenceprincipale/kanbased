import { AppSidebar } from "@/components/app-sidebar";
import { TopSection } from "@/components/top-section";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/openapi-react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_board-layout")({
  component: RouteComponent,
  context: () => {
    const boardsQueryOptions = api.queryOptions("get", "/boards");
    return { boardsQueryOptions };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-2">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
