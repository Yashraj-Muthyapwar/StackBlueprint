import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Decoration, EditorView, lineNumbers, gutter, GutterMarker } from "@codemirror/view";
import { StateField, StateEffect, RangeSet, type Extension } from "@codemirror/state";
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Square,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  Link2,
  Brain,
  FastForward,
  SkipForward,
  Check,
  X,
} from "lucide-react";

import { getPyodide } from "@/lib/pyodide-loader";
import { TRACER_PY } from "@/lib/python-tracer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------- Types matching tracer output ----------------

type PrimVal = { kind: "prim"; type: string; value: string | number | boolean };
type RefVal = { kind: "ref"; id: string };
type Value = PrimVal | RefVal;

type HeapObj =
  | { type: "list" | "tuple" | "set"; items: Value[]; size: number; truncated?: boolean }
  | { type: "dict"; items: [Value, Value][]; size: number; truncated?: boolean }
  | { type: string; repr: string };

type Frame = { name: string; line: number; locals: Record<string, Value> };
type Snapshot = {
  event: "line" | "call" | "return";
  line: number;
  frames: Frame[];
  heap: Record<string, HeapObj>;
  stdout: string;
  returnValue?: Value;
  callName?: string;
};

type TraceResult = { snapshots: Snapshot[]; error: string | null; stdout: string };

// ---------------- Active line highlight extension ----------------

const setHighlight = StateEffect.define<number | null>();

const highlightField = StateField.define({
  create: () => Decoration.none,
  update(value, tr) {
    let v = value.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setHighlight)) {
        if (e.value == null) {
          v = Decoration.none;
        } else {
          const doc = tr.state.doc;
          const ln = Math.max(1, Math.min(doc.lines, e.value));
          const line = doc.line(ln);
          v = Decoration.set([
            Decoration.line({
              attributes: { style: "background: rgba(110, 231, 183, 0.22);" },
            }).range(line.from),
          ]);
        }
      }
    }
    return v;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ---------------- Breakpoint gutter extension ----------------

const toggleBreakpoint = StateEffect.define<{ pos: number; on: boolean }>();

const breakpointDot = new (class extends GutterMarker {
  toDOM() {
    const el = document.createElement("div");
    el.style.cssText =
      "width:8px;height:8px;border-radius:9999px;background:var(--rose);box-shadow:0 0 6px var(--rose);";
    return el;
  }
})();

const breakpointField = StateField.define<RangeSet<GutterMarker>>({
  create: () => RangeSet.empty,
  update(set, tr) {
    set = set.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(toggleBreakpoint)) {
        if (e.value.on) set = set.update({ add: [breakpointDot.range(e.value.pos)] });
        else set = set.update({ filter: (from: number) => from !== e.value.pos });
      }
    }
    return set;
  },
});

function collectBreakpointLines(view: EditorView): Set<number> {
  const lines = new Set<number>();
  const it = view.state.field(breakpointField).iter();
  while (it.value) {
    if (it.from <= view.state.doc.length) lines.add(view.state.doc.lineAt(it.from).number);
    it.next();
  }
  return lines;
}

function hasBreakpointAt(view: EditorView, pos: number): boolean {
  let found = false;
  view.state.field(breakpointField).between(pos, pos, () => {
    found = true;
  });
  return found;
}

// Rose tint on breakpointed lines so setting one gives instant visual feedback.
const breakpointLineField = StateField.define({
  create: () => Decoration.none,
  update(deco: any, tr: any) {
    deco = deco.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(toggleBreakpoint)) {
        if (e.value.on) {
          deco = deco.update({
            add: [
              Decoration.line({
                attributes: { style: "background: rgba(244, 63, 94, 0.09);" },
              }).range(e.value.pos),
            ],
          });
        } else {
          deco = deco.update({ filter: (from: number) => from !== e.value.pos });
        }
      }
    }
    return deco;
  },
  provide: (f: any) => EditorView.decorations.from(f),
});

const baseEditorExtensions: Extension[] = [
  python(),
  oneDark,
  highlightField,
  breakpointField,
  breakpointLineField,
  EditorView.lineWrapping,
  EditorView.theme({
    "&": { height: "100%", fontSize: "13px" },
    ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, monospace" },
    // Whole number column is a click target for breakpoints.
    ".cm-lineNumbers .cm-gutterElement": { cursor: "pointer" },
    ".cm-breakpoint-gutter": { width: "14px", cursor: "pointer" },
    ".cm-breakpoint-gutter .cm-gutterElement": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  }),
];

// ---------------- Sample snippets ----------------

