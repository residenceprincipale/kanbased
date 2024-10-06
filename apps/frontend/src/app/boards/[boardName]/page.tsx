"use client";
import { CreateColumn } from "@/components/create-column";
import { KanbanColumns } from "@/components/kanban-card";
import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import { useGetStoreData } from "@/hooks/use-data-store";
import { routeMap } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useBetterParams } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { useEffect, useRef } from "react";

export default function BoardPage() {
  const { boardName } = useBetterParams<{ boardName: string }>();
  const rep = useRepContext();
  const router = useRouter();
  const boards = useGetStoreData("boards");
  const tabs = useGetStoreData("tabs");
  const hasRanEffect = useRef(false);

  useEffect(() => {
    if (hasRanEffect.current) return;
    const isBoardExist = boards?.some((board) => board.name === boardName);
    if (!isBoardExist) {
      router.replace(routeMap.boards);
      return;
    }
    const isTabExist = tabs?.some((tab) => tab.name === boardName);

    if (!isTabExist) {
      rep.mutate.createTab({
        name: boardName,
        color: "",
        order: tabs?.length ?? 0,
      });
    }

    hasRanEffect.current = true;
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
