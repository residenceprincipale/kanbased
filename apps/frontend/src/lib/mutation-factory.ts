import { createMutation } from "@tanstack/solid-query";
import { queryClient } from "~/lib/query-client";
import { getBoardsQuery } from "~/lib/query-options-factory";
import { getIsLocal } from "~/lib/utils";

export function createBoardMutation() {
    return createMutation(() => ({
        mutationFn: async (boardName: string) => {
            if (getIsLocal()) {
                queryClient.setQueryData(
                    getBoardsQuery().queryKey,
                    (boards) => [
                        ...boards!,
                        {
                            id: new Date().getTime().toString(),
                            color: "white",
                            name: boardName,
                        },
                    ]
                );
            }
        },
    }));
}
