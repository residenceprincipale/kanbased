import {useEffect, useMemo} from "react";
import {Outlet, createFileRoute, linkOptions} from "@tanstack/react-router";
import {ZeroProvider} from "@rocicorp/zero/react";
import type {BreadcrumbsData} from "@/components/tsr-breadcrumbs";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarProvider} from "@/components/ui/sidebar";
import {getSidebarStateFromCookie} from "@/lib/utils";
import {TopSection} from "@/components/top-section";
import {createZeroCache} from "@/lib/zero-cache";
import {useAuthData} from "@/queries/session";
import {allBoardsQuery} from "@/lib/zero-queries";
import {CommandDialog} from "@/features/cmd-k/cmd-k";

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
  const userData = useAuthData();
  const z = useMemo(() => createZeroCache({userId: userData.id}), []);

  useEffect(() => {
    const query = allBoardsQuery(z).preload({ttl: "forever"});
    return () => {
      query.cleanup();
    };
  }, [z]);

  return (
    <ZeroProvider zero={z}>
      <SidebarProvider defaultOpen={defaultSidebarState}>
        <AppSidebar />

        <main className="flex flex-col h-svh flex-1">
          <TopSection />

          <div className="flex-1 min-h-0 h-full">
            <Outlet />
          </div>
        </main>

        <CommandDialog />
      </SidebarProvider>
    </ZeroProvider>
  );
}
