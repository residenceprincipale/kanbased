import { auth } from "../../lib/auth.js";
import { createRouter } from "../../lib/router.js";

const authRouter = createRouter();

authRouter.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

authRouter.get("/openapi-auth", async (c) => {
  const openAPISchema = await auth.api.generateOpenAPISchema();
  return c.json(openAPISchema);
});

export default authRouter;
