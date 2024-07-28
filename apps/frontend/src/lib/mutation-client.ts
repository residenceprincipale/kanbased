import { createMutation, SolidMutationOptions } from "@tanstack/solid-query";
import { HttpMethod, PathsWithMethod } from "openapi-typescript-helpers";
import { FetchOptions } from "openapi-fetch";
import { paths } from "~/types/api-schema";
import { fetchClient } from "~/lib/fetch-client";

type Paths<M extends HttpMethod> = PathsWithMethod<paths, M>;
type Params<M extends HttpMethod, P extends Paths<M>> = M extends keyof paths[P]
  ? FetchOptions<paths[P][M]>
  : never;

type UseMutationOptions = Pick<SolidMutationOptions, "retry">;

export function usePostMutation<P extends Paths<"post">>(
  path: P,
  options: UseMutationOptions = {}
) {
  return createMutation(() => ({
    mutationFn: (params: Params<"post", P>) =>
      fetchClient.POST(path, params).then(({ data }) => data),
    ...options,
  }));
}
