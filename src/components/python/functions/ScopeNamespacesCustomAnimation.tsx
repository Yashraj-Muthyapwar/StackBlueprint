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
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "val" | "fn" | "ret" | "ref" | "bi";
type LayerId = "local" | "enclosing" | "global" | "builtin";

// A value that flies between anchors: code markers, namespace rows, or the
// console line being written ("cons", "cons1").
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = { id: string; name: string; value: string; kind: Kind; via?: string };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n function name   v name being assigned   u name being read   p parameter
 *   a argument        c call text             e closing paren     y declared name
 *   r returned name   g printed name          s literal (highlighted normally)
 */
type Step = {
  label: string;
  note: string;
  active: number[];
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  hide?: string[];
  bind?: Partial<Record<LayerId, Row[]>>; // rows added to (or updated in) a namespace
  release?: string[]; // row ids removed from every namespace
  names?: Partial<Record<LayerId, string | null>>; // which function owns a namespace
  probe?: { name: string; trail: LayerId[]; skip?: boolean }; // a LEGB name lookup
  out?: string[];
  hot?: string[];
  dim?: string[];
  ul?: string[];
  tags?: { id: string; text: string; kind: Kind }[];
  badge?: { line: number; text: string; label?: string };
};

type Slide = { eyebrow: string; title: string; lines: string[]; steps: Step[] };

type Layers = Record<LayerId, Row[]>;
type View = {
  swaps: Record<string, Swap>;
  hide: Set<string>;
  layers: Layers;
  names: Record<LayerId, string | null>;
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
const STAGGER = 0.14;
const LIFT = 0.95;
const RET = LIFT + FLY - 0.08;
const CHIP_H = 24;

const startAt = (n: number) => 0.2 + n * STAGGER;
// A lookup visits one namespace every half second; this is when it has finished.
const PE = (visited: number) => 0.3 + visited * 0.5;

const timedOf = (s: Step): Timed[] =>
  (s.flights ?? []).map((f, i) => ({ ...f, delay: f.at ?? startAt(i) }));

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay)) + FLY - 0.08 : fallback;
};

const stepMs = (s: Step) => {
  const last = Math.max(0, PE(s.probe?.trail.length ?? 0), ...timedOf(s).map((f) => f.delay));
  return Math.max(2600, (last + FLY) * 1000 + 1500);
};

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const R = (id: string, name: string, value: string, kind: Kind = "val", via?: string): Row => ({
  id, name, value, kind, via,
});
const fnv = (n: string) => `<function ${n}>`;

const BUILTINS: Row[] = [R("b_print", "print", "<built-in>", "bi"), R("b_len", "len", "<built-in>", "bi")];

const ORDER: LayerId[] = ["local", "enclosing", "global", "builtin"];
const LAYER_META: Record<LayerId, { title: string; hint: string }> = {
  local: { title: "Local", hint: "current function" },
  enclosing: { title: "Enclosing", hint: "outer function" },
  global: { title: "Global", hint: "this file" },
  builtin: { title: "Built-in", hint: "Python itself" },
};
const EMPTY_TEXT: Record<LayerId, [string, string]> = {
  local: ["no active call", "no local names yet"],
  enclosing: ["no enclosing function", "empty"],
  global: ["empty", "empty"],
  builtin: ["empty", "empty"],
};

