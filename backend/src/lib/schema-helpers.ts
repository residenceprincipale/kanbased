import type { ZodSchema } from "zod";
import { z } from 'zod';
import { HTTP_STATUS_CODES } from "./constants.js";

export function jsonContent<
  T extends ZodSchema,
>(schema: T,
  description: string | undefined = '',
) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  };
};

export function jsonContentRequired<
  T extends ZodSchema,
>(schema: T,
  description: string | undefined = '',
) {
  return { ...jsonContent(schema, description), required: true };
};

const ZodErrorSchema = z.object({
  success: z.boolean().openapi({
    example: false,
  }),
  error: z
    .object({
      issues: z.array(
        z.object({
          code: z.string(),
          path: z.array(
            z.union([z.string(), z.number()]),
          ),
          message: z.string().optional(),
        }),
      ),
      name: z.string(),
    })
});

export const zodErrorContent = jsonContent(ZodErrorSchema);
export const createMessageContent = (description: string = '') => jsonContent(z.object({ message: z.string() }), description);
export const genericMessageContent = createMessageContent();
