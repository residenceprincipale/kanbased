import { TopSection } from "@/components/top-section";
import type React from "react";

export default function BoardsLayout(props: React.PropsWithChildren) {
  return (
    <div className="h-screen flex flex-col">
      <header className="shrink-0">
        <TopSection />
      </header>
      {props.children}
    </div>
  );
}
