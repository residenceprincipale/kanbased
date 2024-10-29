

import { db } from "../../db/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import * as syncRoutes from "./sync.routes.js";
import { processMutation, } from "./sync.utils.js";


const syncRouter = createAuthenticatedRouter();

syncRouter.openapi(syncRoutes.pushRoute, async (c) => {
  const reqBody = c.req.valid("json");
  try {
    console.log("Processing push...", JSON.stringify(reqBody));

    for (const mutation of reqBody.mutations) {
      try {
        await db.transaction((tx) => processMutation(tx, reqBody.clientGroupID, mutation, c.get("user").id)
          , { isolationLevel: 'repeatable read' })
      } catch (error) {
        // Handle errors inside mutations by skipping and moving on. This is
        // convenient in development but you may want to reconsider as your app
        // gets close to production:
        // https://doc.replicache.dev/reference/server-push#error-handling
        console.error('Caught error from mutation', mutation, error);
        await db.transaction((tx) => processMutation(tx, reqBody.clientGroupID, mutation, c.get("user").id, error)
          , { isolationLevel: 'repeatable read' })
      }
    }

    return c.json({ success: true }, 200);
  }

  catch (err) {
    console.log(err)
    return c.json({ success: false }, 200);
  }

})

syncRouter.openapi(syncRoutes.pullRoute, async (c) => {
  return c.json({ success: false }, 200)
})

export default syncRouter;