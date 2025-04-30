"use client";

import * as React from "react";
import {
  KanbanSquare,
  Grid2x2Plus,
  List,
  FileText,
  SquareCheck,
} from "lucide-react";

import {
  CommandDialog as CommandDialogComponent,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandSubtitle,
} from "@/components/ui/command";
import { useZ } from "@/lib/zero-cache";
import { allBoardsQuery, getNotesListQuery } from "@/lib/zero-queries";
import { useQuery } from "@rocicorp/zero/react";
import { useRouter } from "@tanstack/react-router";
import { useAppContext } from "@/state/app-state";

export function CommandDialog() {
  const { isSearchOpen, openSearch, closeSearch } = useAppContext();
  const router = useRouter();
  const z = useZ();
  const [boards] = useQuery(allBoardsQuery(z));

  const allTasks = boards.reduce(
    (allTasks: { id: string; name: string; slug: string }[], currentBoard) => {
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

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openSearch();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialogComponent open={isSearchOpen} onOpenChange={closeSearch}>
      <CommandInput placeholder="Search any board, column, or task..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandSeparator />
        <CommandGroup heading="Suggestions">
          <CommandItem
            onSelect={() => {
              router.navigate({ to: "/boards" });
              closeSearch();
            }}
          >
            <KanbanSquare />
            <span>Boards</span>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              router.navigate({ to: "/notes" });
              closeSearch();
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
                  params: { slug: board.slug },
                });
                closeSearch();
              }}
            >
              <KanbanSquare />
              <span>{board.name}</span>
              <CommandSubtitle>Board</CommandSubtitle>
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
                  params: { noteId: note.id },
                });
                closeSearch();
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
                  params: { slug: task.slug },
                  search: {
                    taskId: task.id,
                  },
                });
                closeSearch();
              }}
            >
              <SquareCheck />
              <span>{task.name}</span>
              <CommandSubtitle>Task</CommandSubtitle>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialogComponent>
  );
}
