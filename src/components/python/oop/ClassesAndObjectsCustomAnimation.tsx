import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Gauge,
  Layers,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import { CarSVG } from "./CarSVG";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "val" | "fn" | "ret" | "ref" | "cls";

// A value that flies between anchors: code markers, global rows, heap cards
// ("obj_<id>"), attribute rows, method chips ("cls_<name>") or the console
// line being written ("cons", "cons1").
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = { id: string; name: string; value: string; kind: Kind };
type Method = { id: string; name: string };
// An object (or the class itself) living on the heap.
type Heap = { id: string; title: string; blueprint?: boolean; methods?: Method[]; attrs: Row[] };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n class or function name   v name being assigned   u value being read
 *   p parameter   s self       a argument   c call target   k separator
 *   e closing paren   g printed value   q literal (highlighted as code)
 */
type Step = {
  label: string;
  note: string;
  active: number[];
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  globals?: Row[]; // names added to (or updated in) global memory
  heaps?: Heap[]; // heap cards added or updated (attrs and methods merge by id)
  out?: string[];
  hot?: string[];
  ul?: string[];
};

type Slide = {
  eyebrow: string;
  title: string;
  lines: string[];
  globals?: Row[]; // memory that already exists when the slide starts
  heaps?: Heap[];
  steps: Step[];
};

type View = {
  swaps: Record<string, Swap>;
  globals: Row[];
  heaps: Heap[];
  out: string[];
};

type Timed = Flt & { delay: number };
type Reg = (id: string) => (el: HTMLElement | null) => void;
type Flight = Timed & { x0: number; y0: number; x1: number; y1: number };
type Ctx = { step: Step; view: View; prev?: View; reg: Reg; reduce: boolean; timed: Timed[] };

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

const FLY = 0.85;
const CHIP_H = 20;

const startAt = (n: number) => 0.2 + n * 0.14;

const timedOf = (s: Step): Timed[] =>
  (s.flights ?? []).map((f, i) => ({ ...f, delay: f.at ?? startAt(i) }));

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay)) + FLY - 0.08 : fallback;
};

const stepMs = (s: Step) => {
  const last = Math.max(0, ...timedOf(s).map((f) => f.delay));
  return Math.max(2600, (last + FLY) * 1000 + 1500);
};

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const R = (id: string, name: string, value: string, kind: Kind = "val"): Row => ({ id, name, value, kind });
const M = (name: string): Method => ({ id: `cls_${name}`, name });
const O1 = (attrs: Row[]): Heap => ({ id: "o1", title: "Car #1", attrs });
const O2 = (attrs: Row[]): Heap => ({ id: "o2", title: "Car #2", attrs });
const CLASS = (methods: Method[]): Heap => ({ id: "cls", title: "class Car", blueprint: true, methods, attrs: [] });

const G_CAR = R("m_Car", "Car", "<class Car>", "cls");
const G_CAR1 = R("m_car1", "car1", "<Car #1>", "ref");
const G_CAR2 = R("m_car2", "car2", "<Car #2>", "ref");

