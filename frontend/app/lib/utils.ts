import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function useBetterParams<TParams extends Record<string, any>>() {
  return {};
}

export async function promiseTimeout(delayInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMs);
  });
}