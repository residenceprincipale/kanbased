import { db, serverId } from "../../db/index.js";
import {
  replicacheClientTable,
  replicacheServerVersionTable,
} from "../../db/schema/index.js";
import type { MutationSchemaType } from "./sync.routes.js";
import { createBoard } from "../boards/boards.utils.js";
import { desc, eq } from "drizzle-orm";


async function setLastMutationID(
  tx: typeof db,
  clientID: string,
  clientGroupID: string,
  mutationID: number,
  version: number,
) {

  const result = await tx.update(replicacheClientTable).set({ clientGroupID, lastMutationID: mutationID, version }).where(eq(replicacheClientTable.id, clientID))

  if (result.count === 0) {
    await tx.insert(replicacheClientTable).values({ clientGroupID, lastMutationID: mutationID, version, id: clientID });
  }
}

export async function processMutation(
  tx: typeof db,
  clientGroupID: string,
  mutation: MutationSchemaType,
  userId: string,
  error?: unknown
) {
  const [result] = await tx.select({ version: replicacheServerVersionTable.version })
    .from(replicacheServerVersionTable)
    .where(eq(replicacheServerVersionTable.id, serverId))
    .for("update")
    .limit(1);

  const nextVersion = (result?.version ?? 0) + 1;

  const lastMutation = await tx.query.replicacheClientTable.findFirst({
    where: eq(replicacheClientTable.id, mutation.clientID),
    columns: { lastMutationID: true },
    orderBy: desc(replicacheClientTable.version),
  });

  const nextMutationID = (lastMutation?.lastMutationID ?? 0) + 1;


  // It's common due to connectivity issues for clients to send a
  // mutation which has already been processed. Skip these.
  if (mutation.id < nextMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`,
    );
    return;
  }

  // If the Replicache client is working correctly, this can never
  // happen. If it does there is nothing to do but return an error to
  // client and report a bug to Replicache.
  if (mutation.id > nextMutationID) {
    throw new Error(
      `Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`,
    );
  }

  if (error !== undefined) {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      'Need to Handle error from mutation',
      JSON.stringify(mutation),
      error,
    );
    return;
  }

  console.log("Processing mutation...");


  switch (mutation.name) {
    case "createBoard":
      await createBoard(tx, { ...mutation.args, version: nextVersion, userId });
      break;
    // case 'createColumn':
    //   await handleCreateColumn(tx, mutation.args, version);
    //   break;
    // case 'createTab':
    //   await handleCreateTab(tx, mutation.args, version);
    //   break;
    // case 'createCard':
    //   await handleCreateCard(tx, mutation.args, version);
    //   break;
    // case 'deleteTab':
    //   await handleDeleteTab(tx, mutation.args);
    //   break;
    // case 'updateTodoText':
    //   await handleUpdateTodoText(tx, mutation.args);
    //   break;
    // case 'toggleTodoCompleted':
    //   await handleToggleTodoCompleted(tx, mutation.args);
    //   break;
    // case 'deleteTodo':
    //   await handleDeleteTodo(tx, mutation.args);
    //   break;
    default:
      throw new Error(`Unknown mutation: ${mutation.name}`);
  }

  // Update lastMutationID for requesting client.
  await setLastMutationID(
    tx,
    mutation.clientID,
    clientGroupID,
    nextMutationID,
    nextVersion,
  );

  await tx.update(replicacheServerVersionTable).set({ version: nextVersion }).where(eq(replicacheServerVersionTable.id, serverId));

}
