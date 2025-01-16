import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppContextProvider } from "@/state/app-state";
import { lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Api200Response } from "@/types/type-helpers";

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
interface MyRouterContext {
  auth: Api200Response<"/current-user", "get">;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
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
