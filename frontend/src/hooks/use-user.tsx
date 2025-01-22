import { Route } from "@/routes/__root";
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  const { authQueryOptions } = Route.useRouteContext();
  const { data } = useQuery({ ...authQueryOptions, refetchOnMount: false });
  return data!.user!;
}
