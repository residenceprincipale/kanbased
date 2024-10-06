"use client";
import type React from "react";
import { useSubscribe } from "@/hooks/use-subcribe";
import { listColumns } from "@/lib/queries";
import { useGetStoreData } from "@/hooks/use-data-store";

export interface LayoutProps {
  children?: React.ReactNode;
  params?: any;
}

export default function Layout(props: LayoutProps) {
  const boardName = decodeURIComponent(props?.params?.boardName);
  const boardId = useGetStoreData("boards")?.find(
    (board) => board.name === boardName
  )?.id!;

  useSubscribe((tx) => listColumns(tx, boardId), "columns");
  return props.children;
}
