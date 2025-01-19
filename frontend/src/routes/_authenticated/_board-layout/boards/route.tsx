"use client";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";

import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/routes/_authenticated/_board-layout/boards/-route-impl/board";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { ActionsRenderer } from "@/routes/_authenticated/_board-layout/boards/-route-impl/actions-renderer";
import { boardStore } from "@/routes/_authenticated/_board-layout/boards/-route-impl/state";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/_board-layout/boards")({
  component: BoardsPage,
  loader: async (ctx) => {
    await queryClient.prefetchQuery(ctx.context.boardsQueryOptions);
  },
  context: () => {
    const boardsQueryOptions = api.queryOptions("get", "/boards");
    return { boardsQueryOptions };
  },
});

function BoardsPage() {
  const { boardsQueryOptions } = Route.useRouteContext();
  const { data: boards } = useSuspenseQuery(boardsQueryOptions);

  return (
    <div className="container mx-auto px-4 py-8 w-full">
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
    </div>
  );
}
