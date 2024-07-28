import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
    mutations: {
      meta: {
        // TODO
        isLocal: true,
      },
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
});
