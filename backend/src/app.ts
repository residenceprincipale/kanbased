import authRouter from "./api/auth/auth.router.js";
import boardsRouter from "./api/boards/boards.router.js";
import createApp from "./lib/create-app.js";

export const app = createApp();

export type AppInstance = typeof app;

// ====== Public routes goes here ======
app.get("/", (c) => {
  return c.json("hello hono");
});
// ====== end of public routes ======

// Verify if the user is logged in, if yes, adds the `user` object to the context.
app.use("*", verifySessionMiddleware);
// ====== Logged in and non-logged in user routes ======
app.route("/", authRouter);
// ====== End of logged in and non-logged in user routes ======

// Checks for `user` object in the context, if it is not available returns 401.
app.use("*", authenticatedMiddleware);

// ====== Protected routes goes here ======
app.route("/", boardsRouter);
// ====== End of protected routes ======
