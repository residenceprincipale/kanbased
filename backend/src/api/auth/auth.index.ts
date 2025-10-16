import { auth } from "../../lib/auth.js";
import { createRouter } from "../../lib/router.js";

const authRouter = createRouter();

authRouter.on(["POST", "GET"], "/auth/*", async (c) => {
  try {
    console.log(`[AUTH] ${c.req.method} ${c.req.path}`);
    const response = await auth.handler(c.req.raw);
    console.log(`[AUTH] Response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error("[AUTH] Error:", error);
    return c.json({ error: "Authentication error", details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

export default authRouter;
