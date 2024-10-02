"use client";
import { CreateColumn } from "@/components/create-card";
import { KanbanCard } from "@/components/kanban-card";
import { useRepContext } from "@/components/replicache-provider";
import { Button } from "@/components/ui/button";
import { listTabs } from "@/lib/queries";
import { useBetterParams } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

export default function BoardPage() {
  const { boardName } = useBetterParams<{ boardName: string }>();
  const rep = useRepContext();
  rep.query(listTabs).then((tabs) => {
    const hasCurrentBoard = tabs?.some((tab) => tab.boardName === boardName);

    if (!hasCurrentBoard) {
      rep.mutate.createTab({ boardName, boardColor: "" });
    }
  });

  return (
    <main className="p-8">
      <h1 className="text-2xl capitalize font-bold mb-4">{boardName}</h1>

      <div className="flex gap-6">
        <KanbanCard />

        <CreateColumn>
          <Button
            type="button"
            size="icon"
            className="w-12 h-12"
            variant="secondary"
          >
            <PlusIcon className="w-8 h-8" />
          </Button>
        </CreateColumn>
      </div>
    </main>
  );
}
