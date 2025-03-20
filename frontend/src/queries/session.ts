import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useSession() {
  const router = useRouter();
  const { data } = useSuspenseQuery(sessionQueryOptions);

  if (!data) {
    router.navigate({ to: "/login" });
  }

  return data;
}
