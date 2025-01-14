"use client";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";

import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/features/boards/board";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { ActionsRenderer } from "@/features/boards/actions-renderer";
import { boardStore } from "@/features/boards/state";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_blayout/boards/")({
  component: BoardsPage,
  staleTime: Infinity,
  loader: async (ctx) => {
    const boardsQueryOptions = ctx.context.boardsQueryOptions;
    const data = queryClient.getQueryData(boardsQueryOptions.queryKey);

    /**
     * Since I use `staleTime` as infinity plus persisting the cache in indexedDB
     * Prefetch won't call the API if there is cache stored in indexedDB.
     * This gives user a good experience when reloading the page and seeing the data quickly.
     * Still it is a good idea to fetch updated data from server.
     */
    if (data) {
      queryClient.invalidateQueries(boardsQueryOptions);
    } else {
      await queryClient.prefetchQuery(boardsQueryOptions);
    }

    return null;
  },
  context: () => {
    const boardsQueryOptions = api.queryOptions("get", "/boards");
    return { boardsQueryOptions };
  },
});

function BoardsPage() {
  const boardsQueryOptions = Route.useRouteContext({
    select: (data) => data.boardsQueryOptions,
  });
  const { data: boards } = useSuspenseQuery(boardsQueryOptions);

  return (
    <main className="h-full flex flex-col pt-10 pb-20 min-h-0 px-6 sm:px-0">
      <div className="border py-4 rounded-lg w-full sm:mx-auto sm:w-fit bg-gray-2 h-full flex flex-col flex-1">
        <div className="flex items-center gap-4 justify-between mb-4 shrink-0 px-4">
          <h1 className="text-xl font-semibold">Boards ({boards?.length})</h1>
          <Button
            size={"icon"}
            onClick={() => boardStore.send({ type: "createBoard" })}
          >
            <CirclePlus size={24} />
          </Button>
        </div>
        <ul className="sm:min-w-96 w-full flex flex-col gap-2 h-full flex-1 overflow-y-auto custom-scrollbar px-3">
          {boards?.map((board) => <Board board={board} key={board.id} />)}
        </ul>
      </div>
      <ActionsRenderer />
    </main>
  );
}
