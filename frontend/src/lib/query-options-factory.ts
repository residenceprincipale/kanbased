import { api } from "@/lib/openapi-react-query";
import { queryOptions } from "@tanstack/react-query";

export function columnsQueryOptions(boardName: string) {
  return api.queryOptions("get", '/columns', { params: { query: { boardName } } });
}

export const boardsQueryOptions = queryOptions({ ...api.queryOptions("get", "/boards"), staleTime: 2000 });

export const sessionQueryOptions = api.queryOptions("get", "/current-user");
