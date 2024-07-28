import { Route, Router } from "@solidjs/router";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import "./app.css";
import "@fontsource/inter";
import { persister, queryClient } from "~/lib/query-client";
import { PersistQueryClientProvider } from "@tanstack/solid-query-persist-client";
import Home from "~/routes";
import Login from "~/routes/auth/login";
import HomeRouteLayout from "~/components/home-layout";
import Board from "~/routes/boards/[boardId]";

export const myAppUrl = {
  login: "/auth/login",
  home: "/",
  board: (boardId: string) => `/boards/${boardId}` as const,
} as const;

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Router>
        <Route path={myAppUrl.home} component={HomeRouteLayout}>
          <Route path={myAppUrl.home} component={Home} />
          <Route path={myAppUrl.board(":boardId")} component={Board} />
        </Route>
        <Route path={myAppUrl.login} component={Login} />
      </Router>
      <SolidQueryDevtools />
    </PersistQueryClientProvider>
  );
}
