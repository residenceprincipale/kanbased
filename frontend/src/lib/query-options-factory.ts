import { authClient } from "@/lib/auth";
import { api } from "@/lib/openapi-react-query";
import { handleAuthResponse } from "@/lib/utils";
import { queryOptions } from "@tanstack/react-query";

export function columnsQueryOptions(boardUrl: string) {
  return queryOptions({
    ...api.queryOptions("get", "/api/v1/columns", {
      params: { query: { boardUrl } },
    }),
  });
}

export const boardsQueryOptions = queryOptions({
  ...api.queryOptions("get", "/api/v1/boards"),
  staleTime: 2000,
});

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => authClient.getSession(),
});


export const activeOrganizationQueryOptions = (organizationId: string | null | undefined, userId: string) => queryOptions({
  queryKey: [userId, "organizations", organizationId],
  queryFn: async () => {
    const res = await authClient.organization.getFullOrganization({ query: { organizationId: organizationId! } })
    return handleAuthResponse(res);
  },
  enabled: !!organizationId
});


export const organizationsListQueryOptions = (userId: string) => queryOptions({
  queryKey: [userId, "organizations"],
  queryFn: async () => {
    const res = await authClient.organization.list();
    return handleAuthResponse(res);
  },
  enabled: !!userId
});