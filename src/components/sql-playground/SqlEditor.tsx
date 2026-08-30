import { useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { sql as sqlLang, PostgreSQL, type SQLNamespace } from "@codemirror/lang-sql";
import { Decoration, EditorView, keymap, type DecorationSet } from "@codemirror/view";
import { Prec, StateEffect, StateField, RangeSetBuilder } from "@codemirror/state";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { oneDark } from "@codemirror/theme-one-dark";

import type { Engine } from "./db/db-client";
import { statementAt, statementRanges } from "./db/db-client";
import { findDialectIssues } from "./db/dialect";

export interface RunTarget {
  sql: string;
  /** What the user is about to run, for the button label. */
  label: "selection" | "statement" | "script";
  from: number;
  to: number;
}

export interface SqlEditorHandle {
  selection(): string;
  focus(): void;
  insert(text: string): void;
  /** Selection if there is one, else the statement at the cursor, else all. */
  runTarget(): RunTarget;
  format(): void;
}

/** An error reported by the engine, mapped back onto the text. */
export interface EngineError {
  message: string;
  hint?: string;
  /** Offsets into the document, when we could locate it. */
  from?: number;
  to?: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onExplain: () => void;
  onFormat: () => void;
  schema: Record<string, string[]>;
  engine: Engine;
  dark: boolean;
  /** Result of the last run, so the failing token can be underlined. */
  engineError: EngineError | null;
  /** Fires when the cursor moves, so the toolbar can relabel the Run button. */
  onTargetChange?: (target: RunTarget) => void;
  readOnly?: boolean;
}

// ---------------------------------------------------------------- current statement

const setActiveRange = StateEffect.define<{ from: number; to: number } | null>();

/**
 * Signals that the diagnostics are stale for a reason the document does not
 * show: a new engine error, or a switch to the other dialect. The linter only
 * re-runs on document changes unless `needsRefresh` says otherwise.
 */
const refreshDiagnostics = StateEffect.define<null>();

/**
 * Dim everything except the statement the cursor is in, but only when the
 * document holds more than one. With a single statement there is nothing to
 * disambiguate and the dimming would just be noise.
 */
const activeStatementField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(value, tr) {
    for (const e of tr.effects) {
      if (!e.is(setActiveRange)) continue;
      if (!e.value) return Decoration.none;
      const builder = new RangeSetBuilder<Decoration>();
      const { from, to } = e.value;
      const docLength = tr.state.doc.length;
      if (from > 0) {
        builder.add(0, Math.min(from, docLength), Decoration.mark({ class: "sqlx-inactive-stmt" }));
      }
      if (to < docLength) {
        builder.add(
          Math.min(to, docLength),
          docLength,
          Decoration.mark({ class: "sqlx-inactive-stmt" }),
        );
      }
      return builder.finish();
    }
    return tr.docChanged ? Decoration.none : value.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ---------------------------------------------------------------- themes

const lightTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", color: "var(--sqlx-ink)" },
  ".cm-gutters": { backgroundColor: "transparent", color: "var(--sqlx-ink-3)", border: "none" },
  ".cm-activeLine": { backgroundColor: "var(--sqlx-accent-soft)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--sqlx-ink-2)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--sqlx-select) !important",
  },
  ".cm-cursor": { borderLeftColor: "var(--sqlx-ink)" },
});

const sharedTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "13.5px" },
  ".cm-scroller": { fontFamily: "var(--sqlx-mono)", lineHeight: "1.6", overflow: "auto" },
  ".cm-content": { padding: "10px 0" },
  "&.cm-focused": { outline: "none" },
  ".cm-tooltip-autocomplete": { fontFamily: "var(--sqlx-mono)", fontSize: "12.5px" },
  ".sqlx-inactive-stmt": { opacity: "0.42" },
  ".cm-lintRange-error": {
    backgroundImage: "none",
    borderBottom: "2px wavy var(--sqlx-err)",
    textDecoration: "underline wavy var(--sqlx-err) 1px",
    textUnderlineOffset: "3px",
  },
  ".cm-lintRange-warning": {
    backgroundImage: "none",
    textDecoration: "underline wavy var(--sqlx-warn) 1px",
    textUnderlineOffset: "3px",
  },
  ".cm-diagnostic": { fontFamily: "var(--sqlx-sans)", fontSize: "12.5px" },
  ".cm-diagnostic-error": { borderLeftColor: "var(--sqlx-err)" },
});

// ---------------------------------------------------------------- component

