import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.CLIENT_MY_API_BASE_URL, // the base url of your auth server
});
