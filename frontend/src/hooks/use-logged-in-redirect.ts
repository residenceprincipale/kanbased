import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useLoggedInRedirect() {
  const router = useRouter();
  const { data } = useQuery({ ...sessionQueryOptions, refetchOnMount: false });

  if (data?.data?.session) {
    if (!data.data.session.activeOrganizationId) {
      router.navigate({ to: "/welcome" });
    } else {
      router.navigate({ to: "/" });
    }
  }
}
