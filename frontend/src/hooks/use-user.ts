import { api } from "@/lib/openapi-react-query";

export function useUser() {
  const { data: user } = api.useQuery('get', '/current-user');
  return { user: user! }
}