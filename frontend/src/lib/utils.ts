import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useBetterParams<TParams extends Record<string, any>>() {
  return {};
}

export function getId() {
  return crypto.randomUUID();
}

export async function promiseTimeout(delayInMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayInMs);
  });
}


export async function fetchAndCacheImage(cacheName: string, imageUrl: string): Promise<string | null> {
  const cache = await caches.open(cacheName);

  // Check if the image is already cached
  const cachedResponse = await cache.match(imageUrl);

  if (cachedResponse) {
    const res = await cachedResponse.blob();
    return URL.createObjectURL(res);
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();

    cache.put(imageUrl, response.clone());
    return URL.createObjectURL(blob);

  } catch (err) {
    return null;
  }
};


export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
