"use client";

import * as React from "react";
import {
  FileText,
  KanbanSquare,
  SquareCheck,
  SunMoon,
  Building2,
  ArrowUpDown,
} from "lucide-react";

import {useQuery} from "@rocicorp/zero/react";
import {useRouter} from "@tanstack/react-router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandSubtitle,
} from "@/components/ui/command";
import {useZ} from "@/lib/zero-cache";
import {allBoardsQuery, getNotesListQuery} from "@/lib/zero-queries";
import {useAppContext} from "@/state/app-state";
import {useEffect, useState} from "react";
import {CommandThemes} from "@/features/cmd-k/cmd-themes";
import {CommandOrgSwitch} from "@/features/cmd-k/cmd-org-switch";
import {useHotkeys} from "react-hotkeys-hook";
import {DialogContent} from "@/components/ui/dialog";
import {Dialog, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {DialogHeader} from "@/components/ui/dialog";

type Page = "boards" | "notes" | "tasks" | "theme" | "organization";

function CommandDialogImpl() {
  const {isCmdKOpen, closeCmdK} = useAppContext();
  const [pages, setPages] = useState<Page[]>([]);
  const page = pages[pages.length - 1];
  const router = useRouter();
  const z = useZ();
  const [boards] = useQuery(allBoardsQuery(z));
  const [search, setSearch] = useState("");

  const allTasks = boards.reduce(
    (
      allTasks: Array<{id: string; name: string; slug: string}>,
      currentBoard,
    ) => {
      const tasks = currentBoard.columns.flatMap((column) =>
        column.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          slug: currentBoard.slug,
        })),
      );

      allTasks.push(...tasks);

      return allTasks;
    },
    [],
  );
  const [notes] = useQuery(getNotesListQuery(z));

  const clearSearch = () => {
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
      e.preventDefault();
      if (pages.length) {
        setPages((prevPages) => prevPages.slice(0, -1));
        clearSearch();
      } else {
        e.key === "Escape" && closeCmdK();
      }
    }
  };

  useEffect(() => {
    if (!isCmdKOpen) {
      setTimeout(() => {
        setPages([]);
        setSearch("");
      }, 100);
    }
  }, [isCmdKOpen]);

  return (
    <DialogContent
      className="overflow-hidden p-0"
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <Command
        className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        onKeyDown={handleKeyDown}
      >
        <CommandInput
          placeholder="Search for a command..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandSeparator />

          {page === "theme" && <CommandThemes />}
          {page === "organization" && <CommandOrgSwitch />}

          {!page && (
            <>
              <CommandGroup heading="Suggestions">
                <CommandItem
                  onSelect={() => {
                    setPages((prevPages) => [...prevPages, "organization"]);
                    clearSearch();
                  }}
                >
                  <ArrowUpDown />
                  Switch workspace
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPages((prevPages) => [...prevPages, "theme"]);
                    clearSearch();
                  }}
                >
                  <SunMoon />
                  Change theme
                </CommandItem>

                <CommandItem
                  onSelect={() => {
                    router.navigate({to: "/boards"});
                    closeCmdK();
                  }}
                >
                  <KanbanSquare />
                  <span>Boards</span>
                </CommandItem>

                <CommandItem
                  onSelect={() => {
                    router.navigate({to: "/notes"});
                    closeCmdK();
                  }}
                >
                  <FileText />
                  <span>Notes</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Boards">
                {boards.map((board) => (
                  <CommandItem
                    key={board.id}
                    onSelect={() => {
                      router.navigate({
                        to: "/boards/$slug",
                        params: {slug: board.slug},
                      });
                      closeCmdK();
                    }}
                  >
                    <KanbanSquare />
                    <span className="flex-1 truncate">{board.name}</span>
                    <CommandSubtitle className="shrink-0">
                      Board
                    </CommandSubtitle>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Notes">
                {notes.map((note) => (
                  <CommandItem
                    key={note.id}
                    onSelect={() => {
                      router.navigate({
                        to: "/notes/$noteId",
                        params: {noteId: note.id},
                      });
                      closeCmdK();
                    }}
                  >
                    <FileText />
                    <span>{note.name}</span>
                    <CommandSubtitle>Note</CommandSubtitle>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Tasks">
                {allTasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    onSelect={() => {
                      router.navigate({
                        to: "/boards/$slug",
                        params: {slug: task.slug},
                        search: {
                          taskId: task.id,
                        },
                      });
                      closeCmdK();
                    }}
                  >
                    <SquareCheck />
                    <span className="flex-1 truncate">{task.name}</span>
                    <CommandSubtitle className="shrink-0">Task</CommandSubtitle>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </DialogContent>
  );
}

export function CommandDialog() {
  const {isCmdKOpen, openCmdK, closeCmdK} = useAppContext();

  useHotkeys(
    "mod+k",
    () => {
      openCmdK();
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <Dialog open={isCmdKOpen} onOpenChange={closeCmdK}>
      <DialogHeader className="sr-only">
        <DialogTitle>Command Palette</DialogTitle>
        <DialogDescription>Search for a command to run...</DialogDescription>
      </DialogHeader>

      <CommandDialogImpl />
    </Dialog>
  );
}
