import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import * as userRoutes from "./users.routes.js";
import { profilesTable } from "../../db/schema/index.js";


const usersRouter = createAuthenticatedRouter();

usersRouter.openapi(userRoutes.getCurrentUser, async (c) => {
  const user = c.get('user');

  const data = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, user.id)
  })

  const { userId, ...rest } = data!

  return c.json(rest, 200);
})

export default usersRouter;