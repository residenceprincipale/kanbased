import { serve } from "@hono/node-server";

import app from "./app.js";

const port = 5000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${info.port}`);
  },
);

process.on("SIGINT", () => {
  // process reload ongoing
  // close connections, clear cache, etc
  // by default, you have 1600ms
  process.exit(0);
})