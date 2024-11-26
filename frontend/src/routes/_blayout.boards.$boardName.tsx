"use client";
import { Columns } from "@/features/columns/columns";

import { createFileRoute, Link } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { router } from "@/main";
import { QueryParamState } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { getColumnsQuery } from "@/lib/query-options-factory";

export const Route = createFileRoute("/_blayout/boards/$boardName")({
  component: BoardPage,
  staleTime: Infinity,
  loader: async (ctx) => {
    const queryKey = getColumnsQuery(ctx.params.boardName).queryKey;
    const data = queryClient.getQueryData(queryKey);
    await queryClient.prefetchQuery({ queryKey });
    /**
     * Since I use `staleTime` as infinity plus persisting the cache in indexedDB
     * Prefetch won't call the API if there is cache stored in indexedDB.
     * This gives user a good experience when reloading the page and seeing the data quickly.
     * Still it is a good idea to fetch updated data from server.
     */
    if (data) {
      queryClient.invalidateQueries({ queryKey });
    }
    return null;
  },
  validateSearch: (result) => {
    return { open: result.open };
  },
  shouldReload: false,
  loaderDeps: (opt) => false,
});

export function useGetIsCreateColumnOpen() {
  const { open } = Route.useSearch();
  return open === QueryParamState.CreateColumn;
}

export function setIsCreateColumnOpen(
  updatedOpen: QueryParamState | undefined
) {
  router.navigate({
    from: Route.fullPath,
    search: (prev) => ({
      ...prev,
      open: updatedOpen,
    }),
    replace: true,
  });
}

function BoardPage() {
  const { boardName } = Route.useParams();

  return (
    <main className="pt-4 flex-1 h-full min-h-0 flex flex-col gap-8">
      <div className="flex justify-between gap-4 items-center shrink-0 px-8">
        <h1 className="text-2xl capitalize font-bold">{boardName}</h1>
        <Link
          to="."
          search={{ open: QueryParamState.CreateColumn }}
          className={buttonVariants()}
        >
          Create column
        </Link>
      </div>

      <div className="flex-1 h-full min-h-0">
        <Columns boardName={boardName} />
      </div>
    </main>
  );
}
