import type { Board, Column, TabState } from "@kanbased/shared/src/mutators";
import type { ReadTransaction } from "replicache";

export function listBoards(tx: ReadTransaction) {
  return tx.scan<Board>({ prefix: "boards/" }).values().toArray();
}

export function listTabs(tx: ReadTransaction) {
  return tx.scan<TabState>({ prefix: "tabsState/" }).values().toArray();
}

export function listColumns(tx: ReadTransaction) {
  return tx.scan<Column>({ prefix: "columns/" }).values().toArray();
}
