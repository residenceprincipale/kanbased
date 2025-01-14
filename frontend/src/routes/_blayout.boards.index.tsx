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
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Boards ({boards?.length || 0})
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your boards
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => boardStore.send({ type: "createBoard" })}
            className="gap-2"
          >
            <CirclePlus className="w-5 h-5" />
            Create Board
          </Button>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards?.length === 0 ? (
            <li className="col-span-full">
              <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">
                  No boards yet. Create your first board to get started!
                </p>
              </div>
            </li>
          ) : (
            boards?.map((board) => <Board board={board} key={board.id} />)
          )}
        </ul>
      </div>
      <ActionsRenderer />
    </main>
  );
}
