"use client";
import { CreateColumn } from "@/components/create-column";
import { Columns } from "@/components/columns";

import { createFileRoute } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import { api } from "@/lib/openapi-react-query";
import { Spinner } from "@/components/ui/spinner";
import { router } from "@/main";
import { QueryParamState } from "@/lib/constants";

export const Route = createFileRoute("/_blayout/boards/$boardName")({
  component: BoardPage,
  loader: async (ctx) => {
    await queryClient.prefetchQuery(
      api.queryOptions("get", "/columns", {
        params: { query: { boardName: ctx.params.boardName } },
      })
    );
    return null;
  },
  validateSearch: (result) => {
    return { open: result.open };
  },
  pendingComponent: () => (
    <div className="grid place-content-center w-full mt-8">
      <Spinner size="lg" />
    </div>
  ),
});

export function useGetIsCreateColumnOpen() {
  const { open } = Route.useSearch();
  return open === QueryParamState.CreateColumn;
}

export function setIsCreateColumnOpen(updatedOpen: boolean) {
  router.navigate({
    from: Route.fullPath,
    search: (prev) => ({ ...prev, open: updatedOpen }),
    replace: true,
  });
}

function BoardPage() {
  const { boardName } = Route.useParams();

  return (
    <main className="px-8 pt-4 flex-1 h-full min-h-0 flex flex-col gap-8">
      <div className="flex justify-between gap-4 items-center shrink-0">
        <h1 className="text-2xl capitalize font-bold">{boardName}</h1>
      </div>

      <div className="flex-1 h-full min-h-0 flex">
        <Columns boardName={boardName} />
        <CreateColumn boardName={boardName} />
      </div>
    </main>
  );
}