const slides: Slide[] = [
  /* 2 Class and objects ---------------------------------------------------- */
  {
    eyebrow: "Class and objects",
    title: "A class is a blueprint, and each call builds an object",
    lines: [
      "class ⟦n:Car⟧:",
      "    def __init__(⟦s:self⟧, ⟦p0:brand⟧, ⟦p1:speed⟧):",
      "        self.brand = ⟦u0:brand⟧",
      "        self.speed = ⟦u1:speed⟧",
      "",
      '⟦v1:car1⟧ = ⟦c1:Car(⟧⟦a0:"Toyota"⟧⟦k0:, ⟧⟦a1:120⟧⟦e1:)⟧',
      '⟦v2:car2⟧ = ⟦c2:Car(⟧⟦a2:"Ford"⟧⟦k2:, ⟧⟦a3:140⟧⟦e2:)⟧',
      "print(⟦g0:car1.brand⟧)",
      "print(⟦g1:car2.brand⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3],
        ul: ["n"],
        flights: [
          { from: "n", to: "m_Car", text: "<class Car>", kind: "cls" },
          { from: "n", to: "obj_cls", text: "class Car", kind: "cls", at: 0.34 },
        ],
        globals: [G_CAR],
        heaps: [CLASS([M("__init__")])],
        note: "The class statement runs and creates a class object named Car. It stores __init__ as a method, but no car exists yet: a blueprint holds no data.",
      },
      {
        label: "Call Car()",
        active: [5],
        hot: ["a0", "a1"],
        flights: [{ from: "c1", to: "obj_o1", text: "new object", kind: "ref" }],
        heaps: [O1([])],
        note: "Calling the class builds a new, empty object and then runs __init__ on it.",
      },
      {
        label: "Bind",
        active: [1],
        hot: ["a0", "a1"],
        flights: [
          { from: "obj_o1", to: "s", text: "<Car #1>", kind: "ref", at: 0.2 },
          { from: "a0", to: "p0", text: '"Toyota"', kind: "val", at: 0.34 },
          { from: "a1", to: "p1", text: "120", kind: "val", at: 0.48 },
        ],
        swap: {
          s: { text: "<Car #1>", kind: "ref", cap: "self" },
          p0: { text: '"Toyota"', kind: "val", cap: "brand" },
          p1: { text: "120", kind: "val", cap: "speed" },
        },
        note: "Python passes the new object in as self, and copies the two arguments into brand and speed.",
      },
      {
        label: "Store",
        active: [2, 3],
        flights: [
          { from: "p0", to: "u0", text: '"Toyota"', kind: "val", at: 0.2 },
          { from: "p1", to: "u1", text: "120", kind: "val", at: 0.34 },
          { from: "u0", to: "o1_brand", text: '"Toyota"', kind: "val", at: 1.2 },
          { from: "u1", to: "o1_speed", text: "120", kind: "val", at: 1.34 },
        ],
        swap: { u0: { text: '"Toyota"', kind: "val" }, u1: { text: "120", kind: "val" } },
        heaps: [O1([R("o1_brand", "brand", '"Toyota"'), R("o1_speed", "speed", "120")])],
        note: "self.brand = brand creates an attribute on the object itself. The data lives inside the object, not in the class.",
      },
      {
        label: "Assign",
        active: [5],
        drop: ["s", "p0", "p1", "u0", "u1"],
        flights: [{ from: "obj_o1", to: "m_car1", text: "<Car #1>", kind: "ref" }],
        globals: [G_CAR1],
        note: "__init__ is finished. The new object is the result of Car(...), so the name car1 now refers to it.",
      },
      {
        label: "Second car",
        active: [6],
        hot: ["a2", "a3"],
        flights: [
          { from: "c2", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "a2", to: "o2_brand", text: '"Ford"', kind: "val", at: 1.0 },
          { from: "a3", to: "o2_speed", text: "140", kind: "val", at: 1.14 },
          { from: "obj_o2", to: "m_car2", text: "<Car #2>", kind: "ref", at: 2.0 },
        ],
        heaps: [O2([R("o2_brand", "brand", '"Ford"'), R("o2_speed", "speed", "140")])],
        globals: [G_CAR2],
        note: "The same steps run again and build a second object. It follows the same blueprint, but it holds its own values.",
      },
      {
        label: "Read",
        active: [7, 8],
        flights: [
          { from: "o1_brand", to: "g0", text: '"Toyota"', kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "Toyota", kind: "ret", at: 1.1 },
          { from: "o2_brand", to: "g1", text: '"Ford"', kind: "val", at: 1.6 },
          { from: "g1", to: "cons1", text: "Ford", kind: "ret", at: 2.5 },
        ],
        swap: { g0: { text: '"Toyota"', kind: "val" }, g1: { text: '"Ford"', kind: "val" } },
        out: ["Toyota", "Ford"],
        note: "car1.brand and car2.brand follow each name to its own object and read its own attribute.",
      },
    ],
  },
  /* 3 Methods and self ----------------------------------------------------- */
  {
    eyebrow: "Methods and self",
    title: "A method acts on the object it is called on",
    lines: [
      "class Car:",
      "    def __init__(self, brand):",
      "        self.brand = brand",
      "",
      "    def drive(⟦s:self⟧):",
      '        print(f"{⟦u:self.brand⟧} is driving.")',
      "",
      'car1 = Car("Toyota")',
      'car2 = Car("Ford")',
      "⟦c1:car1.drive⟧()",
      "⟦c2:car2.drive⟧()",
    ],
    globals: [G_CAR, G_CAR1, G_CAR2],
    heaps: [
      CLASS([M("__init__"), M("drive")]),
      O1([R("o1_brand", "brand", '"Toyota"')]),
      O2([R("o2_brand", "brand", '"Ford"')]),
    ],
    steps: [
      {
        label: "Call",
        active: [9],
        hot: ["c1"],
        flights: [{ from: "m_car1", to: "cls_drive", text: "car1.drive", kind: "ref", at: 0.2 }],
        note: "car1.drive is looked up on the object first. The object has no drive, so Python finds the method on its class.",
      },
      {
        label: "self",
        active: [4],
        flights: [{ from: "obj_o1", to: "s", text: "car1", kind: "ref", at: 0.2 }],
        swap: { s: { text: "car1", kind: "ref", cap: "self" } },
        note: "Python passes the object before the dot into self automatically. That is why you call drive() with no argument but define drive(self).",
      },
      {
        label: "Print",
        active: [5],
        flights: [
          { from: "o1_brand", to: "u", text: '"Toyota"', kind: "val", at: 0.2 },
          { from: "u", to: "cons", text: "Toyota is driving.", kind: "ret", at: 1.2 },
        ],
        swap: { u: { text: '"Toyota"', kind: "val" } },
        out: ["Toyota is driving."],
        note: "self.brand reads the brand attribute of the object self refers to: Toyota.",
      },
      {
        label: "Call car2",
        active: [10, 4],
        hot: ["c2"],
        drop: ["s", "u"],
        flights: [
          { from: "m_car2", to: "cls_drive", text: "car2.drive", kind: "ref", at: 0.2 },
          { from: "obj_o2", to: "s", text: "car2", kind: "ref", at: 1.0 },
        ],
        swap: { s: { text: "car2", kind: "ref", cap: "self" } },
        note: "The same method runs again, but now self is car2, because car2 is the name before the dot.",
      },
      {
        label: "Print",
        active: [5],
        flights: [
          { from: "o2_brand", to: "u", text: '"Ford"', kind: "val", at: 0.2 },
          { from: "u", to: "cons", text: "Ford is driving.", kind: "ret", at: 1.2 },
        ],
        swap: { u: { text: '"Ford"', kind: "val" } },
        out: ["Ford is driving."],
        note: "One method, two objects, two different results: each call uses the data of its own object.",
      },
    ],
  },
  /* 4 Independent state ---------------------------------------------------- */
  {
    eyebrow: "Independent state",
    title: "Changing one object leaves the others alone",
    lines: [
      'car1 = Car("Toyota", 120)',
      'car2 = Car("Ford", 140)',
      "",
      "⟦v:car1.speed⟧ = ⟦q:150⟧",
      "print(⟦g0:car1.speed⟧)",
      "print(⟦g1:car2.speed⟧)",
    ],
    globals: [G_CAR, G_CAR1, G_CAR2],
    heaps: [
      CLASS([M("__init__"), M("drive")]),
      O1([R("o1_brand", "brand", '"Toyota"'), R("o1_speed", "speed", "120")]),
      O2([R("o2_brand", "brand", '"Ford"'), R("o2_speed", "speed", "140")]),
    ],
    steps: [
      {
        label: "Update",
        active: [3],
        flights: [{ from: "q", to: "o1_speed", text: "150", kind: "val", at: 0.3 }],
        heaps: [O1([R("o1_speed", "speed", "150")])],
        note: "Assigning to car1.speed changes the attribute stored on that one object. Nothing else is touched.",
      },
      {
        label: "Read",
        active: [4, 5],
        flights: [
          { from: "o1_speed", to: "g0", text: "150", kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "150", kind: "ret", at: 1.1 },
          { from: "o2_speed", to: "g1", text: "140", kind: "val", at: 1.6 },
          { from: "g1", to: "cons1", text: "140", kind: "ret", at: 2.5 },
        ],
        swap: { g0: { text: "150", kind: "val" }, g1: { text: "140", kind: "val" } },
        out: ["150", "140"],
        note: "car2 still holds 140. Objects built from the same class keep their own state.",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(slide: Slide): View[] {
  let swaps: Record<string, Swap> = {};
  let globals: Row[] = slide.globals ?? [];
  let heaps: Heap[] = slide.heaps ?? [];
  let out: string[] = [];
  return slide.steps.map((st) => {
    swaps = { ...swaps };
    st.drop?.forEach((k) => delete swaps[k]);
    swaps = { ...swaps, ...st.swap };
    out = [...out, ...(st.out ?? [])];
    for (const row of st.globals ?? []) {
      globals = globals.some((r) => r.id === row.id)
        ? globals.map((r) => (r.id === row.id ? row : r))
        : [...globals, row];
    }
    for (const h of st.heaps ?? []) {
      const i = heaps.findIndex((x) => x.id === h.id);
      if (i < 0) {
        heaps = [...heaps, h];
        continue;
      }
      heaps = heaps.map((x, k) => {
        if (k !== i) return x;
        let attrs = [...x.attrs];
        for (const a of h.attrs) {
          attrs = attrs.some((r) => r.id === a.id) ? attrs.map((r) => (r.id === a.id ? a : r)) : [...attrs, a];
        }
        const methods = [...(x.methods ?? [])];
        for (const m of h.methods ?? []) if (!methods.some((q) => q.id === m.id)) methods.push(m);
        return { ...x, attrs, methods };
      });
    }
    return { swaps, globals, heaps, out };
  });
}

const findRow = (v: View | undefined, id: string): Row | undefined =>
  v?.globals.find((r) => r.id === id) ?? v?.heaps.flatMap((h) => h.attrs).find((r) => r.id === id);

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const chipBase =
  "inline-flex h-5 items-center whitespace-pre rounded-md border px-1.5 font-mono text-[11px] leading-none";

const chipClass: Record<Kind, string> = {
  val: "border-mint/40 bg-mint/15 text-mint",
  fn: "border-violet/40 bg-violet/15 text-violet",
  ret: "border-white/30 bg-white/10 text-white",
  ref: "border-sky-400/40 bg-sky-400/15 text-sky-300",
  cls: "border-amber/40 bg-amber/15 text-amber",
};

const COLOR: Record<string, string> = {
  n: "text-sky-300",
  c: "text-sky-200",
  e: "text-sky-200",
  k: "text-slate-400",
  a: "text-orange-300",
  v: "text-cyan-200",
  u: "text-cyan-200",
  p: "text-cyan-200",
  s: "text-cyan-200",
  g: "text-cyan-200",
};
// Markers whose text is tokenized like ordinary code.
const CODE_ROLES = new Set(["q"]);

const controlBtn =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

/* -------------------------------------------------------------------------- */
/* Parsing and highlighting                                                    */
/* -------------------------------------------------------------------------- */

type Seg = { id?: string; text: string };
const MARK = /⟦(\w+):([^⟧]*)⟧/g;

function parse(line: string): Seg[] {
  const out: Seg[] = [];
  let last = 0;
  for (const m of line.matchAll(MARK)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: line.slice(last, at) });
    out.push({ id: m[1], text: m[2] });
    last = at + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

const KEYWORDS = new Set(["def", "class", "return"]);
const BUILTIN_NAMES = new Set(["print"]);

function tokenize(text: string, state: { inStr: boolean }): ReactNode[] {
  const parts = text.match(/"|\s+|[A-Za-z_]\w*|\d+(?:\.\d+)?|./g) ?? [];
  return parts.map((tok, i) => {
    let cls = "text-slate-200";
    if (tok === '"') {
      state.inStr = !state.inStr;
      cls = "text-amber-200";
    } else if (state.inStr) cls = "text-amber-200";
    else if (KEYWORDS.has(tok)) cls = "text-fuchsia-300";
    else if (BUILTIN_NAMES.has(tok)) cls = "text-sky-300";
    else if (/^\d/.test(tok)) cls = "text-orange-300";
    else if (/^[^\w\s]$/.test(tok)) cls = "text-slate-400";
    return (
      <span key={i} className={cls}>
        {tok}
      </span>
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Code editor                                                                 */
/* -------------------------------------------------------------------------- */

// A value chip that replaces a name in the code. The parameter name is written
// above the chip instead of inside it, so a long def line stays short enough to fit.
function Slot({
  id,
  reg,
  text,
  kind,
  cap,
  fly,
  land,
}: {
  id: string;
  reg: Reg;
  text: string;
  kind: Kind;
  cap?: string;
  fly: boolean;
  land: number;
}) {
  const delay = fly ? land : 0;
  return (
    <span ref={reg(id)} className="relative inline-flex align-middle">
      {cap && (
        <motion.span
          initial={fly ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -top-[11px] left-0 whitespace-pre font-mono text-[9px] leading-none tracking-wider text-slate-400"
        >
          {cap}
        </motion.span>
      )}
      <motion.span
        initial={fly ? { opacity: 0 } : false}
        animate={fly ? { opacity: 1, scale: [1.25, 1] } : { opacity: 1 }}
        transition={{ delay, duration: 0.25 }}
        className={`${chipBase} ${chipClass[kind]}`}
      >
        {text}
      </motion.span>
      {fly && (
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay, duration: 0.15 }}
          className="pointer-events-none absolute inset-0 rounded-md border border-dashed border-white/30"
        />
      )}
    </span>
  );
}

function renderSegments(line: string, ctx: Ctx): ReactNode[] {
  const { step, view, prev, reg, reduce, timed } = ctx;
  const state = { inStr: false };
  return parse(line).map((seg, k) => {
    const id = seg.id;
    if (!id) return <span key={k}>{tokenize(seg.text, state)}</span>;

    const sw = view.swaps[id];
    if (sw) {
      return (
        <Slot
          key={`${id}:${sw.text}`}
          id={id}
          reg={reg}
          text={sw.text}
          kind={sw.kind}
          cap={sw.cap}
          fly={!reduce && prev?.swaps[id]?.text !== sw.text}
          land={landOf(timed, id)}
        />
      );
    }

    const role = id[0];
    const underline = step.ul?.includes(id)
      ? "underline decoration-dashed decoration-cyan-300/60 underline-offset-4"
      : "";
    if (CODE_ROLES.has(role)) {
      return (
        <span key={id} ref={reg(id)} className={underline}>
          {tokenize(seg.text, state)}
        </span>
      );
    }
    const hot = !!step.hot?.includes(id);
    return (
      <motion.span
        key={id}
        ref={reg(id)}
        animate={hot && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className={`relative -mx-[5px] inline-block rounded-md border px-1 transition-[background-color,border-color] duration-500 ${hot ? chipClass.val : `border-transparent ${COLOR[role] ?? "text-slate-200"}`
          } ${underline}`}
      >
        {seg.text}
      </motion.span>
    );
  });
}

function CodeLine({ line, index, ctx }: { line: string; index: number; ctx: Ctx }) {
  const isActive = ctx.step.active.includes(index);
  const gutter = (
    <span className="mr-3 w-3 select-none text-right text-[10px] text-slate-600">{index + 1}</span>
  );
  if (line === "") return <div className="flex h-3 items-center px-1.5">{gutter}</div>;
  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isActive ? "rgba(64,224,180,0.10)" : "rgba(64,224,180,0)" }}
      transition={{ duration: 0.3 }}
      className="relative flex h-6 items-center rounded px-1.5"
    >
      <motion.span
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-y-1 left-0 w-0.5 rounded bg-mint"
      />
      {gutter}
      <span className="whitespace-pre">{renderSegments(line, ctx)}</span>
    </motion.div>
  );
}

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-[9px] tracking-[0.16em] text-slate-300">
      {children}
    </div>
  );
}

function CodeEditor({ lines, ctx }: { lines: string[]; ctx: Ctx }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg">
      <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-3 py-1.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className="overflow-x-auto p-2 font-mono text-[12px] text-slate-100">
        <div className="min-w-max">
          {lines.map((line, i) => (
            <CodeLine key={i} line={line} index={i} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Memory                                                                      */
/* -------------------------------------------------------------------------- */

const rowBox =
  "flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-white/10 bg-slate-900 px-2 py-0.5 font-mono text-[11px]";

function RowView({ row, ctx }: { row: Row; ctx: Ctx }) {
  const { prev, reg, reduce, timed } = ctx;
  const before = findRow(prev, row.id);
  const isNew = !reduce && !before;
  const land = landOf(timed, row.id);
  const changed = !reduce && !!before && before.value !== row.value;
  return (
    <motion.div
      initial={isNew ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: isNew ? land : 0, duration: 0.2 }}
      className={rowBox}
    >
      <span className={row.kind === "fn" ? "text-sky-300" : row.kind === "cls" ? "text-amber" : "text-cyan-200"}>
        {row.name}
      </span>
      <span className="text-slate-500">=</span>
      <motion.span
        key={row.value}
        ref={reg(row.id)}
        initial={changed ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: changed ? land : 0, duration: 0.2 }}
        className={`${chipBase} ${chipClass[row.kind]}`}
      >
        {row.value}
      </motion.span>
    </motion.div>
  );
}

// Matches the colors of the illustrated scene: car1 amber, car2 green, class blue.
const HEAP_LOOK: Record<string, { box: string; chip: Kind; car: string }> = {
  cls: { box: "border-dashed border-sky-400/50 bg-sky-400/5", chip: "ref", car: "#3b82f6" },
  o1: { box: "border-amber/30 bg-amber/5", chip: "cls", car: "#fbbf24" },
  o2: { box: "border-mint/30 bg-mint/5", chip: "val", car: "#34d399" },
};

function HeapCard({ heap, ctx, span }: { heap: Heap; ctx: Ctx; span: number }) {
  const { prev, reg, reduce, timed } = ctx;
  const before = prev?.heaps.find((h) => h.id === heap.id);
  const fresh = !reduce && !before;
  const look = HEAP_LOOK[heap.id] ?? HEAP_LOOK.o2;
  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: fresh ? landOf(timed, `obj_${heap.id}`) : 0, duration: 0.3 }}
      style={heap.blueprint ? { gridColumn: `span ${span}` } : undefined}
      className={`min-w-0 rounded-lg border p-2 ${look.box}`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span ref={reg(`obj_${heap.id}`)} className={`${chipBase} shrink-0 ${chipClass[look.chip]}`}>
          {heap.title}
        </span>
        {heap.blueprint && (
          <span className="truncate font-mono text-[9px] tracking-wider text-slate-500">blueprint, no data</span>
        )}
        <CarSVG className={`ml-auto h-auto w-8 shrink-0 ${heap.blueprint ? "opacity-40" : ""}`} color={look.car} />
      </div>
      {heap.methods && heap.methods.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {heap.methods.map((m) => {
            const isNew = !reduce && !before?.methods?.some((q) => q.id === m.id);
            return (
              <motion.span
                key={m.id}
                ref={reg(m.id)}
                initial={isNew ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isNew ? landOf(timed, m.id, 0.4) : 0, duration: 0.25 }}
                className={`${chipBase} ${chipClass.fn}`}
              >
                {m.name}()
              </motion.span>
            );
          })}
        </div>
      )}
      {!heap.blueprint && (
        <div className="flex flex-col gap-1">
          {heap.attrs.length === 0 && (
            <div className="py-1 font-mono text-[10px] text-slate-500">no attributes yet</div>
          )}
          {heap.attrs.map((row) => (
            <RowView key={row.id} row={row} ctx={ctx} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MemoryPanel({ ctx, cols }: { ctx: Ctx; cols: number }) {
  const { view } = ctx;
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg">
      <PanelHeader>memory</PanelHeader>
      <div className="space-y-2 p-2">
        <div>
          <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-slate-500">names</p>
          <div className="flex min-h-7 flex-col gap-1">
            {view.globals.length === 0 && (
              <div className="flex min-h-7 items-center justify-center rounded-md border border-dashed border-white/10 font-mono text-[11px] text-slate-500">
                nothing stored yet
              </div>
            )}
            {view.globals.map((row) => (
              <RowView key={row.id} row={row} ctx={ctx} />
            ))}
          </div>
        </div>
        {view.heaps.length > 0 && (
          <div>
            <p className="mb-1 font-mono text-[9px] tracking-[0.16em] text-slate-500">objects</p>
            <div
              className="grid items-start gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {view.heaps.map((h) => (
                <HeapCard key={h.id} heap={h} ctx={ctx} span={cols >= 3 ? 1 : 2} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Console                                                                     */
/* -------------------------------------------------------------------------- */

function useTypewriter(text: string, delayMs: number, instant: boolean) {
  const [count, setCount] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let timer: number | undefined;
    const kickoff = window.setTimeout(() => {
      let i = 0;
      timer = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(timer);
      }, 30);
    }, delayMs);
    return () => {
      window.clearTimeout(kickoff);
      if (timer) window.clearInterval(timer);
    };
  }, [text, delayMs, instant]);
  return text.slice(0, count);
}

function ConsoleLine({
  text,
  fresh,
  land,
  reduce,
  anchor,
  last,
}: {
  text: string;
  fresh: boolean;
  land: number;
  reduce: boolean;
  anchor?: (el: HTMLElement | null) => void;
  last: boolean;
}) {
  const typed = useTypewriter(text, Math.round(land * 1000) + 100, reduce || !fresh);
  return (
    <div ref={anchor} className="min-h-5 break-all text-slate-100">
      {typed}
      {last && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-0.5 inline-block h-3.5 w-1.5 bg-mint align-middle"
        />
      )}
    </div>
  );
}

// Height is reserved for the longest output of the slide, so the panels around
// it never shift as lines are printed.
function ConsolePanel({ ctx, lines }: { ctx: Ctx; lines: number }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg">
      <PanelHeader>console</PanelHeader>
      <div className="p-2.5 font-mono text-[12px] leading-5" style={{ minHeight: 44 + lines * 20 }}>
        <div>
          <span className="text-mint">$</span> <span className="text-slate-300">python main.py</span>
        </div>
        {view.out.map((text, i) => {
          const j = i - before;
          const id = j === 0 ? "cons" : `cons${j}`;
          return (
            <ConsoleLine
              key={i}
              text={text}
              reduce={reduce}
              last={i === view.out.length - 1}
              fresh={j >= 0}
              land={j >= 0 ? landOf(timed, id, 0.2) : 0}
              anchor={j >= 0 ? reg(id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Flying chip                                                                 */
/* -------------------------------------------------------------------------- */

function FlyingChip({ f }: { f: Flight }) {
  const midY = Math.min(f.y0, f.y1) - 24;
  return (
    <motion.div
      className="absolute left-0 top-0 rounded-md bg-slate-900 shadow-[0_0_18px_rgba(64,224,180,0.35)]"
      initial={{ x: f.x0, y: f.y0, opacity: 0, scale: 0.9 }}
      animate={{
        x: [f.x0, f.x1],
        y: [f.y0, midY, f.y1],
        opacity: [0, 1, 1, 0],
        scale: [0.9, 1.1, 1.1, 1],
      }}
      transition={{
        x: { duration: FLY, delay: f.delay, ease: "easeInOut" },
        y: { duration: FLY, delay: f.delay, times: [0, 0.45, 1], ease: "easeInOut" },
        opacity: { duration: FLY, delay: f.delay, times: [0, 0.1, 0.86, 1] },
        scale: { duration: FLY, delay: f.delay, times: [0, 0.3, 0.86, 1] },
      }}
    >
      <span className={`${chipBase} ${chipClass[f.kind]}`}>{f.text}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Visual scenes (the two illustrated phases)                                  */
/* -------------------------------------------------------------------------- */

// The scenes are drawn at a fixed design size and scaled to fit the available
// width, so they never overflow a narrow lesson column.
function FitBox({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className="mx-auto w-full" style={{ maxWidth: width, height: height * scale }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}

function WhyOOPScene() {
  return (
    <div className="flex w-full flex-col items-center">
      <FitBox width={900} height={500}>
        <div className="flex h-full w-full items-center justify-center gap-8">
          {/* Left side: without OOP */}
          <div className="flex w-[360px] flex-shrink-0 flex-col items-center">
            <h3 className="mb-1 font-mono text-2xl font-bold text-foreground">Without OOP</h3>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              Related data and functions<br />are scattered everywhere.
            </p>

            <div className="relative flex h-[320px] w-full items-center justify-center">
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-50" viewBox="0 0 360 320">
                <defs>
                  <marker id="oop-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {[
                  "M100,60 Q140,85 178,116",
                  "M260,60 Q255,85 250,116",
                  "M144,150 Q155,150 163,150",
                  "M180,182 Q165,200 152,226",
                  "M240,182 Q245,210 248,236",
                  "M100,170 Q105,195 108,226",
                ].map((d) => (
                  <path key={d} d={d} stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeDasharray="4 4" markerEnd="url(#oop-arrowhead)" />
                ))}
              </svg>

              {[
                { left: 70, top: 40, delay: 0.1, cls: "border-orange-500 text-orange-400", text: "speed = 0" },
                { left: 290, top: 40, delay: 0.3, cls: "border-emerald-500 text-emerald-400", text: 'color = "blue"' },
                { left: 80, top: 150, delay: 0.5, cls: "border-violet-500 text-violet-400", text: 'brand = "Tesla"' },
              ].map((n) => (
                <motion.div
                  key={n.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: n.delay }}
                  style={{ left: n.left, top: n.top, x: "-50%", y: "-50%" }}
                  className={`absolute flex h-10 w-32 items-center justify-center whitespace-nowrap rounded-lg border bg-surface font-mono text-xs shadow-lg ${n.cls}`}
                >
                  {n.text}
                </motion.div>
              ))}

              {[
                { left: 230, top: 150, w: "w-32", delay: 0.2, box: "border-blue-500 bg-blue-500/10", text: "text-blue-400", label: "def start():", icon: <Settings className="size-5 text-blue-500" /> },
                { left: 100, top: 260, w: "w-40", delay: 0.4, box: "border-amber-500 bg-amber-500/10", text: "text-amber-500", label: "def accelerate():", icon: <Gauge className="size-5 text-amber-500" /> },
                { left: 260, top: 270, w: "w-32", delay: 0.6, box: "border-teal-500 bg-teal-500/10", text: "text-teal-400", label: "def brake():", icon: <CircleDot className="size-5 text-teal-500" /> },
              ].map((f) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: f.delay }}
                  style={{ left: f.left, top: f.top, x: "-50%", y: "-50%" }}
                  className={`absolute flex h-16 flex-col justify-center rounded-lg border px-4 shadow-lg ${f.w} ${f.box}`}
                >
                  <span className={`font-mono text-xs ${f.text}`}>{f.label}</span>
                  <span className={`font-mono text-xs opacity-50 ${f.text}`}>...</span>
                  <div className="absolute -bottom-3 -right-3 rounded-full border border-hairline bg-surface p-1.5 shadow-md">{f.icon}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated arrow */}
          <div className="flex w-20 flex-shrink-0 items-center justify-center">
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2, type: "spring" }}>
              <div
                className="relative flex h-12 w-20 items-center justify-end overflow-hidden rounded-r-full bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500 pr-1"
                style={{ clipPath: "polygon(0 30%, 60% 30%, 60% 0, 100% 50%, 60% 100%, 60% 70%, 0 70%)" }}
              >
                <motion.div
                  className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Right side: with OOP */}
          <div className="flex flex-col items-center">
            <h3 className="mb-1 font-mono text-2xl font-bold text-foreground">With OOP</h3>
            <p className="mb-6 max-w-[280px] text-center text-sm text-muted-foreground">
              Everything related to a Car is grouped into one object.
            </p>

            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="relative flex w-64 flex-col rounded-xl border-2 border-slate-700/80 bg-[#1e293b] shadow-2xl"
              >
                <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 flex-col items-center">
                  <CarSVG className="relative z-20 mb-1 h-auto w-14 drop-shadow-md" color="#93c5fd" />
                  <div className="relative z-10 rounded-full border border-blue-500 bg-blue-600 px-8 py-1.5 shadow-lg">
                    <span className="font-mono text-lg font-bold tracking-wider text-white">Car</span>
                  </div>
                </div>

                <div className="space-y-5 px-5 pb-5 pt-12">
                  {[
                    {
                      title: "Attributes (Data)",
                      items: [
                        { icon: <Gauge className="size-4 text-orange-400" />, text: "speed = 0" },
                        { icon: <Palette className="size-4 text-emerald-400" />, text: 'color = "blue"' },
                        { icon: <Shield className="size-4 text-violet-400" />, text: 'brand = "Tesla"' },
                      ],
                    },
                    {
                      title: "Methods (Functions)",
                      items: [
                        { icon: <Settings className="size-4 text-blue-400" />, text: "start()" },
                        { icon: <Zap className="size-4 text-amber-400" />, text: "accelerate()" },
                        { icon: <CircleDot className="size-4 text-teal-400" />, text: "brake()" },
                      ],
                    },
                  ].map((group) => (
                    <div key={group.title}>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-400">{group.title}</div>
                      <div className="space-y-1.5">
                        {group.items.map((item) => (
                          <div key={item.text} className="flex items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                            {item.icon}
                            <span className="font-mono text-xs text-slate-200">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
                className="ml-3 flex w-24 flex-col items-start gap-1"
              >
                <svg className="h-8 w-8 -rotate-[20deg] transform text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 9l-6 6 6 6" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
                <span className="font-writing ml-1 text-xs leading-tight text-blue-400">
                  One object.<br />All related.<br />Easy to manage.
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </FitBox>
      <p className="mt-3 max-w-xl text-center text-sm text-muted-foreground/80">
        Without classes, related data and behavior drift apart. A class groups them into a single object.
      </p>
    </div>
  );
}

function ConceptScene() {
  const [selected, setSelected] = useState<number | null>(null);
  const cards = [
    { n: 1, x: -40, y: -40, delay: 0.5, label: "Object A", color: "#f43f5e", text: 'color: "red"', border: "border-rose-500/30 hover:border-rose-500/80", tag: "text-rose-400/80", pill: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
    { n: 2, x: 0, y: 0, delay: 0.8, label: "Object B", color: "#10b981", text: 'color: "green"', border: "border-emerald-500/30 hover:border-emerald-500/80", tag: "text-emerald-400/80", pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
    { n: 3, x: 40, y: 40, delay: 1.1, label: "Object C", color: "#fbbf24", text: 'color: "yellow"', border: "border-amber/30 hover:border-amber/80", tag: "text-amber/80", pill: "bg-amber/10 border-amber/20 text-amber" },
  ];
  return (
    <div className="flex w-full flex-col items-center">
      <FitBox width={720} height={420}>
        <div className="flex h-full w-full items-center justify-center gap-14">
          {/* Class (blueprint) */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="mb-1 font-mono text-xl font-light text-foreground">The Class</h3>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">The Blueprint</p>
            </div>
            <div className="relative flex aspect-[4/5] w-56 flex-col items-center justify-center overflow-hidden rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-transparent p-6 shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <Layers className="absolute left-6 top-6 z-20 size-8 text-blue-400" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                <CarSVG className="h-auto w-44 text-blue-400 opacity-30 drop-shadow-sm" />
              </div>
              <div className="z-10 mb-2 mt-auto w-full space-y-2">
                <div className="flex w-full items-center justify-between rounded border border-dashed border-blue-500/30 bg-blue-500/5 px-2 py-1.5 backdrop-blur-md">
                  <span className="font-mono text-[10px] text-blue-400/70">color:</span>
                  <span className="font-mono text-[10px] text-blue-400/30">____</span>
                </div>
              </div>
              <div className="z-10 font-mono text-[10px] text-blue-400/80">Defines shape &amp; features</div>
            </div>
          </div>

          {/* Animated arrow */}
          <div className="relative flex h-32 w-16 flex-col items-center justify-center">
            <svg className="absolute h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 10 50 L 90 50" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" fill="none" className="text-muted-foreground/30" />
              <motion.path
                d="M 10 50 L 90 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                className="text-blue-400"
                animate={{ strokeDashoffset: [-20, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <path d="M 85 45 L 95 50 L 85 55 Z" fill="currentColor" className="text-muted-foreground/30" />
            </svg>
            <div className="z-10 mt-10 rounded border border-hairline bg-surface-2/80 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur-sm">
              Instantiates
            </div>
          </div>

          {/* Objects (real things) */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h3 className="mb-1 font-mono text-xl font-light text-foreground">The Objects</h3>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">The Real Things</p>
            </div>
            <div className="relative flex h-72 w-64 items-center justify-center">
              {cards.map((c) => (
                <motion.div
                  key={c.n}
                  initial={{ x: c.x, y: c.y, opacity: 0, scale: 0.8 }}
                  animate={{
                    x: c.x,
                    y: c.y,
                    opacity: selected !== null && selected !== c.n ? 0.6 : 1,
                    scale: selected === c.n ? 1.1 : selected !== null ? 0.95 : 1,
                    zIndex: selected === c.n ? 50 : c.n * 10,
                  }}
                  transition={{ delay: selected === null ? c.delay : 0, type: "spring", bounce: 0.4 }}
                  onMouseEnter={() => setSelected(c.n)}
                  onMouseLeave={() => setSelected(null)}
                  className={`absolute flex aspect-[4/5] w-36 cursor-pointer flex-col items-center rounded-2xl border bg-surface p-4 shadow-2xl backdrop-blur-md transition-colors ${c.border}`}
                >
                  <div className={`mb-auto w-full text-center font-mono text-[9px] uppercase tracking-widest ${c.tag}`}>{c.label}</div>
                  <CarSVG className="my-auto h-auto w-full drop-shadow-md" color={c.color} />
                  <div className={`mt-auto w-full rounded border py-1 text-center font-mono text-[9px] ${c.pill}`}>{c.text}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </FitBox>
      <p className="mt-3 max-w-lg text-center text-sm text-muted-foreground/80">
        {selected === null ? "Hover over an object card to isolate it! " : ""}
        Before looking at code, remember the core concept: a <strong className="text-foreground">Class</strong> is just a blueprint. An{" "}
        <strong className="text-foreground">Object</strong> is the actual thing built from it.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Responsive layout                                                           */
/* -------------------------------------------------------------------------- */

// The layout follows the width of the animation itself, not the browser window,
// so it stays compact when the lesson column is narrower than the screen.
function useWidth(ref: { current: HTMLElement | null }) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

// The animation alternates between two illustrated scenes and the code-driven
// examples above.
type Entry =
  | { kind: "visual"; id: "why" | "concept"; label: string; ms: number }
  | { kind: "code"; slide: number; label: string };

const ENTRIES: Entry[] = [
  { kind: "visual", id: "why", label: "Why OOP", ms: 9000 },
  { kind: "visual", id: "concept", label: "Blueprint and objects", ms: 8000 },
  ...slides.map((s, i): Entry => ({ kind: "code", slide: i, label: s.eyebrow })),
];

export function ClassesAndObjectsCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [hovered, setHovered] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback<Reg>(
    (id) => (el) => {
      anchors.current[id] = el;
    },
    [],
  );

  const width = useWidth(rootRef);
  const inner = width === 0 ? 1024 : Math.min(1024, width - 48);
  const wide = inner >= 760;
  // Object cards per row inside the memory panel.
  const heapCols = wide ? 2 : inner >= 560 ? 3 : 2;

  const entry = ENTRIES[idx];
  const isCode = entry.kind === "code";
  const current = slides[entry.kind === "code" ? entry.slide : 0];
  const last = current.steps.length - 1;
  const at = isCode ? Math.min(phase, last) : 0;
  const views = useMemo(() => compile(current), [current]);
  const step = current.steps[at];
  const view = views[at];
  const prev = views[at - 1];
  const timed = useMemo(() => timedOf(step), [step]);
  const consoleLines = useMemo(() => Math.max(1, ...views.map((v) => v.out.length)), [views]);

  const next = useCallback(() => {
    setIdx((value) => (value + 1) % ENTRIES.length);
    setPhase(0);
  }, []);

  // Autoplay: illustrated scenes pause while hovered (they are interactive);
  // code scenes step through their phases.
  useEffect(() => {
    if (!playing) return;
    if (!isCode) {
      if (hovered) return;
      const timer = window.setTimeout(next, entry.kind === "visual" ? entry.ms : 8000);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      if (at < last) setPhase(at + 1);
      else next();
    }, stepMs(step));
    return () => window.clearTimeout(timer);
  }, [playing, hovered, isCode, entry, at, last, step, next]);

  // Measure where each value starts and ends, then launch the flying chips.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce || !isCode) {
      setFlights([]);
      return;
    }
    const rr = root.getBoundingClientRect();
    const out: Flight[] = [];
    for (const t of timed) {
      const from = anchors.current[t.from];
      const to = anchors.current[t.to];
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      out.push({
        ...t,
        x0: a.left - rr.left,
        y0: a.top - rr.top + a.height / 2 - CHIP_H / 2,
        x1: b.left - rr.left,
        y1: b.top - rr.top + b.height / 2 - CHIP_H / 2,
      });
    }
    setFlights(out);
  }, [idx, at, reduce, timed, isCode]);

  const goEntry = (target: number) => {
    setPlaying(false);
    setIdx((target + ENTRIES.length) % ENTRIES.length);
    setPhase(0);
  };
  const goPhase = (target: number) => {
    setPlaying(false);
    setPhase(target);
  };
  const replay = () => {
    setIdx(0);
    setPhase(0);
    setPlaying(true);
  };

  const ctx: Ctx = { step, view, prev, reg, reduce, timed };
  const progress = (idx + (isCode ? (at + 1) / (last + 1) : 1)) / ENTRIES.length;

  const narration = (
    <div
      className="min-h-[76px] rounded-xl border border-hairline bg-surface/60 px-3.5 py-2.5"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={`${idx}-${at}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[13px] leading-5 text-muted-foreground"
        >
          <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-mint">Step {at + 1}</span>
          {step.note}
        </motion.p>
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div
        ref={rootRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-[600px] w-full min-w-0 flex-col overflow-hidden px-4 py-4 sm:px-6"
      >
        {entry.kind === "visual" ? (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto flex min-h-[560px] w-full min-w-0 max-w-5xl flex-1 flex-col items-center justify-center"
          >
            {entry.id === "why" ? <WhyOOPScene /> : <ConceptScene />}
          </motion.div>
        ) : (
          /* Fade only (no translate) so measured chip positions stay exact. */
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full min-w-0 max-w-5xl"
          >
            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.2em] text-violet">{current.eyebrow}</p>
              <h3 className="mt-1 text-xl font-light text-foreground">{current.title}</h3>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
              {current.steps.map((s, i) => (
                <button
                  key={`${s.label}-${i}`}
                  type="button"
                  onClick={() => goPhase(i)}
                  aria-current={i === at ? "step" : undefined}
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] transition-colors ${i === at
                      ? "border-mint/50 bg-mint/15 text-mint"
                      : i < at
                        ? "border-hairline text-foreground/70 hover:text-foreground"
                        : "border-hairline text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {i + 1}. {s.label}
                </button>
              ))}
            </div>

            {wide ? (
              /* Wide: code, narration and console stay put on the left; memory
                 grows downward on the right, so nothing shifts between steps. */
              <div
                className="mt-3 grid items-start gap-3"
                style={{ gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)" }}
              >
                <div className="flex min-w-0 flex-col gap-3">
                  <CodeEditor lines={current.lines} ctx={ctx} />
                  {narration}
                  <ConsolePanel ctx={ctx} lines={consoleLines} />
                </div>
                <MemoryPanel ctx={ctx} cols={heapCols} />
              </div>
            ) : (
              <div className="mt-3 flex min-w-0 flex-col gap-3">
                {narration}
                <CodeEditor lines={current.lines} ctx={ctx} />
                <ConsolePanel ctx={ctx} lines={consoleLines} />
                <MemoryPanel ctx={ctx} cols={heapCols} />
              </div>
            )}
          </motion.div>
        )}

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={`${idx}-${at}-${f.from}-${f.to}-${f.delay}`} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay from the start">
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" onClick={() => goEntry(idx - 1)} className={controlBtn} aria-label="Previous scene">
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={controlBtn}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" onClick={() => goEntry(idx + 1)} className={controlBtn} aria-label="Next scene">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {ENTRIES.map((e, i) => (
              <button
                key={e.label}
                type="button"
                onClick={() => goEntry(i)}
                aria-label={`Go to scene ${i + 1}: ${e.label}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-mint" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                  }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {idx + 1} / {ENTRIES.length}
          </span>
        </div>
      </div>
    </div>
  );
}
