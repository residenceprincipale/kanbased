"use client";
import { ReplicacheProvider } from "@/components/replicache-provider";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ReplicacheProvider>{children}</ReplicacheProvider>;
}
