
import { createRoute } from "@hono/zod-openapi";
import { errorSchemas } from "../../lib/error-schema.js";
import { z } from 'zod';

const MutationSchema = z.object({
  id: z.number(),
  name: z.string(),
  args: z.any(),
  timestamp: z.number(),
  clientID: z.string()

})

export type MutationSchemaType = z.infer<typeof MutationSchema>;

const PushRequestSchema = z.object({
  schemaVersion: z.string(),
  profileID: z.string(),
  clientGroupID: z.string(),
  mutations: z.array(MutationSchema),
  pushVersion: z.literal(1),
});

export const pushRoute = createRoute({
  method: "post",
  path: "/push",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PushRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
      description: "No content",
    },
    ...errorSchemas,
  },
});

export const pullRoute = createRoute({
  method: "post",
  path: "/pull",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
      description: "No content",
    },
    ...errorSchemas,
  },
});