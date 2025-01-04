"use client";
import { CreateBoard } from "@/features/boards/create-board";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";

import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/features/boards/board";
import { UrlState } from "@/lib/url-state";
import z from "zod";

const paramsSchema = z.object({
  open: z
    .optional(
      z.discriminatedUnion("type", [
        z.object({ type: z.literal("delete-board"), boardId: z.string() }),
        z.object({ type: z.literal("edit-board"), boardId: z.string() }),
      ])
    )
    .catch(undefined),
});

export const Route = createFileRoute("/_blayout/boards/")({
  component: BoardsPage,
  staleTime: Infinity,
  loader: async () => {
    const queryOptions = api.queryOptions("get", "/boards");
    const data = queryClient.getQueryData(queryOptions.queryKey);

    /**
     * Since I use `staleTime` as infinity plus persisting the cache in indexedDB
     * Prefetch won't call the API if there is cache stored in indexedDB.
     * This gives user a good experience when reloading the page and seeing the data quickly.
     * Still it is a good idea to fetch updated data from server.
     */
    if (data) {
      queryClient.invalidateQueries(queryOptions);
    } else {
      await queryClient.prefetchQuery(queryOptions);
    }

    return null;
  },
  validateSearch: paramsSchema,
});

export const states = new UrlState(Route.id);

function BoardsPage() {
  const { data: boards } = api.useSuspenseQuery("get", "/boards");

  return (
    <main className="h-full flex flex-col pt-10 pb-20 min-h-0 px-6 sm:px-0">
      <div className="border py-4 rounded-lg w-full sm:mx-auto sm:w-fit bg-gray-2 h-full flex flex-col flex-1">
        <div className="flex items-center gap-4 justify-between mb-4 shrink-0 px-4">
          <h1 className="text-xl font-semibold">Boards ({boards?.length})</h1>
          <CreateBoard />
        </div>
        <ul className="sm:min-w-96 w-full flex flex-col gap-2 h-full flex-1 overflow-y-auto custom-scrollbar px-3">
          {boards?.map((board) => <Board board={board} key={board.id} />)}
        </ul>
      </div>
    </main>
  );
}
