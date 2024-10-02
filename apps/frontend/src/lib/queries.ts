import type { Board } from "@kanbased/shared/src/mutators";
import type { ReadTransaction } from "replicache";

export function listBoards(tx: ReadTransaction) {
  return tx.scan<Board>({ prefix: "boards/" }).values().toArray();
}
