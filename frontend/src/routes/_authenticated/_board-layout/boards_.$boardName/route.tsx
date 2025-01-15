"use client";
import { Columns } from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/columns";

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
import { columnStore } from "@/routes/_authenticated/_board-layout/boards_.$boardName/-route-impl/state";

export const Route = createFileRoute(
  "/_authenticated/_board-layout/boards_/$boardName"
)({
  component: BoardPage,
  loader: async (ctx) => {
    await queryClient.prefetchQuery({
      ...ctx.context.columnsQueryOptions,
      staleTime: 1000 * 60 * 2, // 2 minutes
    });
  },
  // I don't know why the returned value is not type safe
  // when I use the ctx in the context function
  context: (ctx: any) => {
    const columnsQueryOptions = getColumnsQuery(ctx.params.boardName);
    return {
      columnsQueryOptions,
    };
  },
});

function BoardPage() {
  const { boardName } = Route.useParams();

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
        <Columns />
      </div>
    </main>
  );
}
