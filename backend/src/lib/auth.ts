import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { openAPI } from "better-auth/plugins";
import * as schema from "../db/schema/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      account: schema.accountsTable,
      session: schema.sessionsTable,
      user: schema.usersTable,
      verification: schema.verificationsTable
    }
  }),
  emailAndPassword: {
    enabled: true,
  },

  trustedOrigins: [env.FE_ORIGIN],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    openAPI()
  ]
});

auth.api.signInSocial