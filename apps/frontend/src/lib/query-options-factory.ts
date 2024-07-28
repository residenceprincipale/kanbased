import { queryOptions } from "@tanstack/solid-query";
import { fetchClient } from "~/lib/fetch-client";

export function getBoardsQuery() {
  return queryOptions({
    queryKey: ["boards"],
    queryFn: () => fetchClient.GET("/boards").then(({ data }) => data),
    staleTime: Infinity,
  });
}
