import {
  keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor,
  rectangularSelection, crosshairCursor,
  highlightActiveLineGutter
} from "@codemirror/view"
import { Extension, EditorState } from "@codemirror/state"
import {
  defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching,
  foldKeymap
} from "@codemirror/language"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"

export const basicExtensions: Extension[] = [
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  // syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
  ])
]