import { z } from "@hono/zod-openapi";

const ErrorSchema = z.object({
  message: z.string(),
  errorType: z.enum(["field", "usual"]).default("usual").optional(),
  fieldError: z.record(z.string(), z.string()).optional(),
});

export const genericErrorSchema = {
  content: {
    "application/json": {
      schema: ErrorSchema,
    },
  },
  description: "Gives you errors",
};

export const errorMessages = {
  422: genericErrorSchema,
  400: genericErrorSchema,
  401: genericErrorSchema,
  500: genericErrorSchema,
};
