"use client";
import type React from "react";
import { useSubscribe } from "@/hooks/use-subcribe";
import { listColumns } from "@/lib/queries";

export default function Layout(props: React.PropsWithChildren) {
  useSubscribe(listColumns, "columns");
  return props.children;
}
