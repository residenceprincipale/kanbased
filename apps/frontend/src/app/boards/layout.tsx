"use client";
import type React from "react";
import { TopSection } from "@/components/top-section";
import { useSubscribe } from "@/hooks/use-subcribe";
import { listBoards, listTabs } from "@/lib/queries";

export default function BoardsLayout(props: React.PropsWithChildren) {
  useSubscribe(listBoards, "boards");
  useSubscribe(listTabs, "tabs");

  return (
    <div className="h-screen flex flex-col">
      <header className="shrink-0">
        <TopSection />
      </header>
      {props.children}
    </div>
  );
}
