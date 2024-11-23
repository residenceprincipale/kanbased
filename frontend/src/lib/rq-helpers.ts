import { QueryKey } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function getOptimisticQueryHelpers(queryKey: QueryKey) {
  return {
    onMutate: async <T>(transformOptimisticData: (oldData: T) => T) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) =>
        transformOptimisticData(oldData)
      );

      return { previousData };
    },

    onError: (err: any, variables: any, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },

  }
} 