import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { openAPI } from "better-auth/plugins";
import * as schema from "../db/schema/index.js";
import resend from "./email.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      account: schema.accountsTable,
      session: schema.sessionsTable,
      user: schema.usersTable,
      verification: schema.verificationsTable
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: 'support@mail.kanbased.com',
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: 'support@mail.kanbased.com',
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
      });
    },
  },

  trustedOrigins: [env.FE_ORIGIN],
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
    }
  },
  plugins: [
    openAPI()
  ],

});