import { createRoute, z } from "@hono/zod-openapi";
import {
  emptyResponse,
  genericMessageContent,
  jsonContent,
  jsonContentRequired,
  zodErrorContent,
} from "../../lib/schema-helpers.js";
import { HTTP_STATUS_CODES } from "../../lib/constants.js";
import { authenticatedMiddleware } from "./auth.middleware.js";
import { verifySessionMiddleware } from "./auth.middleware.js";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(20, { message: "Password must be at most 20 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password must contain at least one special character",
  });

const registerUserRequestSchema = z.object({
  name: z.string().min(1).openapi({}).nullable(),
  password: passwordSchema,
  email: z.string().email(),
});

const loginUserRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
    password: z.string().min(8),
    email: z.string().email().optional(),
  })
  .refine((data) => data.email || data.name, {
    message: "Either name or email must be provided",
    path: ["name", "email"],
  });

const registerUserResponseSchema = registerUserRequestSchema.omit({ password: true });

const loginErrorResponse = z.object({
  success: z.boolean(),
  error: z.object({
    name: z.string(),
    message: z.string(),
  }),
  statusCode: z.number(),
});


export const registerUserRoute = createRoute({
  method: "post",
  path: "/auth/register/email",
  request: {
    body: jsonContentRequired(registerUserRequestSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(registerUserResponseSchema),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
  },
});

export const loginUserRoute = createRoute({
  method: "post",
  path: "/auth/login/email",
  request: {
    body: jsonContentRequired(loginUserRequestSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(registerUserResponseSchema),
    [HTTP_STATUS_CODES.TOO_MANY_REQUESTS]: jsonContent(loginErrorResponse),
  },
});

export const loginGoogleRoute = createRoute({
  method: "get",
  path: "/auth/login/google",
  responses: {
    [HTTP_STATUS_CODES.MOVED_TEMPORARILY]: {
      description: "",
    },
  },
});

export const googleCallbackRoute = createRoute({
  method: "get",
  path: "/auth/login/google/callback",
  responses: {
    [HTTP_STATUS_CODES.MOVED_TEMPORARILY]: {
      description: "",
    },
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  middleware: [verifySessionMiddleware, authenticatedMiddleware],
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(emptyResponse),
    [HTTP_STATUS_CODES.UNAUTHORIZED]: genericMessageContent,
  },
});

export const verifyEmailRoute = createRoute({
  method: "get",
  path: "/auth/verify-email",
  request: {
    query: z.object({
      token: z.string(),
    }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.object({
      success: z.boolean(),
      message: z.string(),
    })),
  },
});

export const resendVerificationRoute = createRoute({
  method: "post",
  path: "/auth/resend-verification",
  middleware: [verifySessionMiddleware, authenticatedMiddleware],
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(z.object({
      success: z.boolean(),
      message: z.string(),
    })),
    [HTTP_STATUS_CODES.UNAUTHORIZED]: genericMessageContent,
  },
});
