import { TopSection } from "@/components/top-section";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_blayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen flex flex-col">
      <header className="shrink-0">
        <TopSection />
      </header>
      <Outlet />
    </div>
  );
}
