import { TopSection } from "@/components/top-section";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_blayout")({
  component: RouteComponent,
});

function RouteComponent() {
  // useEffect(() => {
  //   document.documentElement.classList.add("no-scroll");
  //   return () => {
  //     document.documentElement.classList.remove("no-scroll");
  //   };
  // }, []);

  return (
    <div className="height-screen overflow-y-hidden flex flex-col">
      <header className="shrink-0">
        <TopSection />
        <div className="w-screen h-10" />
      </header>
      <Outlet />
    </div>
  );
}
