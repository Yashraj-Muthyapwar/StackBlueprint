import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Decoration, EditorView, lineNumbers } from "@codemirror/view";
import { StateField, StateEffect, type Extension } from "@codemirror/state";
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
} from "lucide-react";

import { getPyodide } from "@/lib/pyodide-loader";
import { TRACER_PY } from "@/lib/python-tracer";
import { Button } from "@/components/ui/button";

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

const editorExtensions: Extension[] = [
  python(),
  oneDark,
  lineNumbers(),
  highlightField,
  EditorView.theme({
    "&": { height: "100%", fontSize: "13px" },
    ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, monospace" },
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
  if (v.kind === "ref") return "text-violet";
  if (v.type === "str") return "text-mint";
  if (v.type === "NoneType") return "text-muted-foreground";
  if (v.type === "bool") return "text-amber";
  return "text-amber";
}

function valueKey(v: Value): string {
  return v.kind === "prim" ? `p:${v.type}:${v.value}` : `r:${v.id}`;
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
    else if (valueKey(pv) !== valueKey(v))
      changes.push(`${k} → ${valuePlain(v, snap.heap)}`);
  });
  if (!changes.length) return `Running line ${snap.line} in ${top.name}.`;
  return `Line ${snap.line}: ${changes.join(", ")}.`;
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
}: {
  id: string;
  obj: HeapObj;
  registerRef: (key: string, el: HTMLElement | null) => void;
  isNew: boolean;
  changedItems: Set<number>;
  aliases: string[];
  live: boolean;
}) {
  const shortId = id.slice(-4);
  const ringClass = isNew
    ? "ring-2 ring-mint/60"
    : live
      ? "ring-2 ring-violet/50"
      : "";
  const aliasBar =
    aliases.length > 0 ? (
      <div className="mt-1.5 flex flex-wrap items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
        <span>↩</span>
        {aliases.map((a) => (
          <span key={a} className="text-foreground/70">
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
        className={`rounded-lg border border-hairline bg-surface p-2 shadow-sm transition ${ringClass}`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{obj.type}</span>
          <span>#{shortId} · len={obj.size}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1 font-mono text-[12px]">
          <span className="text-muted-foreground">{open}</span>
          {obj.items.map((v, i) => (
            <span
              key={i}
              ref={(el) => registerRef(`heap:${id}:${i}`, el)}
              className={`rounded border px-1.5 py-0.5 ${valueClass(v)} ${
                changedItems.has(i)
                  ? "border-amber/70 bg-amber/10"
                  : "border-hairline bg-background"
              }`}
            >
              {valueLabel(v)}
            </span>
          ))}
          {obj.truncated && <span className="text-muted-foreground">…</span>}
          <span className="text-muted-foreground">{close}</span>
        </div>
        {aliasBar}
      </div>
    );
  }

  if (obj.type === "dict" && "items" in obj) {
    return (
      <div
        ref={(el) => registerRef(`heap:${id}`, el)}
        className={`rounded-lg border border-hairline bg-surface p-2 shadow-sm transition ${ringClass}`}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>dict</span>
          <span>#{shortId} · len={obj.size}</span>
        </div>
        <div className="grid grid-cols-[auto_auto_1fr] items-center gap-x-2 gap-y-1 font-mono text-[12px]">
          {obj.items.map(([k, v], i) => (
            <div key={i} className="contents">
              <span className={valueClass(k)}>{valueLabel(k)}</span>
              <span className="text-muted-foreground">→</span>
              <span
                ref={(el) => registerRef(`heap:${id}:${i}`, el)}
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
  const [code, setCode] = useState(SAMPLES[0].code);
  const [status, setStatus] = useState<string>("Idle. Press Run to start.");
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef<{ view?: EditorView }>({});
  const refMap = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
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
      if ("items" in cur && "items" in prev) {
        const cArr = cur.items as unknown as Value[];
        const pArr = prev.items as unknown as Value[];
        const len = Math.max(cArr.length, pArr.length);
        for (let i = 0; i < len; i++) {
          const a = cArr[i];
          const b = pArr[i];
          if (!a || !b) {
            items.add(i);
            continue;
          }
          // dict items are tuples; treat as pair
          if (Array.isArray(a) && Array.isArray(b)) {
            if (valueKey(a[1] as Value) !== valueKey(b[1] as Value)) items.add(i);
          } else {
            if (valueKey(a as Value) !== valueKey(b as Value)) items.add(i);
          }
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

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    if (idx >= snapshots.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(
      () => setIdx((i) => Math.min(snapshots.length - 1, i + 1)),
      SPEEDS[speedIdx].ms,
    );
    return () => clearTimeout(t);
  }, [playing, idx, snapshots.length, speedIdx]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable)
        return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIdx((i) => Math.min(snapshots.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === " ") {
        if (!snapshots.length) return;
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [snapshots.length]);

  const registerRef = useCallback((key: string, el: HTMLElement | null) => {
    if (el) refMap.current.set(key, el);
    else refMap.current.delete(key);
  }, []);

  // Compute arrows from frame ref-values to heap cards after layout.
  useLayoutEffect(() => {
    if (!snap || !containerRef.current) {
      setArrows([]);
      return;
    }
    const box = containerRef.current.getBoundingClientRect();
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

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSnapshots([]);
    setIdx(0);
    setPlaying(false);
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

  const step = useCallback(
    (n: number) => setIdx((i) => Math.max(0, Math.min(snapshots.length - 1, i + n))),
    [snapshots.length],
  );

  const stdout = snap?.stdout ?? "";
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

  // Per-step event colors for the timeline.
  const stepColors = useMemo(
    () =>
      snapshots.map((s) =>
        s.event === "call"
          ? "var(--violet)"
          : s.event === "return"
            ? "var(--mint)"
            : "var(--hairline)",
      ),
    [snapshots],
  );

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
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run & Trace
        </Button>

        <div className="relative">
          <select
            aria-label="Load sample"
            className="h-8 cursor-pointer appearance-none rounded-md border border-hairline bg-surface px-2 pr-7 font-mono text-[11px] text-foreground/80 hover:bg-background"
            onChange={(e) => {
              const s = SAMPLES.find((x) => x.label === e.target.value);
              if (s) {
                setCode(s.code);
                setSnapshots([]);
                setIdx(0);
                setError(null);
                setStatus("Sample loaded. Press Run.");
              }
              e.currentTarget.selectedIndex = 0;
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Load sample…
            </option>
            {SAMPLES.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
          <Sparkles className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="mx-1 h-5 w-px bg-hairline" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => step(-1)}
          disabled={!snapshots.length || idx === 0}
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          disabled={!snapshots.length}
        >
          {playing ? <Square className="size-3.5" /> : <Play className="size-3.5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => step(1)}
          disabled={!snapshots.length || idx >= snapshots.length - 1}
        >
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIdx(0);
            setPlaying(false);
          }}
          disabled={!snapshots.length}
        >
          <RotateCcw className="size-3.5" />
        </Button>

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
            onChange={(e) => setIdx(Number(e.target.value))}
            className="relative z-10 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-mint disabled:opacity-40"
          />
          {/* Colored event ticks underneath the slider */}
          {snapshots.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-hairline/60">
              {stepColors.map((c, i) => (
                <div
                  key={i}
                  style={{ background: c, opacity: i <= idx ? 0.9 : 0.35 }}
                  className="h-full flex-1"
                />
              ))}
            </div>
          )}
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
        </div>
        <p className="text-[13px] leading-relaxed text-foreground/90">{narration}</p>
      </div>

      {/* Main split */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              main.py
            </span>
            {snap && (
              <span className="font-mono text-[11px] text-mint">
                line {snap.line} · {snap.event}
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <CodeMirror
              value={code}
              onChange={(v) => setCode(v)}
              extensions={editorExtensions}
              theme={oneDark}
              basicSetup={{ lineNumbers: false, foldGutter: false }}
              height="100%"
              onCreateEditor={(view) => {
                editorRef.current.view = view;
              }}
            />
          </div>
        </div>

        {/* Visualization */}
        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              visualization
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              stack depth {snap?.frames.length ?? 0}
            </span>
          </div>

          <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto">
            {/* SVG arrow overlay */}
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
                // Orthogonal "step" routing — like Python Tutor.
                // Source: exit horizontally to the right.
                // Target: enter horizontally from the left.
                const exit = a.x1 + 14;
                const entry = a.x2 - 10;
                let d: string;
                if (entry > exit + 4) {
                  // Target is to the right of source — simple H/V/H step.
                  const midX = (exit + entry) / 2;
                  d = `M ${a.x1} ${a.y1} H ${midX} V ${a.y2} H ${a.x2}`;
                } else {
                  // Target is left of / overlapping source — loop out to the right margin
                  // then back to target's left edge. Avoids cutting through cards.
                  const loopX = Math.max(a.x1, a.x2) + 28;
                  d = `M ${a.x1} ${a.y1} H ${loopX} V ${a.y2} H ${a.x2}`;
                }
                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke={a.active ? "var(--amber)" : "var(--violet)"}
                    strokeWidth={a.active ? 1.75 : 1.25}
                    strokeOpacity={a.active ? 0.95 : 0.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                                <div key={k} className="contents">
                                  <span
                                    className={
                                      isChanged ? "text-amber" : "text-muted-foreground"
                                    }
                                  >
                                    {k}
                                  </span>
                                  <span
                                    ref={(el) => registerRef(`var:${fi}:${k}`, el)}
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
                    <span className={`rounded border border-mint/40 bg-background px-1.5 py-0.5 ${valueClass(snap.returnValue)}`}>
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

      {/* Bottom: stdout + error */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface">
          <div className="border-b border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            stdout
          </div>
          <pre className="max-h-40 overflow-auto p-3 font-mono text-[12px] text-foreground/85 whitespace-pre-wrap">
            {stdout || <span className="text-muted-foreground/60">(empty)</span>}
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
