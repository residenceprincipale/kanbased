import { useParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { useAppContext } from "~/context/app-context";

export default function Board() {
  const params = useParams<{ boardId: string }>();
  const { pinBoard } = useAppContext();

  pinBoard(Number(params.boardId));

  return <div>{params.boardId}</div>;
}
