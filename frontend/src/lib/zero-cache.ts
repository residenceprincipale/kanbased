import { Zero } from "@rocicorp/zero";
import { useZero } from "@rocicorp/zero/react";
import { schema, type Schema } from "../../../backend/zero-schema.gen";
import { queryClient } from "@/lib/query-client";
import { authQueryOptions } from "@/lib/query-options-factory";
import { getAuthData } from "@/queries/session";

export function createZeroCache({ userId }: { userId: string }) {
  return new Zero({
    userID: userId,
    auth: async (status) => {
      const authData = getAuthData(queryClient);

      if (!authData?.encodedToken || status === "invalid-token") {
        await queryClient.invalidateQueries(authQueryOptions);
      }

      return getAuthData(queryClient)?.encodedToken;
    },
    server: import.meta.env.CLIENT_PUBLIC_SERVER,
    schema: schema,
    kvStore: "idb",
    logLevel: import.meta.env.DEV ? "debug" : undefined,
  });
}

export function useZ() {
  return useZero<Schema>();
}

export type Z = ReturnType<typeof createZeroCache>;
