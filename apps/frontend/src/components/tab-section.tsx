import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For } from "solid-js";
import { CreateBoard } from "~/components/create-board";
import { buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getBoardsQuery } from "~/lib/query-options-factory";

export function TabSection() {
  const boardsQuery = createQuery(getBoardsQuery);

  return (
    <div class="flex gap-4 items-center">
      <ul class="flex gap-3">
        <For each={boardsQuery.data}>
          {(item) => (
            <li>
              <A
                class="px-3 py-2 w-32 flex items-center justify-between gap-2 rounded-lg border"
                href={`/boards/${item.name}`}
                activeClass="bg-secondary text-secondary-foreground"
              >
                <div class="flex items-center gap-1.5 w-full flex-1 min-w-0">
                  <div class="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                  <div class="capitalize truncate">{item.name}</div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  class="shrink-0 rounded-full p-0.5 hover:bg-secondary hover:text-secondary-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </A>
            </li>
          )}
        </For>
      </ul>

      <DropdownMenu>
        <DropdownMenuTrigger
          class={buttonVariants({
            size: "icon",
            variant: "outline",
          })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-plus"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-64 !p-3">
          <DropdownMenuGroup>
            <div class="flex items-center justify-between">
              <DropdownMenuGroupLabel>Boards</DropdownMenuGroupLabel>

              <CreateBoard
                Trigger={
                  <span
                    class={buttonVariants({
                      size: "icon",
                      class: "w-7 h-7",
                      variant: "ghost",
                    })}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-plus"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </span>
                }
              />
            </div>

            <For each={boardsQuery.data}>
              {(board) => (
                <DropdownMenuItem as="a" href={`/boards/${board.name}`}>
                  <div class="flex items-center gap-2">
                    <div class="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                    <div class="capitalize">{board.name}</div>
                  </div>
                </DropdownMenuItem>
              )}
            </For>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
