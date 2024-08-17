"use client";
import { useParams } from "next/navigation";

export default function BoardPage() {
  const { boardName } = useParams<{ boardName: string }>();
  return <div>{boardName}</div>;
}
