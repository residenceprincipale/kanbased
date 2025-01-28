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
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { router } from "@/main";
import { DefaultPendingComponent } from "@/components/default-loader";
import { sessionQueryOptions } from "@/lib/query-options-factory";
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
});

function RootComponent() {
  const { isLoading } = useQuery(sessionQueryOptions);

  if (isLoading) {
    return <DefaultPendingComponent />;
  }

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
