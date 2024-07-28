import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { queryClient } from "~/lib/query-client";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function getIsLocal() {
    return !!queryClient.getDefaultOptions().mutations?.meta?.isLocal;
}
