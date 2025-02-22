import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserSettings } from "@/features/user/user-settings";

export const Route = createFileRoute("/_authenticated/_layout/user-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <UserSettings />;
}
