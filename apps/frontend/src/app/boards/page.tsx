"use client";
import { CreateBoard } from "@/components/create-board";
import { Card } from "@/components/ui/card";
import { routeMap } from "@/lib/constants";
import { listBoards } from "@/lib/queries";
import Link from "next/link";
import { useSubscribe } from "@/hooks/useSubscribe";

export default function BoardsPage() {
  const boards = useSubscribe(
    listBoards,
    (state) => state.boards,
    (state) => state.updateBoards
  );

  return (
    <main className="px-10">
      <div className="flex items-center gap-4 justify-between my-4 mt-6">
        <h1 className="text-xl font-semibold">Boards ({boards.length})</h1>
        <CreateBoard />
      </div>

      <div className="flex gap-8">
        <ul className="w-full flex flex-wrap gap-4 my-8">
          {boards.map((board) => (
            <li key={board.id}>
              <Link href={routeMap.board(board.name)}>
                <Card className="flex items-center gap-2 w-44 h-36 justify-center hover:bg-muted hover:text-bg-muted-foreground">
                  <div className="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                  <div className="">{board.name}</div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
