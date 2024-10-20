import { authenticatedMiddleware, verifySessionMiddleware } from "./api/auth/auth.middleware.js";
import authRouter from "./api/auth/auth.router.js";
import boardsRouter from "./api/boards/boards.router.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

// ====== Public routes goes here ======
app.get("/", (c) => {
  return c.json("hello hono");
});
// ====== end of public routes ======

// Verify if the user is logged in, if yes, adds the `user` and `session` object to the context.
app.use("*", verifySessionMiddleware);

// ====== Logged in / Logged out both routes goes here ======
app.route("/", authRouter);
// ====== End of both Logged in / Logged out routes ======

// Checks for `user` object in the context, if it is not available returns 401.
app.use("*", authenticatedMiddleware);

// ====== Protected routes goes here ======
app.route("/", boardsRouter);
// ====== End of protected routes ======