const SAMPLES: { label: string; code: string }[] = [
  {
    label: "Recursion · factorial",
    code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

nums = [1, 2, 3, 4, 5]
results = {}
for x in nums:
    results[x] = factorial(x)

print(results)
`,
  },
  {
    label: "List mutation · references",
    code: `a = [1, 2, 3]
b = a            # same list, two names
c = a[:]         # shallow copy
a.append(4)
b.append(5)
c.append(99)
print("a =", a)
print("b =", b)
print("c =", c)
`,
  },
  {
    label: "Dict · word frequency",
    code: `words = "the quick brown fox jumps over the lazy fox".split()
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
print(freq)
`,
  },
  {
    label: "Closure · counter factory",
    code: `def make_counter(start=0):
    count = start
    def step():
        nonlocal count
        count += 1
        return count
    return step

c1 = make_counter()
c2 = make_counter(10)
print(c1(), c1(), c1())
print(c2(), c2())
`,
  },
  {
    label: "Fibonacci · memoized",
    code: `cache = {}

def fib(n):
    if n in cache:
        return cache[n]
    if n < 2:
        return n
    cache[n] = fib(n - 1) + fib(n - 2)
    return cache[n]

print([fib(i) for i in range(8)])
`,
  },
];

// ---------------- Helpers ----------------

function valueLabel(v: Value): string {
  if (v.kind === "prim") return String(v.value);
  return `#${v.id.slice(-4)}`;
}

function valuePlain(v: Value, heap?: Record<string, HeapObj>): string {
  if (v.kind === "prim") return String(v.value);
  const o = heap?.[v.id];
  if (!o) return `object #${v.id.slice(-4)}`;
  if ("items" in o) return `${o.type}(len=${o.size})`;
  return o.type;
}

function valueClass(v: Value): string {
  if (v.kind === "ref") return "text-violet/80";
  if (v.type === "str") return "text-mint";
  if (v.type === "NoneType") return "text-muted-foreground";
  if (v.type === "bool") return "text-amber";
  return "text-amber";
}

function valueKey(v: Value): string {
  return v.kind === "prim" ? `p:${v.type}:${v.value}` : `r:${v.id}`;
}

// ---------------- Predict mode ----------------
//
// Before revealing the next step, ask the learner to commit to a prediction.
// Committing to a belief and then seeing it confirmed or broken is what turns
// passive watching into actual reasoning practice.

type Prediction = {
  targetIdx: number; // the snapshot index this prediction reveals
  prompt: string;
  correct: string;
  options: string[];
  answered: { choice: string; ok: boolean } | null;
};

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(correct: string, type: string, extras: string[]): string[] {
  const opts = new Set<string>([correct]);
  if (type === "bool") {
    const flips: Record<string, string> = {
      true: "false",
      false: "true",
      True: "False",
      False: "True",
    };
    opts.add(flips[correct] ?? "True");
  } else if (type === "int" || type === "float") {
    const n = Number(correct);
    if (Number.isFinite(n)) {
      for (const cand of [n + 1, n - 1, n * 2]) {
        if (opts.size < 4) opts.add(String(type === "int" ? Math.trunc(cand) : cand));
      }
    }
  }
  for (const e of extras) {
    if (opts.size >= 4) break;
    if (e !== undefined && e !== null && e !== "") opts.add(e);
  }
  // Last-resort fillers so a question never renders with fewer than 3 options.
  let filler = 0;
  while (opts.size < 3) opts.add(`${correct}_${++filler}`);
  return shuffled([...opts]);
}

// Decide whether stepping from `cur` to `next` is worth a question, and build one.
function makePrediction(cur: Snapshot, next: Snapshot, targetIdx: number): Prediction | null {
  // Best question in the trace: what does this function return?
  if (next.event === "return" && next.returnValue?.kind === "prim") {
    const rv = next.returnValue;
    if (["int", "float", "str", "bool"].includes(rv.type)) {
      const f = next.frames.at(-1);
      const argHint = f
        ? Object.entries(f.locals)
            .filter(([, v]) => v.kind === "prim")
            .slice(0, 3)
            .map(([k, v]) => `${k}=${String((v as PrimVal).value)}`)
            .join(", ")
        : "";
      const correct = String(rv.value);
      return {
        targetIdx,
        prompt: `${f?.name ?? "The function"}(${argHint}) is about to return. What value comes back?`,
        correct,
        options: buildOptions(correct, rv.type, []),
        answered: null,
      };
    }
  }

  if (next.event !== "line") return null;
  const topIdx = next.frames.length - 1;
  const top = next.frames[topIdx];
  const prevTop = cur.frames[topIdx];
  if (!top || !prevTop) return null;

  // Changed primitives (loop counters, accumulators) make the best questions.
  // A brand-new primitive assignment is the fallback question.
  let fallback: Prediction | null = null;
  const framePrims = Object.values(top.locals)
    .filter((v): v is PrimVal => v.kind === "prim")
    .map((v) => String(v.value));
  for (const [k, v] of Object.entries(top.locals)) {
    if (v.kind !== "prim" || !["int", "float", "str", "bool"].includes(v.type)) continue;
    const pv = prevTop.locals[k];
    const correct = String(v.value);
    if (pv && valueKey(pv) !== valueKey(v)) {
      const prevStr = pv.kind === "prim" ? String(pv.value) : "";
      return {
        targetIdx,
        prompt: `The highlighted line is about to run. What will ${k} be after it?`,
        correct,
        options: buildOptions(correct, v.type, [prevStr]),
        answered: null,
      };
    }
    if (!pv && !fallback) {
      fallback = {
        targetIdx,
        prompt: `The highlighted line is about to run. What value will ${k} get?`,
        correct,
        options: buildOptions(
          correct,
          v.type,
          framePrims.filter((s) => s !== correct),
        ),
        answered: null,
      };
    }
  }
  return fallback;
}

// Map heap id -> variable names pointing at it, for aliasing callouts.
function refOwners(snap: Snapshot): Map<string, string[]> {
  const owners = new Map<string, string[]>();
  snap.frames.forEach((f, fi) => {
    Object.entries(f.locals).forEach(([k, v]) => {
      if (v.kind !== "ref") return;
      const tag = fi === 0 ? k : `${f.name}.${k}`;
      const list = owners.get(v.id) ?? [];
      list.push(tag);
      owners.set(v.id, list);
    });
  });
  return owners;
}

// Build a plain-English narration of what changed at this step.
function narrate(snap: Snapshot, prev?: Snapshot): string {
  if (snap.event === "call") {
    const f = snap.frames.at(-1);
    if (!f) return `entering ${snap.callName ?? "function"}`;
    const args = Object.entries(f.locals)
      .map(([k, v]) => `${k}=${valuePlain(v, snap.heap)}`)
      .join(", ");
    return `Calling ${f.name}(${args}) — a new frame is pushed onto the stack.`;
  }
  if (snap.event === "return") {
    const f = snap.frames.at(-1);
    const rv = snap.returnValue ? valuePlain(snap.returnValue, snap.heap) : "None";
    return `${f?.name ?? "function"} returns ${rv}. Its frame is popped; control goes back to the caller.`;
  }
  // line event: describe locals diff in top frame
  const top = snap.frames.at(-1);
  const prevTop = prev?.frames[snap.frames.length - 1];
  if (!top) return `Executing line ${snap.line}.`;
  const changes: string[] = [];
  Object.entries(top.locals).forEach(([k, v]) => {
    const pv = prevTop?.locals[k];
    if (!pv) changes.push(`${k} = ${valuePlain(v, snap.heap)} (new)`);
    else if (valueKey(pv) !== valueKey(v)) changes.push(`${k} → ${valuePlain(v, snap.heap)}`);
  });
  let base = !changes.length
    ? `Running line ${snap.line} in ${top.name}.`
    : `Line ${snap.line}: ${changes.join(", ")}.`;

  // Aliasing callout: if a heap object just gained a second name, say so.
  // This is the number one beginner misconception and it deserves a sentence.
  if (prev) {
    const now = refOwners(snap);
    const before = refOwners(prev);
    for (const [id, names] of now) {
      if (names.length < 2) continue;
      const prevNames = before.get(id) ?? [];
      const newcomers = names.filter((n) => !prevNames.includes(n));
      if (newcomers.length && prevNames.length) {
        const obj = snap.heap[id];
        const kind = obj && "items" in obj ? obj.type : "object";
        base += ` Careful: ${names.join(" and ")} now point to the SAME ${kind} in memory. Mutating it through one name changes it for all of them.`;
        break;
      }
    }
  }
  return base;
}

// ---------------- Heap rendering ----------------

function HeapCard({
  id,
  obj,
  registerRef,
  isNew,
  changedItems,
  aliases,
  live,
  stepIdx,
}: {
  id: string;
  obj: HeapObj;
  registerRef: (key: string, el: HTMLElement | null) => void;
  isNew: boolean;
  changedItems: Set<number>;
  aliases: string[];
  live: boolean;
  stepIdx: number;
}) {
  const popStyle = isNew ? { animation: "sb-pop 0.35s ease-out" } : undefined;
  const shortId = id.slice(-4);
  const ringClass = isNew ? "ring-1 ring-mint/50" : live ? "ring-1 ring-violet/30" : "";
  const aliasBar =
    aliases.length > 0 ? (
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Link2 className="size-3 text-muted-foreground/70" />
        {aliases.map((a) => (
          <span
            key={a}
            className="rounded-full border border-violet/25 bg-violet/10 px-1.5 py-0.5 font-mono text-[10px] text-violet"
          >
            {a}
          </span>
        ))}
      </div>
    ) : null;

  if ("items" in obj && (obj.type === "list" || obj.type === "tuple" || obj.type === "set")) {
    const open = obj.type === "tuple" ? "(" : obj.type === "set" ? "{" : "[";
    const close = obj.type === "tuple" ? ")" : obj.type === "set" ? "}" : "]";
    return (
      <div
        ref={(el) => registerRef(`heap:${id}`, el)}
        style={popStyle}
        className={`rounded-lg border border-hairline bg-surface p-2 shadow-sm transition ${ringClass}`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{obj.type}</span>
          <span>
            #{shortId} · len={obj.size}
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-1 font-mono text-[12px]">
          <span className="self-center text-muted-foreground">{open}</span>
          {obj.items.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              {obj.type !== "set" && (
                <span className="text-[9px] font-medium tabular-nums text-muted-foreground/70">
                  {i}
                </span>
              )}
              <span
                key={changedItems.has(i) ? `c-${stepIdx}` : "s"}
                ref={(el) => registerRef(`heap:${id}:${i}`, el)}
                style={changedItems.has(i) ? { animation: "sb-flash 0.6s ease-out" } : undefined}
                className={`rounded border px-1.5 py-0.5 ${valueClass(v)} ${
                  changedItems.has(i)
                    ? "border-amber/70 bg-amber/10"
                    : "border-hairline bg-background"
                }`}
              >
                {valueLabel(v)}
              </span>
            </div>
          ))}
          {obj.truncated && <span className="self-center text-muted-foreground">…</span>}
          <span className="self-center text-muted-foreground">{close}</span>
        </div>
        {aliasBar}
      </div>
    );
  }

  if (obj.type === "dict" && "items" in obj) {
    return (
      <div
        ref={(el) => registerRef(`heap:${id}`, el)}
        style={popStyle}
        className={`rounded-lg border border-hairline bg-surface p-2 shadow-sm transition ${ringClass}`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>dict</span>
          <span>
            #{shortId} · len={obj.size}
          </span>
        </div>
        <div className="grid grid-cols-[auto_auto_1fr] items-center gap-x-2 gap-y-1 font-mono text-[12px]">
          {obj.items.map(([k, v], i) => (
            <div key={i} className="contents">
              <span className={valueClass(k)}>{valueLabel(k)}</span>
              <span className="text-muted-foreground">→</span>
              <span
                key={changedItems.has(i) ? `c-${stepIdx}` : "s"}
                ref={(el) => registerRef(`heap:${id}:${i}`, el)}
                style={changedItems.has(i) ? { animation: "sb-flash 0.6s ease-out" } : undefined}
                className={`justify-self-start rounded border px-1.5 py-0.5 ${valueClass(v)} ${
                  changedItems.has(i)
                    ? "border-amber/70 bg-amber/10"
                    : "border-hairline bg-background"
                }`}
              >
                {valueLabel(v)}
              </span>
            </div>
          ))}
          {obj.truncated && <div className="col-span-3 text-muted-foreground">…</div>}
        </div>
        {aliasBar}
      </div>
    );
  }

  return (
    <div
      ref={(el) => registerRef(`heap:${id}`, el)}
      style={popStyle}
      className={`rounded-lg border border-hairline bg-surface p-2 shadow-sm ${ringClass}`}
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {obj.type} · #{shortId}
      </div>
      <div className="font-mono text-[12px] text-foreground/80">
        {"repr" in obj ? obj.repr : ""}
      </div>
      {aliasBar}
    </div>
  );
}

// ---------------- Main playground ----------------

const SPEEDS = [
  { label: "0.5×", ms: 1100 },
  { label: "1×", ms: 550 },
  { label: "2×", ms: 250 },
  { label: "4×", ms: 100 },
];

export function PythonPlayground() {
  const [sampleLabel, setSampleLabel] = useState(SAMPLES[0].label);
  const [code, setCode] = useState(SAMPLES[0].code);
  const [status, setStatus] = useState<string>("Idle. Press Run to start.");
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Predict mode: intercept forward steps with a "what happens next?" question.
  const [predictMode, setPredictMode] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const lastAskedRef = useRef(-10); // snapshot index of the last question, throttles frequency

  // Breakpoints: line numbers with a red dot in the gutter.
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const breakpointsCbRef = useRef<(lines: Set<number>) => void>(() => {});
  breakpointsCbRef.current = setBreakpoints;

  const editorExtensions = useMemo<Extension[]>(() => {
    const toggleAt = (view: EditorView, pos: number) => {
      const on = !hasBreakpointAt(view, pos);
      view.dispatch({ effects: toggleBreakpoint.of({ pos, on }) });
      breakpointsCbRef.current(collectBreakpointLines(view));
      return true;
    };
    return [
      ...baseEditorExtensions,
      // Dot gutter first so it renders to the left of the numbers, like an IDE.
      gutter({
        class: "cm-breakpoint-gutter",
        markers: (v: EditorView) => v.state.field(breakpointField),
        initialSpacer: () => breakpointDot,
        domEventHandlers: {
          mousedown: (view: EditorView, line: { from: number }) => toggleAt(view, line.from),
        },
      }),
      // Clicking a line number also toggles: a big, obvious target.
      lineNumbers({
        domEventHandlers: {
          mousedown: (view: EditorView, line: { from: number }) => toggleAt(view, line.from),
        },
      }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) breakpointsCbRef.current(collectBreakpointLines(u.view));
      }),
    ];
  }, []);

  const editorRef = useRef<{ view?: EditorView }>({});
  const refMap = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<
    Array<{ x1: number; y1: number; x2: number; y2: number; active: boolean }>
  >([]);

  const snap = snapshots[idx];
  const prevSnap = idx > 0 ? snapshots[idx - 1] : undefined;

  // Diffing: which locals (per frame) changed, which heap ids are new, which heap items changed.
  const diff = useMemo(() => {
    const changedLocals = new Map<number, Set<string>>(); // frame index -> var names
    const newHeapIds = new Set<string>();
    const changedHeapItems = new Map<string, Set<number>>(); // heap id -> indices
    if (!snap) return { changedLocals, newHeapIds, changedHeapItems };

    snap.frames.forEach((f, fi) => {
      const set = new Set<string>();
      const prevFrame = prevSnap?.frames[fi];
      Object.entries(f.locals).forEach(([k, v]) => {
        const prevV = prevFrame?.locals[k];
        if (!prevV || valueKey(prevV) !== valueKey(v)) set.add(k);
      });
      if (set.size) changedLocals.set(fi, set);
    });

    Object.keys(snap.heap).forEach((id) => {
      if (!prevSnap || !(id in prevSnap.heap)) {
        newHeapIds.add(id);
        return;
      }
      const cur = snap.heap[id];
      const prev = prevSnap.heap[id];
      const items = new Set<number>();
      if (cur.type === "dict" && "items" in cur && prev.type === "dict" && "items" in prev) {
        const len = Math.max(cur.items.length, prev.items.length);
        for (let i = 0; i < len; i++) {
          const a = cur.items[i];
          const b = prev.items[i];
          if (!a || !b) {
            items.add(i);
            continue;
          }
          if (valueKey(a[0]) !== valueKey(b[0]) || valueKey(a[1]) !== valueKey(b[1])) items.add(i);
        }
      } else if ("items" in cur && "items" in prev && cur.type !== "dict" && prev.type !== "dict") {
        const cArr = cur.items as Value[];
        const pArr = prev.items as Value[];
        const len = Math.max(cArr.length, pArr.length);
        for (let i = 0; i < len; i++) {
          const a = cArr[i];
          const b = pArr[i];
          if (!a || !b) {
            items.add(i);
            continue;
          }
          if (valueKey(a) !== valueKey(b)) items.add(i);
        }
      }
      if (items.size) changedHeapItems.set(id, items);
    });

    return { changedLocals, newHeapIds, changedHeapItems };
  }, [snap, prevSnap]);

  // Apply highlight to editor whenever snapshot changes
  useEffect(() => {
    const view = editorRef.current.view;
    if (!view) return;
    view.dispatch({ effects: setHighlight.of(snap ? snap.line : null) });
  }, [snap]);

  const stepBack = useCallback(() => {
    setPrediction(null);
    setIdx((i) => Math.max(0, i - 1));
  }, []);

  const togglePredict = useCallback(() => {
    setPredictMode((m) => {
      const next = !m;
      if (next) {
        lastAskedRef.current = -10; // allow a question on the very next step
        setStatus(
          snapshots.length
            ? "Predict mode on. Step forward (→ or ▶) and commit to a guess before each reveal."
            : "Predict mode on. Run & Trace first, then step forward.",
        );
      } else {
        setPrediction(null);
        setStatus("Predict mode off.");
      }
      return next;
    });
  }, [snapshots.length]);

  // Forward step. In predict mode this may pause on a question instead of advancing.
  const stepForward = useCallback(() => {
    if (!snapshots.length || idx >= snapshots.length - 1) return;
    if (prediction && !prediction.answered) return; // answer or skip first
    if (predictMode && idx + 1 - lastAskedRef.current >= 2) {
      const p = makePrediction(snapshots[idx], snapshots[idx + 1], idx + 1);
      if (p) {
        lastAskedRef.current = idx + 1;
        setPrediction(p);
        setPlaying(false);
        return;
      }
    }
    setPrediction(null);
    setIdx((i) => Math.min(snapshots.length - 1, i + 1));
  }, [snapshots, idx, prediction, predictMode]);

  const answerPrediction = useCallback(
    (choice: string) => {
      if (!prediction || prediction.answered) return;
      const ok = choice === prediction.correct;
      setScore((s) => ({
        correct: s.correct + (ok ? 1 : 0),
        total: s.total + 1,
        streak: ok ? s.streak + 1 : 0,
      }));
      setPrediction({ ...prediction, answered: { choice, ok } });
      setIdx(prediction.targetIdx); // reveal the actual state
    },
    [prediction],
  );

  const skipPrediction = useCallback(() => {
    if (!prediction) return;
    const target = prediction.targetIdx;
    setPrediction(null);
    setIdx(target);
  }, [prediction]);

  // Jump forward to the next snapshot sitting on a breakpointed line.
  const runToBreakpoint = useCallback(() => {
    if (!snapshots.length || !breakpoints.size) return;
    setPrediction(null);
    for (let i = idx + 1; i < snapshots.length; i++) {
      if (breakpoints.has(snapshots[i].line)) {
        setIdx(i);
        return;
      }
    }
    setIdx(snapshots.length - 1);
    setStatus("No more breakpoints ahead. Jumped to the end.");
  }, [snapshots, breakpoints, idx]);

  // Auto-play. Routed through stepForward so predict mode pauses on questions.
  useEffect(() => {
    if (!playing) return;
    if (idx >= snapshots.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => stepForward(), SPEEDS[speedIdx].ms);
    return () => clearTimeout(t);
  }, [playing, idx, snapshots.length, speedIdx, stepForward]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBack();
      } else if (e.key === "Home") {
        e.preventDefault();
        setPrediction(null);
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setPrediction(null);
        setIdx(Math.max(0, snapshots.length - 1));
      } else if (e.key === " ") {
        if (!snapshots.length) return;
        e.preventDefault();
        setPrediction(null);
        setPlaying((p) => !p);
      } else if (e.key === "p" || e.key === "P") {
        togglePredict();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [snapshots.length, stepForward, stepBack, togglePredict]);

  const registerRef = useCallback((key: string, el: HTMLElement | null) => {
    if (el) refMap.current.set(key, el);
    else refMap.current.delete(key);
  }, []);

  // Compute arrows from frame ref-values to heap cards after layout.
  // Coordinates are measured against the inner content box (contentRef), which
  // scrolls together with the SVG overlay, so arrows stay attached while
  // scrolling and never clip below the fold.
  const computeArrows = useCallback(() => {
    if (!snap || !contentRef.current) {
      setArrows([]);
      return;
    }
    const box = contentRef.current.getBoundingClientRect();
    const next: Array<{ x1: number; y1: number; x2: number; y2: number; active: boolean }> = [];

    const addArrow = (fromKey: string, toId: string, active: boolean) => {
      const from = refMap.current.get(fromKey);
      const to = refMap.current.get(`heap:${toId}`);
      if (!from || !to) return;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      next.push({
        x1: a.right - box.left,
        y1: a.top + a.height / 2 - box.top,
        x2: b.left - box.left,
        y2: b.top + b.height / 2 - box.top,
        active,
      });
    };

    snap.frames.forEach((f, fi) => {
      const changed = diff.changedLocals.get(fi);
      Object.entries(f.locals).forEach(([k, v]) => {
        if (v.kind === "ref") addArrow(`var:${fi}:${k}`, v.id, !!changed?.has(k));
      });
    });
    Object.entries(snap.heap).forEach(([id, obj]) => {
      if ("items" in obj && (obj.type === "list" || obj.type === "tuple" || obj.type === "set")) {
        obj.items.forEach((v, i) => {
          if (v.kind === "ref") addArrow(`heap:${id}:${i}`, v.id, false);
        });
      } else if (obj.type === "dict" && "items" in obj) {
        obj.items.forEach(([, v], i) => {
          if (v.kind === "ref") addArrow(`heap:${id}:${i}`, v.id, false);
        });
      }
    });

    setArrows(next);
  }, [snap, diff]);

  useLayoutEffect(() => {
    computeArrows();
  }, [computeArrows]);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => computeArrows());
    ro.observe(contentRef.current);
    window.addEventListener("resize", computeArrows);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", computeArrows);
    };
  }, [computeArrows]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSnapshots([]);
    setIdx(0);
    setPlaying(false);
    setPrediction(null);
    lastAskedRef.current = -10;
    try {
      setStatus("Loading Python runtime…");
      const py = await getPyodide((m) => setStatus(m));
      setStatus("Executing…");
      await py.runPythonAsync(TRACER_PY);
      py.globals.set("__user_src", code);
      const raw: string = await py.runPythonAsync("_run_traced(__user_src)");
      const result = JSON.parse(raw) as TraceResult;
      setSnapshots(result.snapshots);
      setIdx(0);
      setError(result.error);
      setStatus(
        result.error
          ? `Error after ${result.snapshots.length} steps`
          : `Captured ${result.snapshots.length} steps · ← → to scrub, space to play`,
      );
    } catch (e) {
      setError((e as Error).message);
      setStatus("Failed");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const stdout = snap?.stdout ?? "";
  const prevStdout = prevSnap?.stdout ?? "";
  const heapEntries = useMemo(() => (snap ? Object.entries(snap.heap) : []), [snap]);

  // Aliases: for each heap id, collect "frame.var" labels pointing to it (across all frames).
  // Live set: heap ids referenced (directly or transitively) by the top frame.
  const { aliasesById, liveIds } = useMemo(() => {
    const aliases = new Map<string, string[]>();
    const live = new Set<string>();
    if (!snap) return { aliasesById: aliases, liveIds: live };
    snap.frames.forEach((f, fi) => {
      const isTop = fi === snap.frames.length - 1;
      Object.entries(f.locals).forEach(([k, v]) => {
        if (v.kind !== "ref") return;
        const tag = fi === 0 ? k : `${f.name}.${k}`;
        const list = aliases.get(v.id) ?? [];
        list.push(tag);
        aliases.set(v.id, list);
        if (isTop) live.add(v.id);
      });
    });
    // Transitive closure: items referenced from live containers are also live.
    let added = true;
    while (added) {
      added = false;
      live.forEach((id) => {
        const o = snap.heap[id];
        if (!o) return;
        if ("items" in o) {
          o.items.forEach((it) => {
            const v = Array.isArray(it) ? (it[1] as Value) : (it as Value);
            if (v && v.kind === "ref" && !live.has(v.id)) {
              live.add(v.id);
              added = true;
            }
          });
        }
      });
    }
    return { aliasesById: aliases, liveIds: live };
  }, [snap]);

  const narration = useMemo(
    () => (snap ? narrate(snap, prevSnap) : "Press Run to trace your program step by step."),
    [snap, prevSnap],
  );

  // The literal source text of the line being executed, shown with the narration.
  const sourceLine = useMemo(
    () => (snap ? (code.split("\n")[snap.line - 1] ?? "").trim() : ""),
    [snap, code],
  );

  // How many times execution has visited the current line so far. Passing 3
  // through the same line is what makes a loop visible as a loop.
  const visitCount = useMemo(() => {
    if (!snap || snap.event !== "line") return 0;
    let c = 0;
    for (let i = 0; i <= idx; i++) {
      if (snapshots[i].line === snap.line && snapshots[i].event === "line") c++;
    }
    return c;
  }, [snap, idx, snapshots]);

  // Event ribbon content
  const eventBadge = useMemo(() => {
    if (!snap) return null;
    if (snap.event === "call") {
      return {
        icon: <ArrowDownToLine className="size-3" />,
        label: `call ${snap.callName ?? snap.frames.at(-1)?.name ?? ""}()`,
        cls: "bg-violet/15 text-violet border-violet/30",
      };
    }
    if (snap.event === "return") {
      const rv = snap.returnValue ? valueLabel(snap.returnValue) : "None";
      return {
        icon: <ArrowUpFromLine className="size-3" />,
        label: `return ${rv}  from ${snap.frames.at(-1)?.name ?? ""}()`,
        cls: "bg-mint/15 text-mint border-mint/40",
      };
    }
    return {
      icon: null,
      label: `line ${snap.line}`,
      cls: "bg-background text-muted-foreground border-hairline",
    };
  }, [snap]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-3 p-4">
      <style>{`
        @keyframes sb-flash {
          0% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.45); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        @keyframes sb-pop {
          0% { transform: scale(0.94) translateY(3px); opacity: 0.3; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes sb-march {
          to { stroke-dashoffset: -14; }
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run & Trace
        </Button>

        <Select
          value={sampleLabel}
          onValueChange={(label) => {
            const s = SAMPLES.find((x) => x.label === label);
            if (!s) return;
            const current = SAMPLES.find((x) => x.label === sampleLabel);
            const edited = current && code.trim() !== current.code.trim();
            if (edited && !window.confirm("Replace your edited code with this sample?")) return;
            setSampleLabel(label);
            setCode(s.code);
            setSnapshots([]);
            setIdx(0);
            setError(null);
            setPrediction(null);
            lastAskedRef.current = -10;
            setStatus("Sample loaded. Press Run.");
          }}
        >
          <SelectTrigger className="h-8 w-[230px] gap-2 border-hairline bg-surface font-mono text-[11px] text-foreground/80 hover:bg-background">
            <Sparkles className="size-3 text-muted-foreground" />
            <SelectValue placeholder="Load sample…" />
          </SelectTrigger>
          <SelectContent>
            {SAMPLES.map((s) => (
              <SelectItem key={s.label} value={s.label} className="font-mono text-[11px]">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-1 h-5 w-px bg-hairline" />

        <Button
          variant="outline"
          size="sm"
          onClick={stepBack}
          disabled={!snapshots.length || idx === 0}
          title="Step back (←)"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPrediction(null);
            setPlaying((p) => !p);
          }}
          disabled={!snapshots.length}
          title="Play / pause (space)"
        >
          {playing ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={stepForward}
          disabled={
            !snapshots.length ||
            idx >= snapshots.length - 1 ||
            !!(prediction && !prediction.answered)
          }
          title="Step forward (→)"
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={runToBreakpoint}
          disabled={!snapshots.length || !breakpoints.size}
          title="Run to next breakpoint (click a line number to set one)"
        >
          <FastForward className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIdx(0);
            setPlaying(false);
            setPrediction(null);
          }}
          disabled={!snapshots.length}
          title="Back to start"
        >
          <RotateCcw className="size-3.5" />
        </Button>

        <div className="mx-1 h-5 w-px bg-hairline" />

        <Button
          variant={predictMode ? "default" : "outline"}
          size="sm"
          onClick={togglePredict}
          className="gap-1.5"
          title="Predict mode (P): commit to a guess before each reveal"
        >
          <Brain className="size-3.5" />
          Predict
        </Button>
        {predictMode && score.total > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 font-mono text-[11px] text-foreground/80">
            {score.correct}/{score.total}
            {score.streak >= 2 && <span className="text-amber">· streak {score.streak}</span>}
          </span>
        )}

        <select
          aria-label="Playback speed"
          value={speedIdx}
          onChange={(e) => setSpeedIdx(Number(e.target.value))}
          className="h-8 cursor-pointer rounded-md border border-hairline bg-surface px-2 font-mono text-[11px] text-foreground/80 hover:bg-background"
        >
          {SPEEDS.map((s, i) => (
            <option key={s.label} value={i}>
              {s.label}
            </option>
          ))}
        </select>

        <span className="font-mono text-[11px] text-muted-foreground">
          {snapshots.length ? `step ${idx + 1} / ${snapshots.length}` : "no trace yet"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{status}</span>
      </div>

      {/* Scrubber + event ribbon */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, snapshots.length - 1)}
            value={idx}
            disabled={!snapshots.length}
            onChange={(e) => {
              setPrediction(null);
              setIdx(Number(e.target.value));
            }}
            className="relative z-10 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-mint disabled:opacity-40"
          />
          {/* Progress fill plus an event map: violet ticks are calls, mint ticks are returns */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-1.5 -translate-y-1/2 overflow-visible rounded-full bg-hairline/60">
            <div className="h-full overflow-hidden rounded-full">
              <div
                className="h-full bg-mint/60 transition-all"
                style={{
                  width: snapshots.length > 1 ? `${(idx / (snapshots.length - 1)) * 100}%` : "0%",
                }}
              />
            </div>
            {snapshots.length > 1 &&
              snapshots.map((s, i) =>
                s.event === "line" ? null : (
                  <div
                    key={i}
                    className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full"
                    style={{
                      left: `${(i / (snapshots.length - 1)) * 100}%`,
                      background: s.event === "call" ? "var(--violet)" : "var(--mint)",
                      opacity: i <= idx ? 0.95 : 0.4,
                    }}
                  />
                ),
              )}
          </div>
        </div>
        {eventBadge && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] ${eventBadge.cls}`}
          >
            {eventBadge.icon}
            {eventBadge.label}
          </span>
        )}
      </div>

      {/* Plain-English narration of the current step */}
      <div className="rounded-lg border border-hairline bg-surface px-3 py-2">
        <div className="mb-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-mint shadow-[0_0_8px_var(--mint)]" />
          what's happening
          {sourceLine && (
            <code className="ml-auto max-w-[50%] truncate rounded border border-hairline bg-background px-2 py-0.5 font-mono text-[11px] normal-case tracking-normal text-foreground/80">
              {sourceLine}
            </code>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/90">{narration}</p>
      </div>

      {/* Predict mode question card */}
      {prediction && (
        <div
          className={`rounded-lg border px-3 py-2.5 transition ${
            prediction.answered
              ? prediction.answered.ok
                ? "border-mint/50 bg-mint/5"
                : "border-rose/50 bg-rose/5"
              : "border-amber/50 bg-amber/5"
          }`}
        >
          <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Brain className="size-3 text-amber" />
            {prediction.answered ? "prediction result" : "predict before you peek"}
          </div>
          <p className="mb-2 text-[13px] leading-relaxed text-foreground/90">{prediction.prompt}</p>
          <div className="flex flex-wrap items-center gap-2">
            {prediction.options.map((opt) => {
              const answered = prediction.answered;
              const isCorrect = opt === prediction.correct;
              const isChoice = answered?.choice === opt;
              let cls = "border-hairline bg-surface text-foreground/85 hover:bg-background";
              if (answered) {
                if (isCorrect) cls = "border-mint/60 bg-mint/10 text-mint";
                else if (isChoice) cls = "border-rose/60 bg-rose/10 text-rose";
                else cls = "border-hairline bg-surface text-muted-foreground/60";
              }
              return (
                <button
                  key={opt}
                  onClick={() => answerPrediction(opt)}
                  disabled={!!answered}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[12px] transition disabled:cursor-default ${cls}`}
                >
                  {answered && isCorrect && <Check className="size-3" />}
                  {answered && isChoice && !isCorrect && <X className="size-3" />}
                  {opt}
                </button>
              );
            })}
            {!prediction.answered && (
              <button
                onClick={skipPrediction}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground/80"
              >
                <SkipForward className="size-3" />
                skip
              </button>
            )}
            {prediction.answered && (
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {prediction.answered.ok
                  ? "Nailed it. Step on (→)."
                  : "Check the highlighted state to see why, then step on (→)."}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main split */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              main.py
            </span>
            {snap && (
              <span className="font-mono text-[11px] text-mint">
                line {snap.line} · {snap.event}
                {visitCount > 1 && <span className="text-amber"> · pass {visitCount}</span>}
              </span>
            )}
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[#282c34]">
            <CodeMirror
              value={code}
              onChange={(v) => setCode(v)}
              extensions={editorExtensions}
              theme={oneDark}
              basicSetup={{ lineNumbers: false, foldGutter: false }}
              height="100%"
              className="h-full [&>.cm-editor]:h-full [&>.cm-editor]:outline-none"
              onCreateEditor={(view) => {
                editorRef.current.view = view;
              }}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              visualization
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              stack depth {snap?.frames.length ?? 0}
            </span>
          </div>

          <div ref={containerRef} className="relative min-h-0 min-w-0 flex-1 overflow-auto">
            <div ref={contentRef} className="relative">
              {/* SVG arrow overlay: lives inside the content box so it scrolls with it */}
              <svg
                className="pointer-events-none absolute inset-0"
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0 }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill="var(--violet)" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" />
                  </marker>
                </defs>
                {arrows.map((a, i) => {
                  // Smooth bezier — exits source to the right, enters target from the left.
                  const dx = Math.max(40, Math.abs(a.x2 - a.x1) * 0.5);
                  const c1x = a.x1 + dx;
                  const c2x = a.x2 - dx;
                  const d = `M ${a.x1} ${a.y1} C ${c1x} ${a.y1}, ${c2x} ${a.y2}, ${a.x2} ${a.y2}`;
                  return (
                    <path
                      key={i}
                      d={d}
                      fill="none"
                      stroke={a.active ? "var(--amber)" : "var(--violet)"}
                      strokeWidth={a.active ? 1.75 : 1.25}
                      strokeOpacity={a.active ? 0.95 : 0.65}
                      strokeLinecap="round"
                      strokeDasharray={a.active ? "8 6" : undefined}
                      style={a.active ? { animation: "sb-march 0.5s linear infinite" } : undefined}
                      markerEnd={a.active ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    />
                  );
                })}
              </svg>

              <div className="relative grid grid-cols-[1fr_1.1fr] gap-3 p-3">
                {/* Frames */}
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Call Stack
                  </div>
                  {snap?.frames.length ? (
                    snap.frames.map((f, fi) => {
                      const isTop = fi === snap.frames.length - 1;
                      const changed = diff.changedLocals.get(fi);
                      return (
                        <div
                          key={fi}
                          style={{ marginLeft: Math.min(fi, 4) * 10 }}
                          className={`rounded-lg border p-2 transition ${
                            isTop ? "border-mint/50 bg-mint/5" : "border-hairline bg-background"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between font-mono text-[11px]">
                            <span className={isTop ? "text-mint" : "text-foreground/80"}>
                              {f.name}()
                            </span>
                            <span className="text-muted-foreground">line {f.line}</span>
                          </div>
                          {Object.keys(f.locals).length === 0 ? (
                            <div className="font-mono text-[11px] text-muted-foreground/70">
                              (no locals)
                            </div>
                          ) : (
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 font-mono text-[12px]">
                              {Object.entries(f.locals).map(([k, v]) => {
                                const isChanged = changed?.has(k);
                                return (
                                  <div key={isChanged ? `${k}-${idx}` : k} className="contents">
                                    <span
                                      className={isChanged ? "text-amber" : "text-muted-foreground"}
                                    >
                                      {k}
                                    </span>
                                    <span
                                      ref={(el) => registerRef(`var:${fi}:${k}`, el)}
                                      style={
                                        isChanged
                                          ? { animation: "sb-flash 0.6s ease-out" }
                                          : undefined
                                      }
                                      className={`justify-self-start rounded border px-1.5 py-0.5 ${valueClass(v)} ${
                                        isChanged
                                          ? "border-amber/70 bg-amber/10"
                                          : "border-hairline bg-surface"
                                      }`}
                                    >
                                      {valueLabel(v)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="font-mono text-[11px] text-muted-foreground/70">
                      Run the code to see frames.
                    </div>
                  )}

                  {snap?.event === "return" && snap.returnValue && (
                    <div className="rounded-lg border border-mint/40 bg-mint/5 p-2 font-mono text-[12px]">
                      <div className="mb-1 text-[10px] uppercase tracking-wider text-mint">
                        returns
                      </div>
                      <span
                        className={`rounded border border-mint/40 bg-background px-1.5 py-0.5 ${valueClass(snap.returnValue)}`}
                      >
                        {valueLabel(snap.returnValue)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Heap */}
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Heap Objects
                  </div>
                  {heapEntries.length ? (
                    heapEntries.map(([id, obj]) => (
                      <HeapCard
                        key={id}
                        id={id}
                        obj={obj}
                        registerRef={registerRef}
                        isNew={diff.newHeapIds.has(id)}
                        changedItems={diff.changedHeapItems.get(id) ?? new Set()}
                        aliases={aliasesById.get(id) ?? []}
                        live={liveIds.has(id)}
                        stepIdx={idx}
                      />
                    ))
                  ) : (
                    <div className="font-mono text-[11px] text-muted-foreground/70">
                      No mutable objects yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: stdout + error */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface">
          <div className="border-b border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            stdout
          </div>
          <pre className="max-h-40 overflow-auto p-3 font-mono text-[12px] text-foreground/85 whitespace-pre-wrap">
            {stdout ? (
              <>
                {stdout.slice(0, prevStdout.length)}
                <span className="bg-mint/15 text-mint">{stdout.slice(prevStdout.length)}</span>
              </>
            ) : (
              <span className="text-muted-foreground/60">(empty)</span>
            )}
          </pre>
        </div>
        <div className="rounded-xl border border-hairline bg-surface">
          <div className="border-b border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            errors
          </div>
          <pre className="max-h-40 overflow-auto p-3 font-mono text-[12px] text-rose whitespace-pre-wrap">
            {error || <span className="text-muted-foreground/60">(none)</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
