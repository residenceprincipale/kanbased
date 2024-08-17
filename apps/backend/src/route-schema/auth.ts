import { z } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import { errorMessages, genericErrorSchema } from "./errors.js";

const createUserRequestSchema = z.object({
  name: z.string().min(1).openapi({}).nullable(),
  password: z.string().min(8),
  email: z.string().email(),
});

const loginUserRequestSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8),
});

const registerUserResponse = createUserRequestSchema.omit({ password: true });

export const registerUserRoute = createRoute({
  method: "post",
  path: "/auth/register/email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserRequestSchema,
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
    ...errorMessages,
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
    ...errorMessages,
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/auth/logout",
  responses: {
    200: {
      description: "No content",
    },
    ...errorMessages,
  },
});
