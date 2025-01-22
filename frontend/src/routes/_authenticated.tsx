import { useUser } from "@/hooks/use-user";
import { router } from "@/main";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();

  if (!user) {
    router.navigate({ to: "/auth/login", replace: true });
    return;
  }

  return <Outlet />;
}
