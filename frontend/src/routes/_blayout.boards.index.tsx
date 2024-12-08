"use client";
import { CreateBoard } from "@/features/boards/create-board";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/openapi-react-query";
import { queryClient } from "@/lib/query-client";

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_blayout/boards/")({
  component: BoardsPage,
  staleTime: Infinity,
  loader: async () => {
    const queryOptions = api.queryOptions("get", "/boards");
    const data = queryClient.getQueryData(queryOptions.queryKey);

    /**
     * Since I use `staleTime` as infinity plus persisting the cache in indexedDB
     * Prefetch won't call the API if there is cache stored in indexedDB.
     * This gives user a good experience when reloading the page and seeing the data quickly.
     * Still it is a good idea to fetch updated data from server.
     */
    if (data) {
      queryClient.invalidateQueries(queryOptions);
    } else {
      await queryClient.prefetchQuery(queryOptions);
    }

    return null;
  },
});

function BoardsPage() {
  const { data: boards } = api.useSuspenseQuery("get", "/boards");

  return (
    <main className="px-10">
      <div className="flex items-center gap-4 justify-between my-4 mt-6">
        <h1 className="text-xl font-semibold">Boards ({boards?.length})</h1>
        <CreateBoard />
      </div>

      <div className="flex gap-8">
        <ul className="w-full flex flex-wrap gap-4 my-8">
          {boards?.map((board) => (
            <li key={board.id}>
              <Link
                to="/boards/$boardName"
                search={{ open: undefined }}
                params={{ boardName: board.name }}
              >
                <Card className="flex items-center gap-2 w-44 h-36 justify-center hover:bg-muted hover:text-bg-muted-foreground">
                  <div className="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                  <div className="">{board.name}</div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
