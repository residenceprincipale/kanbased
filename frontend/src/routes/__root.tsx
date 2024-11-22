import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
  loader: async () => {
    await queryClient.prefetchQuery(api.queryOptions("get", "/current-user"));
    return null;
  },
  pendingComponent: () => <div>Loading...</div>,
  shouldReload: false,
  loaderDeps: (opt) => ({}),
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  );
}
