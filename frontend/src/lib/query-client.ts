import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { get, set, del } from 'idb-keyval'
import {
  PersistedClient,
  Persister,
} from '@tanstack/react-query-persist-client'
import { router } from '@/main';
import { UnauthorizedError } from '@/lib/utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof UnauthorizedError) {
        router.navigate({ to: "/auth/login" });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const isAuthPage = window && window.location.pathname.includes("/auth/login");

      if (error instanceof UnauthorizedError && !isAuthPage) {
        router.navigate({ to: "/auth/login" });
      }
    },
  }),
})
export const idbPersister = createIDBPersister();

export function createIDBPersister() {
  const idbValidKey = 'reactQuery'
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey)
    },
    removeClient: async () => {
      await del(idbValidKey)
    },
  } as Persister
}