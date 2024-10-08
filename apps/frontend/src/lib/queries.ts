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

export async function listColumns(
  tx: ReadTransaction,
  boardId: string
): Promise<ColumnWithCard[]> {
  const columns = await tx
    .scan<Column>({ prefix: prefixMap.columns(boardId) })
    .values()
    .toArray();

  columns.sort((a, b) => a.order - b.order);

  // Get all cards in one operation
  const cards = await tx
    .scan<Card>({ prefix: prefixMap.cards(boardId) })
    .values()
    .toArray();

  // Group cards by column
  const cardsByColumn = new Map<string, Card[]>();
  for (const card of cards) {
    const columnCards = cardsByColumn.get(card.columnId) || [];
    columnCards.push(card);
    cardsByColumn.set(card.columnId, columnCards);
  }

  // Combine columns with their cards
  return columns.map((column) => ({
    ...column,
    cards:
      cardsByColumn.get(column.id)?.sort((a, b) => a.order - b.order) || [],
  }));
}
