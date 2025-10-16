import {useZero} from "@rocicorp/zero/react";
import type {Schema} from "./zero-schema.gen";

export function useZ() {
  return useZero<Schema>();
}

export type Z = ReturnType<typeof useZ>;
