import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import { env } from "../env.js";
import { jwt, openAPI, organization } from "better-auth/plugins";
import * as schema from "../db/schema/auth-schema.js";
import resend from "./email.js";
// import { getActiveOrganization } from "../use-cases/organization.js";
import { and, eq } from "drizzle-orm";
import { membersTable } from "../db/schema/index.js";
import { sendOrganizationInvitation } from "./email.js";

export const auth = betterAuth({
  appName: "kanbased",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev", // Resend test domain - change to your verified domain later
        to: user.email,
        subject: "Reset your password",
        html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  // Temporarily disabled for debugging
  // emailVerification: {
  //   sendOnSignUp: true,
  //   autoSignInAfterVerification: true,
  //   sendVerificationEmail: async ({ user, url }) => {
  //     await resend.emails.send({
  //       from: "onboarding@resend.dev",
  //       to: user.email,
  //       subject: "Verify your email address",
  //       html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
  //     });
  //   },
  // },

  trustedOrigins: [env.FE_ORIGIN],
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 365, // 1 year
    updateAge: 60 * 60 * 24 * 365, // 1 year
    disableSessionRefresh: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"],
    },
  },
  // Temporarily disabled to debug
  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (session) => {
  //         const activeOrganizationId = await getActiveOrganization(
  //           session.userId,
  //         );
  //         return {
  //           data: {
  //             ...session,
  //             activeOrganizationId,
  //           },
  //         };
  //       },
  //     },
  //   },
  // },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1y",
        definePayload: async (data) => {
          const { user, session } = data;

          // Get role and activeOrganizationId from session (set by organization plugin)
          const activeOrganizationId = session.activeOrganizationId;
          
          let role: "member" | "admin" | "owner" | undefined = undefined;
          
          // Only query role if we have an active organization
          if (activeOrganizationId) {
            const memberData = await db.query.membersTable.findFirst({
              where: and(
                eq(membersTable.userId, user.id),
                eq(membersTable.organizationId, activeOrganizationId),
              ),
              columns: {
                role: true,
              },
            });
            role = memberData?.role as "member" | "admin" | "owner" | undefined;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            sub: user.id,
            image: user.image,
            emailVerified: user.emailVerified,
            role,
            activeOrganizationId,
          };
        },
      },
    }),
    openAPI(),
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${env.FE_ORIGIN}/accept-invitation/${data.id}`;
        await sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
    }),
  ],
});
