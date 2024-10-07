import {
  prefixMap,
  type Board,
  type Card,
  type Column,
  type Tab,
} from "@kanbased/shared/src/mutators";
import type { ReadTransaction } from "replicache";

export function listBoards(tx: ReadTransaction) {
  return tx.scan<Board>({ prefix: prefixMap.boards }).values().toArray();
}

export function listTabs(tx: ReadTransaction) {
  return tx.scan<Tab>({ prefix: prefixMap.tabs }).values().toArray();
}

export type ColumnWithCard = Column & {
  cards: Card[];
};

export async function listColumns(tx: ReadTransaction, boardId: string) {
  const columnsAndCards = await tx
    .scan<Column & Card>({ prefix: prefixMap.columns(boardId) })
    .values()
    .toArray();

  const map = new Map<string, ColumnWithCard>();
  for (let columnAndCard of columnsAndCards) {
    const isCard = !!columnAndCard.columnId;

    if (!isCard) {
      const column = map.get(columnAndCard.id);
      map.set(columnAndCard.id, {
        ...columnAndCard,
        cards: column?.cards || [],
      });
      continue;
    }

    const column = map.get(columnAndCard.columnId);
    if (column) {
      column.cards.push(columnAndCard);
    } else {
      // @ts-expect-error
      map.set(columnAndCard.columnId, { cards: [columnAndCard] });
    }
  }

  const result = [...map.values()];
  return result;
}
