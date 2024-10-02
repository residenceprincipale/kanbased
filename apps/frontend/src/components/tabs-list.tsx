import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routeMap } from "@/lib/constants";
import Link from "next/link";

export function TabsList() {
  const boards = [
    { name: "first board", id: 1 },
    { name: "second board", id: 2 },
    { name: "third board", id: 3 },
  ];

  return (
    <div className="flex gap-4 items-center">
      <ul className="flex gap-3">
        {boards.map((board) => (
          <li key={board.id}>
            <Link
              className="px-3 py-2 w-32 flex items-center justify-between gap-2 rounded-lg border"
              href={routeMap.board(board.name)}
              // activeClass="bg-secondary text-secondary-foreground"
            >
              <div className="flex items-center gap-1.5 w-full flex-1 min-w-0">
                <div className="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                <div className="capitalize truncate">{board.name}</div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
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
            </Link>
          </li>
        ))}
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
        <DropdownMenuContent className="w-64 !p-3"></DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
