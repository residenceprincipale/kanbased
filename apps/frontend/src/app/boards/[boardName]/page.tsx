"use client";
import { useRepContext } from "@/components/replicache-provider";
import { listTabs } from "@/lib/queries";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BoardPage() {
  const { boardName: encodedBoardName } = useParams<{ boardName: string }>();
  const boardName = decodeURIComponent(encodedBoardName);
  const rep = useRepContext();
  useState(() => {
    rep.query(listTabs).then((tabs) => {
      const hasCurrentBoard = tabs?.some((tab) => tab.boardName === boardName);

      if (!hasCurrentBoard) {
        rep.mutate.createTab({ boardName, boardColor: "" });
      }
    });
  });

  return <div>{boardName}</div>;
}