const slides: Slide[] = [
  /* 1 Local ---------------------------------------------------------------- */
  {
    eyebrow: "Local scope",
    title: "Python looks in the current function first",
    lines: [
      '⟦v0:label⟧ = ⟦s0:"global"⟧',
      "",
      "def ⟦n0:outer⟧():",
      '    ⟦v1:label⟧ = ⟦s1:"enclosing"⟧',
      "",
      "    def ⟦n1:inner⟧():",
      '        ⟦v2:label⟧ = ⟦s2:"local"⟧',
      "        return ⟦u0:label⟧",
      "",
      "    return inner()",
      "",
      "print(⟦c:outer()⟧)",
    ],
    steps: [
      {
        label: "Global names", active: [0, 2],
        flights: [
          { from: "s0", to: "g_label", text: '"global"', kind: "val" },
          { from: "n0", to: "g_outer", text: fnv("outer"), kind: "fn" },
        ],
        bind: { global: [R("g_label", "label", '"global"'), R("g_outer", "outer", fnv("outer"), "fn")] },
        note: "Running the file from the top binds two names in the global namespace: label and outer.",
      },
      { label: "Call outer", active: [11], ul: ["c"], names: { local: "outer()" }, note: "The call creates a fresh local namespace for outer. Nothing is bound in it yet." },
      {
        label: "Bind in outer", active: [3, 5],
        flights: [
          { from: "s1", to: "l_label", text: '"enclosing"', kind: "val" },
          { from: "n1", to: "l_inner", text: fnv("inner"), kind: "fn" },
        ],
        bind: { local: [R("l_label", "label", '"enclosing"'), R("l_inner", "inner", fnv("inner"), "fn")] },
        note: "label = ... inside outer creates a new local name. It does not touch the global label.",
      },
      {
        label: "Call inner", active: [9],
        names: { local: "inner()", enclosing: "outer()" },
        release: ["l_label", "l_inner"],
        bind: { enclosing: [R("e_label", "label", '"enclosing"'), R("e_inner", "inner", fnv("inner"), "fn")] },
        note: "Calling inner creates its own local namespace, and outer's namespace becomes the enclosing one.",
      },
      {
        label: "Bind in inner", active: [6],
        flights: [{ from: "s2", to: "l2_label", text: '"local"', kind: "val" }],
        bind: { local: [R("l2_label", "label", '"local"')] },
        note: "inner binds label too. Same name, three namespaces: the local one now shadows the others.",
      },
      {
        label: "Look up", active: [7],
        probe: { name: "label", trail: ["local"] },
        flights: [{ from: "l2_label", to: "u0", text: '"local"', kind: "val", at: PE(1) }],
        swap: { u0: { text: '"local"', kind: "val" } },
        note: "Python checks Local first and finds label, so the search stops. The other two labels are shadowed, not changed.",
      },
      {
        label: "Print", active: [11],
        flights: [{ from: "u0", to: "cons", text: "local", kind: "ret" }],
        release: ["l2_label", "e_label", "e_inner"],
        names: { local: null, enclosing: null },
        out: ["local"],
        note: "The value travels back to print. Both frames are released, and the global label is still \"global\".",
      },
    ],
  },
  /* 2 Enclosing ------------------------------------------------------------ */
  {
    eyebrow: "Enclosing scope",
    title: "Without a local name, Python checks the outer function",
    lines: [
      '⟦v0:label⟧ = ⟦s0:"global"⟧',
      "",
      "def ⟦n0:outer⟧():",
      '    ⟦v1:label⟧ = ⟦s1:"enclosing"⟧',
      "",
      "    def ⟦n1:inner⟧():",
      "        return ⟦u0:label⟧",
      "",
      "    return inner()",
      "",
      "print(⟦c:outer()⟧)",
    ],
    steps: [
      {
        label: "Global names", active: [0, 2],
        flights: [
          { from: "s0", to: "g_label", text: '"global"', kind: "val" },
          { from: "n0", to: "g_outer", text: fnv("outer"), kind: "fn" },
        ],
        bind: { global: [R("g_label", "label", '"global"'), R("g_outer", "outer", fnv("outer"), "fn")] },
        note: "The file binds label and outer in the global namespace.",
      },
      { label: "Call outer", active: [10], ul: ["c"], names: { local: "outer()" }, note: "The call creates a fresh local namespace for outer." },
      {
        label: "Bind in outer", active: [3, 5],
        flights: [
          { from: "s1", to: "l_label", text: '"enclosing"', kind: "val" },
          { from: "n1", to: "l_inner", text: fnv("inner"), kind: "fn" },
        ],
        bind: { local: [R("l_label", "label", '"enclosing"'), R("l_inner", "inner", fnv("inner"), "fn")] },
        note: "outer gets its own label, plus the inner function it defines.",
      },
      {
        label: "Call inner", active: [8],
        names: { local: "inner()", enclosing: "outer()" },
        release: ["l_label", "l_inner"],
        bind: { enclosing: [R("e_label", "label", '"enclosing"'), R("e_inner", "inner", fnv("inner"), "fn")] },
        note: "inner starts with an empty local namespace. It never binds label itself.",
      },
      {
        label: "Look up", active: [6],
        probe: { name: "label", trail: ["local", "enclosing"] },
        flights: [{ from: "e_label", to: "u0", text: '"enclosing"', kind: "val", at: PE(2) }],
        swap: { u0: { text: '"enclosing"', kind: "val" } },
        note: "Local has no label, so Python moves outward. Enclosing has one, so the search ends there and never reaches the global label.",
      },
      {
        label: "Print", active: [10],
        flights: [{ from: "u0", to: "cons", text: "enclosing", kind: "ret" }],
        release: ["e_label", "e_inner"],
        names: { local: null, enclosing: null },
        out: ["enclosing"],
        note: "The value is returned up the chain and printed. The frames are released.",
      },
    ],
  },
  /* 3 Global --------------------------------------------------------------- */
  {
    eyebrow: "Global scope",
    title: "Python falls back to the file-level namespace",
    lines: [
      '⟦v0:label⟧ = ⟦s0:"global"⟧',
      "",
      "def ⟦n0:show⟧():",
      "    return ⟦u0:label⟧",
      "",
      "print(⟦c:show()⟧)",
    ],
    steps: [
      {
        label: "Global names", active: [0, 2],
        flights: [
          { from: "s0", to: "g_label", text: '"global"', kind: "val" },
          { from: "n0", to: "g_show", text: fnv("show"), kind: "fn" },
        ],
        bind: { global: [R("g_label", "label", '"global"'), R("g_show", "show", fnv("show"), "fn")] },
        note: "The file binds label and show in the global namespace.",
      },
      { label: "Call show", active: [5], ul: ["c"], names: { local: "show()" }, note: "The call creates a local namespace for show. It stays empty: the function binds no names." },
      {
        label: "Look up", active: [3],
        probe: { name: "label", trail: ["local", "enclosing", "global"] },
        flights: [{ from: "g_label", to: "u0", text: '"global"', kind: "val", at: PE(3) }],
        swap: { u0: { text: '"global"', kind: "val" } },
        note: "Local is empty and there is no enclosing function, so Python continues to Global and finds label.",
      },
      {
        label: "Print", active: [5],
        flights: [{ from: "u0", to: "cons", text: "global", kind: "ret" }],
        names: { local: null },
        out: ["global"],
        note: "show returns the global value and print displays it.",
      },
    ],
  },
  /* 4 Built-in ------------------------------------------------------------- */
  {
    eyebrow: "Built-in scope",
    title: "Built-in names are the final fallback",
    lines: [
      "def ⟦n0:size⟧(⟦p0:text⟧):",
      "    return ⟦u1:len⟧(⟦u0:text⟧)",
      "",
      'print(⟦c:size(⟧⟦a0:"Python"⟧⟦e:)⟧)',
    ],
    steps: [
      {
        label: "Global names", active: [0],
        flights: [{ from: "n0", to: "g_size", text: fnv("size"), kind: "fn" }],
        bind: { global: [R("g_size", "size", fnv("size"), "fn")] },
        note: "def binds size in the global namespace. len is not bound anywhere in the file: it lives in the built-in namespace.",
      },
      { label: "Call", active: [3], hot: ["a0"], note: 'Python evaluates the argument "Python", then calls size.' },
      {
        label: "Bind", active: [0], hot: ["a0"], dim: ["a0"],
        names: { local: "size()" },
        flights: [{ from: "a0", to: "p0", text: '"Python"', kind: "val" }],
        swap: { p0: { text: '"Python"', kind: "val", cap: "text" } },
        bind: { local: [R("l_text", "text", '"Python"', "val", "p0")] },
        note: 'The argument "Python" is copied into the parameter text in size\'s local namespace.',
      },
      {
        label: "Look up len", active: [1], dim: ["a0"],
        probe: { name: "len", trail: ["local", "enclosing", "global", "builtin"] },
        flights: [
          { from: "p0", to: "u0", text: '"Python"', kind: "val" },
          { from: "b_len", to: "u1", text: "<built-in len>", kind: "bi", at: PE(4) },
        ],
        swap: { u0: { text: '"Python"', kind: "val" }, u1: { text: "<built-in len>", kind: "bi" } },
        note: "Local, Enclosing and Global all miss on len, so Python falls back to the built-in namespace and finds it.",
      },
      {
        label: "Return", active: [1, 3], dim: ["a0"],
        badge: { line: 1, text: "6", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "6", kind: "ret", at: LIFT }],
        swap: { c: { text: "6", kind: "ret" } },
        hide: ["a0", "e"],
        note: 'len("Python") gives 6. return hands it back and the call expression becomes 6.',
      },
      {
        label: "Print", active: [3], drop: ["p0", "u0", "u1"],
        flights: [{ from: "c", to: "cons", text: "6", kind: "ret" }],
        release: ["l_text"],
        names: { local: null },
        out: ["6"],
        note: "The frame is released and print displays 6.",
      },
    ],
  },
  /* 5 global keyword ------------------------------------------------------- */
  {
    eyebrow: "The global keyword",
    title: "global lets a function rebind a global name",
    lines: [
      "⟦v0:count⟧ = ⟦s0:0⟧",
      "",
      "def ⟦n0:increment⟧():",
      "    global ⟦y:count⟧",
      "    ⟦v1:count⟧ = ⟦u0:count⟧ + 1",
      "",
      "⟦c:increment()⟧",
      "print(⟦g:count⟧)",
    ],
    steps: [
      {
        label: "Global names", active: [0, 2],
        flights: [
          { from: "s0", to: "g_count", text: "0", kind: "val" },
          { from: "n0", to: "g_increment", text: fnv("increment"), kind: "fn" },
        ],
        bind: { global: [R("g_count", "count", "0"), R("g_increment", "increment", fnv("increment"), "fn")] },
        note: "The file binds count and increment in the global namespace.",
      },
      { label: "Call", active: [6], ul: ["c"], names: { local: "increment()" }, note: "The call creates a local namespace for increment." },
      {
        label: "Declare", active: [3], ul: ["y"],
        tags: [{ id: "y", text: "use the global one", kind: "ref" }],
        bind: { local: [R("l_count", "count", "→ global", "ref")] },
        note: "global count says: in this function, count means the global name. Without it, the assignment below would make count local, and reading it first would raise UnboundLocalError.",
      },
      {
        label: "Read", active: [4],
        probe: { name: "count", trail: ["global"], skip: false },
        flights: [{ from: "g_count", to: "u0", text: "0", kind: "val", at: PE(1) }],
        swap: { u0: { text: "0", kind: "val" } },
        note: "Because of the declaration, the lookup goes straight to Global.",
      },
      {
        label: "Write", active: [4],
        flights: [{ from: "v1", to: "g_count", text: "1", kind: "val" }],
        bind: { global: [R("g_count", "count", "1")] },
        note: "The assignment updates the global count to 0 + 1. No new local name is created.",
      },
      {
        label: "Print", active: [7], drop: ["u0"],
        release: ["l_count"],
        names: { local: null },
        swap: { g: { text: "1", kind: "val" } },
        flights: [
          { from: "g_count", to: "g", text: "1", kind: "val" },
          { from: "g", to: "cons", text: "1", kind: "ret", at: 1.1 },
        ],
        out: ["1"],
        note: "increment has finished and its frame is gone, but the change to the global count stays. print shows 1.",
      },
    ],
  },
  /* 6 nonlocal keyword ----------------------------------------------------- */
  {
    eyebrow: "The nonlocal keyword",
    title: "nonlocal lets an inner function rebind an outer name",
    lines: [
      "def ⟦n0:counter⟧():",
      "    ⟦v0:total⟧ = ⟦s0:0⟧",
      "",
      "    def ⟦n1:add_one⟧():",
      "        nonlocal ⟦y:total⟧",
      "        ⟦v1:total⟧ = ⟦u0:total⟧ + 1",
      "",
      "    add_one()",
      "    return ⟦r:total⟧",
      "",
      "print(⟦c:counter()⟧)",
    ],
    steps: [
      {
        label: "Define", active: [0],
        flights: [{ from: "n0", to: "g_counter", text: fnv("counter"), kind: "fn" }],
        bind: { global: [R("g_counter", "counter", fnv("counter"), "fn")] },
        note: "def binds counter in the global namespace. The function inside it does not exist yet.",
      },
      { label: "Call counter", active: [10], ul: ["c"], names: { local: "counter()" }, note: "The call creates a local namespace for counter." },
      {
        label: "Bind in counter", active: [1, 3],
        flights: [
          { from: "s0", to: "l_total", text: "0", kind: "val" },
          { from: "n1", to: "l_add", text: fnv("add_one"), kind: "fn" },
        ],
        bind: { local: [R("l_total", "total", "0"), R("l_add", "add_one", fnv("add_one"), "fn")] },
        note: "counter's local namespace gets total and the add_one function.",
      },
      {
        label: "Call add_one", active: [7],
        names: { local: "add_one()", enclosing: "counter()" },
        release: ["l_total", "l_add"],
        bind: { enclosing: [R("e_total", "total", "0"), R("e_add", "add_one", fnv("add_one"), "fn")] },
        note: "add_one gets a new local namespace, and counter's names become the enclosing ones.",
      },
      {
        label: "Declare", active: [4], ul: ["y"],
        tags: [{ id: "y", text: "use the enclosing one", kind: "ref" }],
        bind: { local: [R("l_ref", "total", "→ enclosing", "ref")] },
        note: "nonlocal total says: total means the variable in the nearest enclosing function, so assigning to it will not create a new local.",
      },
      {
        label: "Read", active: [5],
        probe: { name: "total", trail: ["enclosing"], skip: false },
        flights: [{ from: "e_total", to: "u0", text: "0", kind: "val", at: PE(1) }],
        swap: { u0: { text: "0", kind: "val" } },
        note: "Python goes straight to the enclosing namespace to read total.",
      },
      {
        label: "Write", active: [5],
        flights: [{ from: "v1", to: "e_total", text: "1", kind: "val" }],
        bind: { enclosing: [R("e_total", "total", "1")] },
        note: "The assignment updates the enclosing total to 0 + 1.",
      },
      {
        label: "Return", active: [8, 10], drop: ["u0"],
        names: { local: "counter()", enclosing: null },
        release: ["l_ref", "e_total", "e_add"],
        bind: { local: [R("l2_total", "total", "1"), R("l2_add", "add_one", fnv("add_one"), "fn")] },
        badge: { line: 8, text: "1", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "1", kind: "ret", at: LIFT }],
        swap: { c: { text: "1", kind: "ret" } },
        note: "add_one is finished, so counter is the current function again, and its total is now 1. return sends that back to the caller.",
      },
      {
        label: "Print", active: [10],
        flights: [{ from: "c", to: "cons", text: "1", kind: "ret" }],
        release: ["l2_total", "l2_add"],
        names: { local: null },
        out: ["1"],
        note: "counter's frame is released and print displays 1.",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(slide: Slide): View[] {
  let swaps: Record<string, Swap> = {};
  let hide = new Set<string>();
  let out: string[] = [];
  let layers: Layers = { local: [], enclosing: [], global: [], builtin: BUILTINS };
  let names: Record<LayerId, string | null> = { local: null, enclosing: null, global: null, builtin: null };
  return slide.steps.map((st) => {
    swaps = { ...swaps, ...st.swap };
    st.drop?.forEach((k) => delete swaps[k]);
    hide = new Set([...hide, ...(st.hide ?? [])]);
    out = [...out, ...(st.out ?? [])];
    const gone = new Set(st.release ?? []);
    const next = {} as Layers;
    for (const id of ORDER) {
      let rows = layers[id].filter((r) => !gone.has(r.id));
      for (const row of st.bind?.[id] ?? []) {
        rows = rows.some((r) => r.id === row.id)
          ? rows.map((r) => (r.id === row.id ? row : r))
          : [...rows, row];
      }
      next[id] = rows;
    }
    layers = next;
    names = { ...names, ...st.names } as Record<LayerId, string | null>;
    return { swaps, hide, layers, names, out };
  });
}

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const chipBase =
  "inline-flex h-6 items-center whitespace-pre rounded-md border px-1.5 font-mono text-[12px] leading-none";

const chipClass: Record<Kind, string> = {
  val: "border-mint/40 bg-mint/15 text-mint",
  fn: "border-violet/40 bg-violet/15 text-violet",
  ret: "border-white/30 bg-white/10 text-white",
  ref: "border-sky-400/40 bg-sky-400/15 text-sky-300",
  bi: "border-amber/40 bg-amber/15 text-amber",
};

const COLOR: Record<string, string> = {
  n: "text-sky-300", c: "text-sky-200", e: "text-sky-200",
  a: "text-orange-300", p: "text-cyan-200",
  u: "text-cyan-200", v: "text-cyan-200", y: "text-cyan-200", r: "text-cyan-200", g: "text-cyan-200",
};

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

const KEYWORDS = new Set(["def", "return", "global", "nonlocal"]);
const BUILTIN_NAMES = new Set(["print", "len"]);

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

function Slot({
  id, reg, text, kind, cap, animate, land,
}: {
  id: string; reg: Reg; text: string; kind: Kind; cap?: string; animate: boolean; land: number;
}) {
  const delay = animate ? land : 0;
  return (
    <span ref={reg(id)} className="relative inline-flex align-middle">
      {cap && (
        <motion.span
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -top-3.5 left-0 font-mono text-[9px] tracking-wider text-slate-400"
        >
          {cap}
        </motion.span>
      )}
      <motion.span
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.2 }}
        className={`${chipBase} ${chipClass[kind]}`}
      >
        {text}
      </motion.span>
      {animate && (
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
          key={id} id={id} reg={reg} text={sw.text} kind={sw.kind} cap={sw.cap}
          animate={!reduce && !prev?.swaps[id]} land={landOf(timed, id)}
        />
      );
    }
    if (view.hide.has(id)) return null;

    const role = id[0];
    if (role === "s") {
      return (
        <span key={id} ref={reg(id)}>
          {tokenize(seg.text, state)}
        </span>
      );
    }
    const hot = !!step.hot?.includes(id);
    const tag = step.tags?.find((t) => t.id === id);
    return (
      <motion.span
        key={id}
        ref={reg(id)}
        animate={hot && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className={`relative -mx-[5px] inline-block rounded-md border px-1 transition-[opacity,background-color,border-color] duration-500 ${hot ? chipClass.val : `border-transparent ${COLOR[role] ?? "text-slate-200"}`
          } ${step.dim?.includes(id) ? "opacity-40" : ""} ${step.ul?.includes(id) ? "underline decoration-dashed decoration-cyan-300/60 underline-offset-4" : ""
          }`}
      >
        {seg.text}
        {tag && (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.25 }}
            className="pointer-events-none absolute -top-[27px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
          >
            <span className={`whitespace-pre rounded border bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] leading-none tracking-wider ${chipClass[tag.kind]}`}>
              {tag.text}
            </span>
            <span className={`-mt-px text-[9px] leading-none ${chipClass[tag.kind].split(" ").pop()}`}>▼</span>
          </motion.span>
        )}
      </motion.span>
    );
  });
}

