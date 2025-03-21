import { api } from "@/lib/openapi-react-query";
import { boardsQueryOptions } from "@/lib/query-options-factory";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateBoardMutation() {
  const queryClient = useQueryClient();

  return api.useMutation("post", "/api/v1/boards", {
    onSuccess: () => {
      queryClient.invalidateQueries(boardsQueryOptions);
    },
  });
}
