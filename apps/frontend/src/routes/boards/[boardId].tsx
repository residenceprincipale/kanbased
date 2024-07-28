import { useParams } from "@solidjs/router";

export default function Board() {
  const params = useParams<{ boardId: string }>();
  return <div>{params.boardId}</div>;
}
