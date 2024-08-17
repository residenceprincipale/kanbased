import { TopSection } from "@/components/top-section";
import type React from "react";

export default function BoardsLayout(props: React.PropsWithChildren) {
  return (
    <div>
      <TopSection />
      {props.children}
    </div>
  );
}
