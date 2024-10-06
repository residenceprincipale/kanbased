"use client";
import type React from "react";
import { useSubscribe } from "@/hooks/use-subcribe";
import { listBoards } from "@/lib/queries";

export default function BoardsLayout(props: React.PropsWithChildren) {
  useSubscribe(listBoards, "columns");
  return props.children;
}
