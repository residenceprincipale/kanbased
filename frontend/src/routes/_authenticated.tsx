import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: (ctx) => {
    const auth = ctx.context?.auth;

    if (!auth || !auth.expiresAt || new Date(auth.expiresAt) <= new Date()) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
