import {useZ} from "@/lib/zero-cache";
import {getOrganizationQuery} from "@/lib/zero-queries";
import {useActiveOrganizationId} from "@/queries/session";
import {useQuery} from "@rocicorp/zero/react";
import {createFileRoute} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/workspace-settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const orgId = useActiveOrganizationId();
  const z = useZ();
  const [myOrg] = useQuery(getOrganizationQuery(z, orgId));

  return <div>{JSON.stringify(myOrg)}</div>;
}
