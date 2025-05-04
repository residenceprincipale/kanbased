import { useEffect} from "react";
import type {DependencyList} from "react";
import {useEffectEvent} from "@/hooks/use-event";

export function useKeyDown(
  callback: (e: KeyboardEvent) => void,
  deps: DependencyList = [],
) {
  const cb = useEffectEvent(callback);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      cb(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, deps);
}
