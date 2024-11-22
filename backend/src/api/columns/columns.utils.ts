import { db } from "../../db/index.js";
import { boardTable } from "../../db/schema/index.js";

export async function createBoard(tx: typeof db, data: any) {
  const [board] = await tx
    .insert(boardTable)
    .values({ name: data.name, color: data.color, userId: data.userId, updatedAt: new Date() })
    .returning();
  return board;
}