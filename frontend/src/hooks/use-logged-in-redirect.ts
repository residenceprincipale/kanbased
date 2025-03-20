import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useLoggedInRedirect() {
  const router = useRouter();
  const { data } = useQuery(sessionQueryOptions);

  if (data?.session) {
    router.navigate({ to: "/" });
  }
}
