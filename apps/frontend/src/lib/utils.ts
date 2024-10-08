import { type ClassValue, clsx } from "clsx";
import type { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { useParams } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function useBetterParams<TParams extends Record<string, any>>() {
  const params = useParams<TParams>();
  const paramsCopy = { ...params };
  for (let key in paramsCopy) {
    (paramsCopy[key] as any) = decodeURIComponent(paramsCopy[key]);
  }
  return paramsCopy;
}

export async function promiseTimeout(delayInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMs);
  });
}
