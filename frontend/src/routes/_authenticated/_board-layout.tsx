import { AppSidebar } from "@/components/app-sidebar";
import { TopSection } from "@/components/top-section";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_board-layout")({
  component: RouteComponent,
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
