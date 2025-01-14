import ReactDOM from "react-dom/client";
import {
  ErrorComponent,
  RouterProvider,
  createRouter,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { idbPersister, queryClient } from "@/lib/query-client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import "./tailwind.css";
import { Spinner } from "@/components/ui/spinner";

// Set up a Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  defaultPendingMinMs: 0,
  defaultPendingMs: 0,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  defaultPendingComponent: () => (
    <div className="grid place-content-center w-full mt-8">
      <Spinner size="lg" />
    </div>
  ),
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: idbPersister, maxAge: Infinity }}
    >
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  );
}
