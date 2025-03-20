import { sessionQueryOptions } from "@/lib/query-options-factory";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { isSessionLoaded } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  errorComponent: (error) => {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="max-w-96">
          <p className="text-destructive text-2xl font-bold mb-2">
            {error?.error?.message}
          </p>
          <p className="text-destructive">
            Something went wrong, Try refreshing the page.
          </p>
        </div>
      </div>
    );
  },
  beforeLoad: async ({ location }) => {
    const data = await queryClient.ensureQueryData(sessionQueryOptions);

    if (!isSessionLoaded()) {
      queryClient.invalidateQueries(sessionQueryOptions);
    }

    if (data === null) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (
      !data?.session.activeOrganizationId &&
      !location.pathname?.includes("/new-organization")
    ) {
      throw redirect({
        to: "/new-organization",
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
