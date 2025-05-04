import {focusElementWithDelay} from "@/lib/helpers";
import {useRouter} from "@tanstack/react-router";
import {getRouteApi} from "@tanstack/react-router";
import NoteEditor from "@/features/notes/note-editor";
import {GetNoteQueryResult} from "@/lib/zero-queries";
const routeApi = getRouteApi("/_authenticated/_layout/notes");

export function Actions(props: {note: GetNoteQueryResult}) {
  const router = useRouter();
  const {createNote, editNoteId} = routeApi.useSearch();

  if (createNote) {
    return (
      <NoteEditor
        mode="create"
        onClose={() => {
          router.navigate({to: ".", search: undefined, replace: true});
          focusElementWithDelay(document.getElementById("create-note-button"));
        }}
        afterSave={({noteId}) => {
          router.navigate({
            to: "/notes/$noteId",
            params: {noteId},
            search: undefined,
            replace: true,
          });
        }}
      />
    );
  }

  if (editNoteId && props.note) {
    const handleClose = () => {
      router.navigate({to: ".", search: undefined, replace: true});
      focusElementWithDelay(document.getElementById(`note-item-${editNoteId}`));
    };

    return (
      <NoteEditor
        mode="edit"
        noteId={editNoteId}
        content={props.note.content}
        title={props.note.name}
        afterSave={handleClose}
        onClose={handleClose}
      />
    );
  }

  return null;
}
