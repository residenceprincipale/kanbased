import { createQuery } from "@tanstack/solid-query";
import { createEffect, createMemo, createSignal } from "solid-js";
import { getBoardsQuery } from "~/lib/query-options-factory";

export function usePinnedBoards() {
  const boardsQuery = createQuery(getBoardsQuery);
  const [pinnedBoardsMap, setPinnedBoardMap] = createSignal<PinnedBoardMap>({});

  const pinnedBoards = createMemo(() => {
    if (!boardsQuery.data) return [];
    return boardsQuery.data
      .filter((board) => !!pinnedBoardsMap()[board.id])
      .map((board) => ({ ...board, ...pinnedBoardsMap()[board.id] }))
      .sort((a, b) => a.order - b.order);
  });

  const pinBoard = (id: number, order?: number) => {
    if (pinnedBoardsMap()[id]) return;

    setPinnedBoardMap((prev) => ({
      ...prev,
      [id]: { order: order ?? pinnedBoards().length },
    }));
  };

  createEffect(() => {
    console.log("pinned boards", pinnedBoardsMap());
  });

  return { pinnedBoards, pinBoard };
}

type PinnedBoardMapValue = { order: number };
type PinnedBoardMap = Record<number, PinnedBoardMapValue>;
