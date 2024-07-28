import { queryOptions } from "@tanstack/solid-query";

export function getBoardsQuery() {
    return queryOptions({
        queryKey: ["boards"],
        queryFn: async () => {
            return [];
        },
        staleTime: Infinity,
    });
}
