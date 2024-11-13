"use client";
import { CreateColumn } from "@/components/create-column";
import { Columns } from "@/components/columns";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { api } from "@/lib/openapi-react-query";

export const Route = createFileRoute("/_blayout/boards/$boardName")({
  component: BoardPage,
});

function BoardPage() {
  const { boardName } = Route.useParams();

  // useEffect(() => {
  //   if (hasRanEffect.current || !boards?.length) return
  //   const isBoardExist = boards.some((board) => board.name === boardName)
  //   if (!isBoardExist) {
  //     navigate({ to: '/boards', replace: true })
  //     return
  //   }
  //   const isTabExist = tabs?.some((tab) => tab.name === boardName)

  //   if (!isTabExist) {
  //     rep.mutate.createTab({
  //       name: boardName,
  //       color: "",
  //       order: tabs?.length ?? 0,
  //     });
  //   }

  //   hasRanEffect.current = true
  // }, [boards, tabs])

  return (
    <main className="px-8 pt-4 flex-1 h-full min-h-0 flex flex-col gap-8">
      <div className="flex justify-between gap-4 items-center shrink-0">
        <h1 className="text-2xl capitalize font-bold">{boardName}</h1>
        <CreateColumn
          boardName={boardName}
          trigger={
            <Button type="button" size="icon">
              <PlusIcon />
            </Button>
          }
        />
      </div>

      <div className="flex-1 h-full min-h-0">
        <Columns />
      </div>
    </main>
  );
}
