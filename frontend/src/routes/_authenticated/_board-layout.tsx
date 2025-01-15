import { TopSection } from "@/components/top-section";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_board-layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="height-screen flex flex-col">
      <header className="shrink-0">
        <TopSection />
        <div className="w-screen h-10" />
      </header>
      <Outlet />
    </div>
  );
}
