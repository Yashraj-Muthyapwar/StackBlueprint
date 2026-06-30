import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Decoration, EditorView, lineNumbers } from "@codemirror/view";
import { StateField, StateEffect, type Extension } from "@codemirror/state";
import { Play, RotateCcw, ChevronLeft, ChevronRight, Loader2, Square } from "lucide-react";

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
              attributes: { style: "background: rgba(110, 231, 183, 0.18);" },
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

// ---------------- Default snippet ----------------

const DEFAULT_CODE = `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

nums = [1, 2, 3, 4, 5]
results = {}
for x in nums:
    results[x] = factorial(x)

print(results)
`;

// ---------------- Helpers ----------------

function valueLabel(v: Value): string {
  if (v.kind === "prim") return String(v.value);
  return `→ ${v.id.slice(-4)}`;
}

function valueClass(v: Value): string {
  if (v.kind === "ref") return "text-violet";
  if (v.type === "str") return "text-mint";
  if (v.type === "NoneType") return "text-muted-foreground";
  if (v.type === "bool") return "text-amber";
  return "text-amber";
}

// ---------------- Heap rendering ----------------

function HeapCard({
  id,
  obj,
  registerRef,
}: {
  id: string;
  obj: HeapObj;
  registerRef: (key: string, el: HTMLElement | null) => void;
}) {
  const shortId = id.slice(-4);

  if ("items" in obj && (obj.type === "list" || obj.type === "tuple" || obj.type === "set")) {
    const open = obj.type === "tuple" ? "(" : obj.type === "set" ? "{" : "[";
    const close = obj.type === "tuple" ? ")" : obj.type === "set" ? "}" : "]";
    return (
      <div
        ref={(el) => registerRef(`heap:${id}`, el)}
        className="rounded-lg border border-hairline bg-surface p-2 shadow-sm"
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
              className={`rounded border border-hairline bg-background px-1.5 py-0.5 ${valueClass(v)}`}
            >
              {valueLabel(v)}
            </span>
          ))}
          {obj.truncated && <span className="text-muted-foreground">…</span>}
          <span className="text-muted-foreground">{close}</span>
        </div>
      </div>
    );
  }

  if (obj.type === "dict" && "items" in obj) {
    return (
      <div
        ref={(el) => registerRef(`heap:${id}`, el)}
        className="rounded-lg border border-hairline bg-surface p-2 shadow-sm"
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
                className={`justify-self-start rounded border border-hairline bg-background px-1.5 py-0.5 ${valueClass(v)}`}
              >
                {valueLabel(v)}
              </span>
            </div>
          ))}
          {obj.truncated && <div className="col-span-3 text-muted-foreground">…</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(el) => registerRef(`heap:${id}`, el)}
      className="rounded-lg border border-hairline bg-surface p-2 shadow-sm"
    >
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {obj.type} · #{shortId}
      </div>
      <div className="font-mono text-[12px] text-foreground/80">
        {"repr" in obj ? obj.repr : ""}
      </div>
    </div>
  );
}

// ---------------- Main playground ----------------

export function PythonPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [status, setStatus] = useState<string>("Idle. Press Run to start.");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editorRef = useRef<{ view?: EditorView }>({});
  const refMap = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  const snap = snapshots[idx];

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
    const t = setTimeout(() => setIdx((i) => Math.min(snapshots.length - 1, i + 1)), 550);
    return () => clearTimeout(t);
  }, [playing, idx, snapshots.length]);

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
    const next: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    const addArrow = (fromKey: string, toId: string) => {
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
      });
    };

    snap.frames.forEach((f, fi) => {
      Object.entries(f.locals).forEach(([k, v]) => {
        if (v.kind === "ref") addArrow(`var:${fi}:${k}`, v.id);
      });
    });
    Object.entries(snap.heap).forEach(([id, obj]) => {
      if ("items" in obj && (obj.type === "list" || obj.type === "tuple" || obj.type === "set")) {
        obj.items.forEach((v, i) => {
          if (v.kind === "ref") addArrow(`heap:${id}:${i}`, v.id);
        });
      } else if (obj.type === "dict" && "items" in obj) {
        obj.items.forEach(([, v], i) => {
          if (v.kind === "ref") addArrow(`heap:${id}:${i}`, v.id);
        });
      }
    });

    setArrows(next);
  }, [snap]);

  const run = useCallback(async () => {
    setLoading(true);
    setRunning(true);
    setError(null);
    setSnapshots([]);
    setIdx(0);
    setPlaying(false);
    try {
      setStatus("Loading Python runtime…");
      const py = await getPyodide((m) => setStatus(m));
      setStatus("Executing…");
      // Load tracer module
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
          : `Captured ${result.snapshots.length} steps`,
      );
    } catch (e) {
      setError((e as Error).message);
      setStatus("Failed");
    } finally {
      setLoading(false);
      setRunning(false);
    }
  }, [code]);

  const step = useCallback(
    (n: number) => setIdx((i) => Math.max(0, Math.min(snapshots.length - 1, i + n))),
    [snapshots.length],
  );

  const stdout = snap?.stdout ?? "";
  const heapEntries = useMemo(() => (snap ? Object.entries(snap.heap) : []), [snap]);

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col gap-3 p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} disabled={loading} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run & Trace
        </Button>
        <div className="mx-2 h-5 w-px bg-hairline" />
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
        <span className="font-mono text-[11px] text-muted-foreground">
          {snapshots.length ? `step ${idx + 1} / ${snapshots.length}` : "no trace yet"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">{status}</span>
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
              </defs>
              {arrows.map((a, i) => {
                const dx = a.x2 - a.x1;
                const cx1 = a.x1 + Math.max(30, dx * 0.4);
                const cx2 = a.x2 - Math.max(30, dx * 0.4);
                return (
                  <path
                    key={i}
                    d={`M ${a.x1} ${a.y1} C ${cx1} ${a.y1} ${cx2} ${a.y2} ${a.x2} ${a.y2}`}
                    fill="none"
                    stroke="var(--violet)"
                    strokeWidth="1.4"
                    strokeOpacity="0.7"
                    markerEnd="url(#arrowhead)"
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
                    return (
                      <div
                        key={fi}
                        className={`rounded-lg border p-2 ${
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
                            {Object.entries(f.locals).map(([k, v]) => (
                              <div key={k} className="contents">
                                <span className="text-muted-foreground">{k}</span>
                                <span
                                  ref={(el) => registerRef(`var:${fi}:${k}`, el)}
                                  className={`justify-self-start rounded border border-hairline bg-surface px-1.5 py-0.5 ${valueClass(v)}`}
                                >
                                  {valueLabel(v)}
                                </span>
                              </div>
                            ))}
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
              </div>

              {/* Heap */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Heap Objects
                </div>
                {heapEntries.length ? (
                  heapEntries.map(([id, obj]) => (
                    <HeapCard key={id} id={id} obj={obj} registerRef={registerRef} />
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

      {running && null}
    </div>
  );
}
