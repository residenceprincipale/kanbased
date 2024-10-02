"use client";
import { useRepContext } from "@/components/replicache-provider";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routeMap } from "@/lib/constants";
import { listBoards, listTabs } from "@/lib/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubscribe } from "replicache-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function TabsList() {
  const rep = useRepContext();
  const tabs = useSubscribe(rep, listTabs, { default: [] });
  const router = useRouter();
  const boards = useSubscribe(rep, listBoards, { default: [] });
  const [parent] = useAutoAnimate();

  return (
    <div className="flex gap-4 items-center">
      <ul className="flex gap-3" ref={parent}>
        {tabs.map((tab) => {
          return (
            <li
              key={tab.boardName}
              className="px-3 py-2 w-32 flex items-center justify-between gap-2 rounded-lg border"
            >
              <Link
                className="flex items-center gap-1.5 w-full flex-1 min-w-0"
                href={routeMap.board(tab.boardName)}
                // activeClass="bg-secondary text-secondary-foreground"
              >
                <div className="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                <div className="capitalize truncate">{tab.boardName}</div>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  rep.mutate.deleteTab({ boardName: tab.boardName });
                  router.replace(routeMap.boards);
                }}
                className="shrink-0 rounded-full p-0.5 hover:bg-secondary hover:text-secondary-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 !p-3">
          {boards
            .filter(
              (board) => !tabs.some((tab) => tab.boardName === board.name)
            )
            .map((board) => (
              <DropdownMenuItem key={board.name} asChild>
                <Link href={routeMap.board(board.name)}>{board.name}</Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
