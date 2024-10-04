"use client";
import { CreateColumn } from "@/components/create-column";
import { KanbanColumns } from "@/components/kanban-card";
import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/hooks/query-hooks";
import { routeMap } from "@/lib/constants";
import { useBetterParams } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function BoardPage() {
  const { boardName } = useBetterParams<{ boardName: string }>();
  const rep = useRepContext();
  const router = useRouter();

  useMemo(() => {
    const { boards, tabs } = useDataStore.getState();
    const isBoardExist = boards.some((board) => board.name === boardName);

    if (!isBoardExist) {
      router.replace(routeMap.boards);
      return;
    }

    const hasCurrentBoard = tabs.some((tab) => tab.name === boardName);
    if (hasCurrentBoard) return;

    rep.mutate.createTab({
      name: boardName,
      color: "",
      order: tabs.length,
    });
  }, []);

  return (
    <main className="px-8 py-4 flex-1 h-full flex flex-col">
      <h1 className="text-2xl capitalize font-bold mb-4">{boardName}</h1>

      <div className="flex gap-4 flex-1">
        <KanbanColumns />

        <div className="shrink-0">
          <CreateColumn
            boardId={boardName}
            trigger={
              <Button
                type="button"
                size="icon"
                className="w-12 h-12"
                variant="secondary"
              >
                <PlusIcon className="w-8 h-8" />
              </Button>
            }
          />
        </div>
      </div>
    </main>
  );
}
