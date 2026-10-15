import { indentUnit } from "@codemirror/language";
import { EditorSelection, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

const INDENT = "    ";

/**
 * Enter keeps the indentation of the line being split, and adds one level after a line that ends
 * with a colon. The Python language mode guesses indentation from the syntax tree, which often
 * returns column 0 in unfinished code, so a learner had to retype spaces after every Enter.
 */
const enterKeepsIndent = keymap.of([
  {
    key: "Enter",
    run: (view) => {
      const { state } = view;
      if (state.selection.ranges.some((range) => !range.empty)) return false;
      const changes = state.changeByRange((range) => {
        const line = state.doc.lineAt(range.head);
        const before = line.text.slice(0, range.head - line.from);
        const lead = /^[ \t]*/.exec(before)?.[0] ?? "";
        const extra = /:\s*(#.*)?$/.test(before.trimEnd()) && before.trim() !== "" ? INDENT : "";
        const insert = `\n${lead}${extra}`;
        return {
          changes: { from: range.head, insert },
          range: EditorSelection.cursor(range.head + insert.length),
        };
      });
      view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
      return true;
    },
  },
]);

/** Shared Python editor behaviour: four-space indents, Tab to indent, Enter keeps the level. */
export const pythonEditorBehaviour = [
  indentUnit.of(INDENT),
  Prec.highest(enterKeepsIndent),
  keymap.of([indentWithTab]),
];