function CodeLine({ line, index, ctx }: { line: string; index: number; ctx: Ctx }) {
  const isActive = ctx.step.active.includes(index);
  const gutter = <span className="mr-4 w-4 select-none text-right text-xs text-slate-600">{index + 1}</span>;
  if (line === "") return <div className="flex h-4 items-center px-2">{gutter}</div>;
  const badge = ctx.step.badge?.line === index ? ctx.step.badge : null;

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isActive ? "rgba(64,224,180,0.10)" : "rgba(64,224,180,0)" }}
      transition={{ duration: 0.3 }}
      className="relative flex h-8 items-center rounded-md px-2"
    >
      <motion.span
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-y-1.5 left-0 w-0.5 rounded bg-mint"
      />
      {gutter}
      <span className="whitespace-pre">
        {renderSegments(line, ctx)}
        {badge && (
          <span className="ml-3 inline-flex items-center gap-2 align-middle">
            <span className="text-slate-500">{badge.label ?? "returns"}</span>
            <motion.span
              ref={ctx.reg("rv")}
              initial={{ opacity: 0 }}
              animate={{ opacity: ctx.reduce ? 1 : [0, 1, 1, 0.2] }}
              transition={ctx.reduce ? { duration: 0 } : { duration: LIFT + 0.3, times: [0, 0.15, 0.85, 1] }}
              className={`${chipBase} ${chipClass.ret}`}
            >
              {badge.text}
            </motion.span>
          </span>
        )}
      </span>
    </motion.div>
  );
}

