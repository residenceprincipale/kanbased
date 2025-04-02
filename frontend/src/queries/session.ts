import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useSession() {
  const router = useRouter();
  const { data } = useQuery(sessionQueryOptions);

  const isSessionExpired = data?.session.expiresAt
    ? new Date(data.session.expiresAt) < new Date()
    : false;

  if (!data || isSessionExpired) {
    router.navigate({ to: "/login" });
  }

  return data!;
}
