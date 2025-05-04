import {fetchSession} from "@/queries/session";
import {useRouter} from "@tanstack/react-router";
import {useEffect} from "react";

export function useLoggedInRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetchSession()
      .then((data) => {
        if (data?.session) {
          router.navigate({to: "/"});
        }
      })
      .catch(() => {});
  }, []);
}
