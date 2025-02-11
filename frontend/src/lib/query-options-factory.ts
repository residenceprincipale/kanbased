import { authClient } from "@/lib/auth";
import { api } from "@/lib/openapi-react-query";
import { queryOptions } from "@tanstack/react-query";
export function columnsQueryOptions(boardName: string) {
  return api.queryOptions("get", "/api/v1/columns", {
    params: { query: { boardName } },
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
