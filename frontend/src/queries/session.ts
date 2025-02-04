import { sessionQueryOptions } from "@/lib/query-options-factory";
import { useQuery } from "@tanstack/react-query";

export function useSession() {
  const { data } = useQuery({ ...sessionQueryOptions, refetchOnMount: false, });
  return data!;
}

