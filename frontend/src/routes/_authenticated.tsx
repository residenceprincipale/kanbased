import { DefaultPendingComponent } from "@/components/default-loader";
import { router } from "@/main";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const { authQueryOptions } = Route.useRouteContext();
  const { data, isLoading, error } = useQuery(authQueryOptions);

  if (isLoading) return <DefaultPendingComponent />;

  if (error) {
    const isAuthExpired =
      !!data?.expiresAt && new Date(data.expiresAt) <= new Date();
    const isUnAuthorized = error.statusCode === 401;

    if (isUnAuthorized || isAuthExpired) {
      router.navigate({ to: "/auth/login", replace: true });
    }

    // TODO: Handle this once offline support is implemented.
    return <div>Error</div>;
  }

  if (!data) {
    // TODO: Handle this once offline support is implemented.
    return <div>An unexpected error occurred.</div>;
  }

  return <Outlet />;
}