function PanelHeader({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      <span>{children}</span>
      {right}
    </div>
  );
}

function CodeEditor({ lines, ctx }: { lines: string[]; ctx: Ctx }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className="flex-1 overflow-x-auto p-3 pt-8 font-mono text-[13px] text-slate-100">
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
/* Namespaces and console                                                      */
/* -------------------------------------------------------------------------- */

type State = "idle" | "miss" | "hit" | "skip";

// How a lookup treats each namespace: visited in order, then the rest are skipped.
function stateOf(probe: Step["probe"], id: LayerId): { state: State; delay: number } {
  if (!probe) return { state: "idle", delay: 0 };
  const n = probe.trail.length;
  const i = probe.trail.indexOf(id);
  if (i >= 0) return { state: i === n - 1 ? "hit" : "miss", delay: PE(i) };
  if (probe.skip !== false && ORDER.indexOf(id) > ORDER.indexOf(probe.trail[n - 1])) {
    return { state: "skip", delay: PE(n) };
  }
  return { state: "idle", delay: 0 };
}

const CARD: Record<State, { borderColor: string; backgroundColor: string; opacity: number }> = {
  idle: { borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(15,23,42,0.6)", opacity: 1 },
  miss: { borderColor: "rgba(251,191,36,0.55)", backgroundColor: "rgba(251,191,36,0.07)", opacity: 1 },
  hit: { borderColor: "rgba(64,224,180,0.65)", backgroundColor: "rgba(64,224,180,0.10)", opacity: 1 },
  skip: { borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(15,23,42,0.6)", opacity: 0.45 },
};
const BADGE: Record<State, string> = { idle: "", miss: "not found", hit: "found", skip: "not reached" };
const BADGE_COLOR: Record<State, string> = {
  idle: "", miss: "text-amber", hit: "text-mint", skip: "text-slate-500",
};

function LayerCard({ id, ctx, num }: { id: LayerId; ctx: Ctx; num: number }) {
  const { step, view, prev, reg, reduce, timed } = ctx;
  const rows = view.layers[id];
  const { state, delay } = stateOf(step.probe, id);
  const d = reduce ? 0 : delay;
  const owner = id === "local" || id === "enclosing" ? view.names[id] : null;
  const empty = EMPTY_TEXT[id][view.names[id] ? 1 : 0];

  return (
    <motion.div
      initial={false}
      animate={CARD[state]}
      transition={{ delay: d, duration: 0.3 }}
      className="rounded-lg border p-2.5"
    >
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.14em]">
        <span className="text-slate-300">
          {num}. {LAYER_META[id].title}
          <span className={`ml-2 tracking-normal ${owner ? "text-sky-300" : "text-slate-500"}`}>
            {owner ?? LAYER_META[id].hint}
          </span>
        </span>
        {state !== "idle" && (
          <motion.span
            key={`${state}-${step.label}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: d + 0.1, duration: 0.2 }}
            className={BADGE_COLOR[state]}
          >
            {BADGE[state]}
          </motion.span>
        )}
      </div>
      <div className="flex min-h-7 flex-col gap-1">
        {rows.length === 0 && (
          <div className="flex min-h-7 items-center font-mono text-[11px] text-slate-600">{empty}</div>
        )}
        {rows.map((row) => {
          const before = prev?.layers[id].find((r) => r.id === row.id);
          const isNew = !reduce && !before;
          const changed = !reduce && !!before && before.value !== row.value;
          const land = landOf(timed, row.via ?? row.id);
          return (
            <motion.div
              key={row.id}
              initial={isNew ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: isNew ? land : 0, duration: 0.2 }}
              className="flex items-center gap-2 font-mono text-xs"
            >
              <span className={row.kind === "fn" ? "text-sky-300" : "text-cyan-200"}>{row.name}</span>
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
        })}
      </div>
    </motion.div>
  );
}

function NamespacePanel({ ctx }: { ctx: Ctx }) {
  const probe = ctx.step.probe;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader
        right={
          probe && (
            <motion.span
              key={`${probe.name}-${ctx.step.label}`}
              initial={ctx.reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 tracking-normal"
            >
              <span className="text-slate-500">looking up</span>
              <span className={`${chipBase} h-5 ${chipClass.ref}`}>{probe.name}</span>
            </motion.span>
          )
        }
      >
        namespaces (LEGB)
      </PanelHeader>
      <div className="flex flex-col gap-2 p-3">
        {ORDER.map((id, i) => (
          <LayerCard key={id} id={id} ctx={ctx} num={i + 1} />
        ))}
      </div>
    </div>
  );
}

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
  text, fresh, land, reduce, anchor, last,
}: {
  text: string; fresh: boolean; land: number; reduce: boolean; anchor?: (el: HTMLElement | null) => void; last: boolean;
}) {
  const typed = useTypewriter(text, Math.round(land * 1000) + 100, reduce || !fresh);
  return (
    <div ref={anchor} className="min-h-6 break-all text-slate-100">
      {typed}
      {last && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-0.5 inline-block h-4 w-2 bg-mint align-middle"
        />
      )}
    </div>
  );
}

function ConsolePanel({ ctx }: { ctx: Ctx }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>console</PanelHeader>
      <div className="min-h-[76px] p-3 font-mono text-sm leading-6">
        <div>
          <span className="text-mint">$</span> <span className="text-slate-300">python main.py</span>
        </div>
        {view.out.map((text, i) => {
          const j = i - before;
          const id = j === 0 ? "cons" : `cons${j}`;
          return (
            <ConsoleLine
              key={i} text={text} reduce={reduce} last={i === view.out.length - 1}
              fresh={j >= 0} land={j >= 0 ? landOf(timed, id, 0.2) : 0}
              anchor={j >= 0 ? reg(id) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

function FlyingChip({ f }: { f: Flight }) {
  const midY = Math.min(f.y0, f.y1) - 28;
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
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function ScopeNamespacesCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [flights, setFlights] = useState<Flight[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback<Reg>(
    (id) => (el) => {
      anchors.current[id] = el;
    },
    [],
  );

  const current = slides[slide];
  const views = useMemo(() => compile(current), [current]);
  const step = current.steps[phase];
  const view = views[phase];
  const prev = views[phase - 1];
  const timed = useMemo(() => timedOf(step), [step]);
  const last = current.steps.length - 1;

  // Autoplay: step through the phases, then move to the next example.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (phase < last) setPhase(phase + 1);
      else {
        setSlide((value) => (value + 1) % slides.length);
        setPhase(0);
      }
    }, stepMs(step));
    return () => window.clearTimeout(timer);
  }, [phase, playing, slide, last, step]);

  // Measure where each value starts and ends, then launch the flying chips.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) {
      setFlights([]);
      return;
    }
    const rr = root.getBoundingClientRect();
    const next: Flight[] = [];
    for (const t of timed) {
      const from = anchors.current[t.from];
      const to = anchors.current[t.to];
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      next.push({
        ...t,
        x0: a.left - rr.left,
        y0: a.top - rr.top + a.height / 2 - CHIP_H / 2,
        x1: b.left - rr.left,
        y1: b.top - rr.top + b.height / 2 - CHIP_H / 2,
      });
    }
    setFlights(next);
  }, [slide, phase, reduce, timed]);

  const goSlide = (target: number) => {
    setPlaying(false);
    setSlide((target + slides.length) % slides.length);
    setPhase(0);
  };
  const goPhase = (target: number) => {
    setPlaying(false);
    setPhase(target);
  };
  const replay = () => {
    setPhase(0);
    setPlaying(true);
  };

  const ctx: Ctx = { step, view, prev, reg, reduce, timed };

  return (
    <div className="flex w-full flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[760px] w-full flex-col justify-center overflow-hidden px-5 py-8 sm:px-8"
      >
        {/* Fade only (no translate) so measured chip positions stay exact. */}
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-6xl"
        >
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.2em] text-violet">{current.eyebrow}</p>
            <h3 className="mt-2 text-2xl font-light text-foreground">{current.title}</h3>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {current.steps.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => goPhase(i)}
                aria-current={i === phase ? "step" : undefined}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors ${i === phase
                    ? "border-mint/50 bg-mint/15 text-mint"
                    : i < phase
                      ? "border-hairline text-foreground/70 hover:text-foreground"
                      : "border-hairline text-muted-foreground hover:text-foreground"
                  }`}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
            <div className="flex flex-col gap-4">
              <CodeEditor lines={current.lines} ctx={ctx} />
              <ConsolePanel ctx={ctx} />
            </div>
            <NamespacePanel ctx={ctx} />
          </div>

          <div className="mx-auto mt-5 min-h-[52px] max-w-3xl text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${slide}-${phase}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-6 text-muted-foreground"
              >
                <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-mint">Step {phase + 1}</span>
                {step.note}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={`${slide}-${phase}-${f.from}-${f.to}-${f.delay}`} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${((phase + 1) / current.steps.length) * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay example">
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" onClick={() => goSlide(slide - 1)} className={controlBtn} aria-label="Previous example">
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
          <button type="button" onClick={() => goSlide(slide + 1)} className={controlBtn} aria-label="Next example">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => goSlide(i)}
                aria-label={`Go to example ${i + 1}: ${s.eyebrow}`}
                className={`h-1.5 rounded-full transition-all ${i === slide ? "w-4 bg-mint" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                  }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {slide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}