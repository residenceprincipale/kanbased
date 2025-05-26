import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useQuery} from "@rocicorp/zero/react";
import {useZ} from "@/lib/zero-cache";
import {getNoteQuery} from "@/lib/zero-queries";
import EditNote from "@/features/notes/edit-note";
import {promiseTimeout} from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_layout/notes/$noteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const {noteId} = Route.useParams();
  const z = useZ();
  const [note] = useQuery(getNoteQuery(z, noteId));
  const navigate = useNavigate();

  if (note === undefined) {
    return null;
  }

  const goToNotes = async () => {
    await navigate({to: "/notes"});
    await promiseTimeout(100);
    document.getElementById(`note-item-${noteId}`)?.focus();
  };

  return <EditNote note={note} onClose={goToNotes} />;
}
