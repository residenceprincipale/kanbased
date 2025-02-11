import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useSession() {
  const router = useRouter();
  const { data } = useSuspenseQuery({ ...sessionQueryOptions, refetchOnMount: false, });

  if (data?.error) {
    throw data?.error;
  }

  if (data?.data === null || !data) {
    router.navigate({ to: "/auth/login" });
  }

  return data.data;
}
