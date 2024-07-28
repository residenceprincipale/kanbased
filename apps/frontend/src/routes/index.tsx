import { A } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { CreateBoard } from "~/components/create-board";
import { Card } from "~/components/ui/card";
import { getBoardsQuery } from "~/lib/query-options-factory";

export default function Home() {
    const boardsQuery = createQuery(getBoardsQuery);

    return (
        <main class="px-10">
            <div class="flex items-center gap-4 justify-between my-4 mt-6">
                <h1 class="text-xl font-semibold">
                    Boards ({boardsQuery?.data?.length})
                </h1>
                <CreateBoard />
            </div>
            <Switch>
                <Match when={boardsQuery.isFetching}>
                    <p>Loading...</p>
                </Match>

                <Match when={boardsQuery.isError}>
                    <p>Error!</p>
                </Match>

                <Match when={boardsQuery.isSuccess}>
                    <div class="flex gap-8">
                        <ul class="w-full flex flex-wrap gap-4 my-8">
                            <For each={boardsQuery.data}>
                                {(board) => (
                                    <li>
                                        <A href={`/boards/${board.name}`}>
                                            <Card class="flex items-center gap-2 w-44 h-36 justify-center hover:bg-muted hover:text-bg-muted-foreground">
                                                <div class="w-[1.125rem] h-[1.125rem] bg-indigo-600 rounded-full shrink-0" />
                                                <div class="">{board.name}</div>
                                            </Card>
                                        </A>
                                    </li>
                                )}
                            </For>
                        </ul>
                    </div>
                </Match>
            </Switch>
        </main>
    );
}
