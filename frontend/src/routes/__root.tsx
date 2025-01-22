import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppContextProvider } from "@/state/app-state";
import { lazy } from "react";
import { Toaster } from "@/components/ui/sonner";

import { api } from "@/lib/openapi-react-query";
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

interface MyRouterContext {}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  context: () => {
    const authQueryOptions = api.queryOptions("get", "/current-user");
    return { authQueryOptions };
  },
});

function RootComponent() {
  return (
    <AppContextProvider>
      <ScrollRestoration />
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools position="bottom" />
    </AppContextProvider>
  );
}
