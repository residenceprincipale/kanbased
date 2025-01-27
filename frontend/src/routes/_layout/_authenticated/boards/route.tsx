"use client";
import { queryClient } from "@/lib/query-client";

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { boardsQueryOptions } from "@/lib/query-options-factory";
import { BoardList } from "@/features/boards/components/board-list";
import { BoardActions } from "@/features/boards/components/board-actions";
import { ModalProvider } from "@/state/modals";
import { CreateBoardButton } from "@/features/boards/components/create-board-button";

export const Route = createFileRoute("/_layout/_authenticated/boards")({
  component: BoardsPage,
  loader: async () => {
    await queryClient.prefetchQuery(boardsQueryOptions);
  },
});

function BoardsPage() {
  const { data: boards } = useSuspenseQuery(boardsQueryOptions);

  return (
    <ModalProvider>
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
            <CreateBoardButton />
          </div>

          {boards?.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">
                No boards yet. Create your first board to get started!
              </p>

              <CreateBoardButton size="sm" />
            </div>
          ) : (
            <BoardList boards={boards} />
          )}
        </div>
      </div>
      <BoardActions />
    </ModalProvider>
  );
}
