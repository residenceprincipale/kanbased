import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";
import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppContextProvider } from "@/state/app-state";
import { lazy } from "react";
import { Toaster } from "@/components/ui/sonner";

const TanStackRouterDevtools =
  // @ts-ignore
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  loader: () => {
    queryClient.prefetchQuery(api.queryOptions("get", "/current-user"));
    return null;
  },
});

function RootComponent() {
  return (
    <AppContextProvider>
      <ScrollRestoration />
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" />
    </AppContextProvider>
  );
}
