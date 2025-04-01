import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useSession() {
  const router = useRouter();
  const { data } = useQuery(sessionQueryOptions);

  if (!data) {
    router.navigate({ to: "/login" });
  }

  return data!;
}
