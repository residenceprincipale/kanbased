import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createAuthenticatedRouter } from "../../lib/create-app.js";
import * as userRoutes from "./users.routes.js";
import { profilesTable } from "../../db/schema/index.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";

const usersRouter = createAuthenticatedRouter();

usersRouter.openapi(userRoutes.getCurrentUser, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  const result = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.userId, user.id),
  });

  const data = result!

  return c.json({ user: { displayName: data.displayName, image: data.image }, expiresAt: session.expiresAt }, HTTP_STATUS_CODES.OK);
});

export default usersRouter;
