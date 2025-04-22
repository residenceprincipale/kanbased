import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportBoardsModal } from "@/features/boards/board.state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImportIcon } from "lucide-react";
import { useActiveOrganizationId } from "@/queries/session";
import { useZ } from "@/lib/zero-cache";
import { createId } from "@/lib/utils";

export function ImportBoards({ onClose }: ImportBoardsModal) {
  const z = useZ();
  const orgId = useActiveOrganizationId();

  const handleImport = async (data: any) => {
    if (!Array.isArray(data)) {
      return;
    }

    await z.mutateBatch(async (m) => {
      const now = Date.now();

      for (let board of data) {
        const boardId = createId();

        await m.boardsTable.insert({
          id: boardId,
          name: board.boardName,
          slug: board.boardName.toLowerCase().replace(/ /g, "-"),
          organizationId: orgId,
          creatorId: z.userID,
          createdAt: now,
        });

        for (let column of board.columns) {
          const columnId = createId();

          await m.columnsTable.insert({
            id: columnId,
            boardId,
            createdAt: now,
            name: column.name,
            position: column.position,
            creatorId: z.userID,
            organizationId: orgId,
          });

          for (let task of column.tasks) {
            await m.tasksTable.insert({
              id: createId(),
              name: task.name,
              createdAt: now,
              position: task.position,
              columnId,
              creatorId: z.userID,
              organizationId: orgId,
            });
          }
        }
      }
    });

    toast.success("Boards imported successfully");
    onClose();
  };

  const getJsonFromFile = async (file: File): Promise<string | undefined> => {
    try {
      const data = await file.text();
      const json = JSON.parse(data);
      return json;
    } catch (error) {
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const file = formData.get("json-file") as File;
    const jsonInput = formData.get("json-input") as string;

    if (!file && !jsonInput) {
      toast.error("Please provide either a JSON file or paste JSON data");
      return;
    }

    if (file && jsonInput) {
      toast.error("Please provide either a JSON file or paste JSON data");
      return;
    }

    if (file) {
      const json = await getJsonFromFile(file);

      if (!json) {
        toast.error("Invalid JSON file");
        return;
      }

      await handleImport(json);
    }

    if (jsonInput) {
      await handleImport(jsonInput);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 relative">
            <Textarea name="json-input" placeholder="Paste JSON data here" />

            <p className="text-sm text-muted-foreground text-center">Or</p>

            <div className="grid gap-1.5">
              <Label htmlFor="import-file" className="text-xs">
                Choose a JSON file to import
              </Label>
              <Input
                type="file"
                id="import-file"
                placeholder="Import data from JSON file"
                name="json-file"
              />
            </div>

            <Button type="submit" className="w-full">
              {<ImportIcon className="w-4 h-4" />}
              Import
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
