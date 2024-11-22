import { QueryKey, UseMutationOptions } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

interface OptimisticUpdateConfig<TVariables, TData> {
  queryKey: QueryKey;
  optimisticUpdate: (oldData: any, variables: TVariables) => any;
  onError?: (error: unknown, variables: TVariables, context: any) => void;
  onSettled?: () => void;
}

export function createOptimisticUpdate<TVariables, TData>({
  queryKey,
  optimisticUpdate,
  onError,
  onSettled,
}: OptimisticUpdateConfig<TVariables, TData>): UseMutationOptions<TData, unknown, TVariables> {
  return {
    onMutate: async (variables) => {
      // Cancel any on-going request as it may accidentally update the cache.
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: any) =>
        optimisticUpdate(oldData, variables)
      );

      return { previousData };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (onError) onError(err, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      if (onSettled) onSettled();
    },
  };
}
