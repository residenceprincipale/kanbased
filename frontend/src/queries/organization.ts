import { activeOrganizationQueryOptions } from "@/lib/query-options-factory";
import { useSession } from "@/queries/session";
import { useQuery } from "@tanstack/react-query";

export function useActiveOrganization() {
  const { session } = useSession();
  return useQuery(activeOrganizationQueryOptions(session.activeOrganizationId));
}