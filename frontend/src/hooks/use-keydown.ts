import { useEffectEvent } from "@/hooks/use-event";
import { useEffect } from "react";

export function useKeyDown(callback: (e: KeyboardEvent) => void) {
  const cb = useEffectEvent(callback);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      cb(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
