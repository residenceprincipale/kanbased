import { api } from "@/lib/openapi-react-query";

export function useUser() {
  const { data: user } = api.useSuspenseQuery('get', '/current-user');
  return { user };
}