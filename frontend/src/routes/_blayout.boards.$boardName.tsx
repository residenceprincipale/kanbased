"use client";
import { Columns } from "@/features/columns/columns";

import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { getColumnsQuery } from "@/lib/query-options-factory";
import { CirclePlus } from "lucide-react";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { columnStore } from "@/features/columns/state";

export const Route = createFileRoute("/_blayout/boards/$boardName")({
  component: BoardPage,
  staleTime: Infinity,
  loader: async (ctx) => {
    const queryOptions = getColumnsQuery(ctx.params.boardName);
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
  context: ({ params }) => {
    const columnsQueryOptions = getColumnsQuery(params.boardName);
    return {
      columnsQueryOptions,
      irshth: true,
    };
  },
});

function BoardPage() {
  const { boardName } = Route.useParams();
  const stuff = Route.useRouteContext();

  console.log(stuff);

  return (
    <main className="pt-4 flex-1 h-full min-h-0 flex flex-col gap-8">
      <div className="flex gap-5 items-center shrink-0 px-8">
        <h1 className="text-2xl font-bold">{boardName}</h1>
        <TooltipRoot>
          <TooltipTrigger asChild>
            <Button
              onClick={() => columnStore.send({ type: "createColumn" })}
              size="icon"
              className="w-10 h-9"
              aria-label="Add column"
            >
              <CirclePlus size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Create column</TooltipContent>
        </TooltipRoot>
      </div>

      <div className="flex-1 h-full min-h-0">
        <Columns boardName={boardName} />
      </div>
    </main>
  );
}
