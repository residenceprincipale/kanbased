import type { Board, Column, Tab } from "@kanbased/shared/src/mutators";
import type { ReadTransaction } from "replicache";

export function listBoards(tx: ReadTransaction) {
  return tx.scan<Board>({ prefix: "boards/" }).values().toArray();
}

export function listTabs(tx: ReadTransaction) {
  return tx.scan<Tab>({ prefix: "tabs/" }).values().toArray();
}

export function listColumns(tx: ReadTransaction, boardId: string) {
  return tx
    .scan<Column>({ prefix: `columns/${boardId}/` })
    .values()
    .toArray();
}
