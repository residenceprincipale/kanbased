import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportBoardsModal } from "@/features/boards/state/board";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  boardsQueryOptions,
  columnsQueryOptions,
} from "@/lib/query-options-factory";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";
import { transformColumnsQuery } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export function ExportBoards({ onClose }: ExportBoardsModal) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>

        <Suspense fallback={<div>Fetching boards and their data...</div>}>
          <Content />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

function Content() {
  const qc = useQueryClient();
  const boards = qc.getQueryData(boardsQueryOptions.queryKey);

  const { data } = useSuspenseQuery({
    queryKey: ["export", "boards"],
    queryFn: async () => {
      const allBoardsPromise =
        boards?.map(async (board) => {
          const boardData = await qc.ensureQueryData(
            columnsQueryOptions(board.name)
          );
          return transformColumnsQuery(boardData);
        }) ?? [];

      const allBoards = await Promise.all(allBoardsPromise);

      return JSON.stringify(allBoards, null, 2);
    },
  });

  if (!boards?.length) {
    return <div>No boards found</div>;
  }

  const handleCopy = (jsonData: string) => {
    navigator.clipboard
      .writeText(jsonData)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        className={cn("absolute right-4 top-4", {
          "opacity-0": !data,
        })}
        onClick={() => handleCopy(data)}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy
      </Button>
      <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[60vh] text-sm">
        {data}
      </pre>
    </div>
  );
}
