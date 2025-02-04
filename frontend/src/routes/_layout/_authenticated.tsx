import { queryClient } from "@/lib/query-client";
import { sessionQueryOptions } from "@/lib/query-options-factory";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_authenticated")({
  component: RouteComponent,
  loader: async () => {
    // TODO: set stale time later
    await queryClient.fetchQuery(sessionQueryOptions);
  },
});

function RouteComponent() {
  return <Outlet />;
}