export const SqlEditor = forwardRef<SqlEditorHandle, Props>(function SqlEditor(
  {
    value,
    onChange,
    onRun,
    onExplain,
    onFormat,
    schema,
    engine,
    dark,
    engineError,
    onTargetChange,
    readOnly,
  },
  ref,
) {
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  // Everything the extensions close over lives in a ref. Rebuilding the
  // extension array tears down the linter and the editor state, so it must not
  // happen on every keystroke just because a callback got a new identity.
  const errorRef = useRef<EngineError | null>(engineError);
  errorRef.current = engineError;
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const handlers = useRef({ onRun, onExplain, onFormat, onTargetChange });
  handlers.current = { onRun, onExplain, onFormat, onTargetChange };

  const computeTarget = (): RunTarget => {
    const view = cmRef.current?.view;
    if (!view) return { sql: value, label: "script", from: 0, to: value.length };

    const doc = view.state.doc.toString();
    const whole: RunTarget = { sql: doc, label: "script", from: 0, to: doc.length };

    const { from, to } = view.state.selection.main;
    if (from !== to) {
      return { sql: view.state.sliceDoc(from, to), label: "selection", from, to };
    }

    // Running just the statement under the cursor only makes sense once the
    // user has actually put a cursor somewhere. Loading a script from the
    // sidebar and pressing Run should run the script, not its first statement.
    if (!view.hasFocus) return whole;

    const ranges = statementRanges(doc);
    if (ranges.length <= 1) return whole;

    const at = statementAt(doc, from);
    return at ? { sql: at.text, label: "statement", from: at.from, to: at.to } : whole;
  };

  useImperativeHandle(ref, () => ({
    selection() {
      const view = cmRef.current?.view;
      if (!view) return "";
      const { from, to } = view.state.selection.main;
      return from === to ? "" : view.state.sliceDoc(from, to);
    },
    focus() {
      cmRef.current?.view?.focus();
    },
    insert(text: string) {
      const view = cmRef.current?.view;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      view.focus();
    },
    runTarget: computeTarget,
    format() {
      onFormat();
    },
  }));

  // Re-run the linter when the engine changes or a new error arrives.
  useEffect(() => {
    const view = cmRef.current?.view;
    if (view) view.dispatch({ effects: refreshDiagnostics.of(null) });
  }, [engine, engineError]);

  const extensions = useMemo(() => {
    /** Dialect problems plus the last engine error, as inline diagnostics. */
    const sqlLinter = linter(
      (view) => {
        const doc = view.state.doc.toString();
        const out: Diagnostic[] = [];

        for (const issue of findDialectIssues(doc, engineRef.current)) {
          out.push({
            from: issue.from,
            to: issue.to,
            severity: "error",
            source: "dialect",
            message: issue.message,
          });
        }

        const err = errorRef.current;
        if (err && err.from !== undefined && err.to !== undefined && err.to <= doc.length) {
          out.push({
            from: err.from,
            to: err.to,
            severity: "error",
            source: "engine",
            message: err.hint ? `${err.message}\n\n${err.hint}` : err.message,
          });
        }

        return out;
      },
      {
        delay: 250,
        needsRefresh: (update) =>
          update.transactions.some((tr) => tr.effects.some((e) => e.is(refreshDiagnostics))),
      },
    );

    return [
      sqlLang({
        dialect: PostgreSQL,
        schema: schema as SQLNamespace,
        upperCaseKeywords: true,
      }),
      sharedTheme,
      ...(dark ? [oneDark] : [lightTheme]),
      EditorView.lineWrapping,
      activeStatementField,
      sqlLinter,
      lintGutter(),
      // Track the cursor so the Run button can say what it will run.
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet && !update.docChanged && !update.focusChanged) return;
        const view = update.view;
        // CodeMirror forbids dispatching from inside an update listener, and
        // doing so quietly desynchronises the view from React's value prop.
        queueMicrotask(() => {
          if (!view.dom.isConnected) return;
          const target = computeTarget();
          handlers.current.onTargetChange?.(target);
          const shouldDim = target.label === "statement";
          view.dispatch({
            effects: setActiveRange.of(shouldDim ? { from: target.from, to: target.to } : null),
          });
        });
      }),
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", preventDefault: true, run: () => (handlers.current.onRun(), true) },
          { key: "Shift-Enter", preventDefault: true, run: () => (handlers.current.onRun(), true) },
          { key: "Mod-e", preventDefault: true, run: () => (handlers.current.onExplain(), true) },
          {
            key: "Shift-Alt-f",
            preventDefault: true,
            run: () => (handlers.current.onFormat(), true),
          },
        ]),
      ),
    ];
    // Only schema and theme change the extensions; the handlers go through a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, dark]);

  return (
    <CodeMirror
      ref={cmRef}
      value={value}
      onChange={onChange}
      extensions={extensions}
      readOnly={readOnly}
      height="100%"
      theme={dark ? "dark" : "light"}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        autocompletion: true,
        bracketMatching: true,
        closeBrackets: true,
        highlightSelectionMatches: true,
        searchKeymap: false,
      }}
      className="sqlx-cm"
    />
  );
});
