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

const createUserRequestSchema = z.object({
  name: z.string().min(1).openapi({}).nullable(),
  password: z.string().min(8),
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

const registerUserResponse = createUserRequestSchema.omit({ password: true });

export const registerUserRoute = createRoute({
  method: "post",
  path: "/auth/register/email",
  request: {
    body: jsonContentRequired(createUserRequestSchema),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(registerUserResponse),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: zodErrorContent,
  },
});

export const loginUserRoute = createRoute({
  method: "post",
  path: "/auth/login/email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginUserRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: registerUserResponse,
        },
      },
      description: "No content",
    },
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
