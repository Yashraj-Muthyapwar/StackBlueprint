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
import { ChevronLeft, ChevronRight, FileText, Folder, Pause, Play, RotateCcw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "val" | "fn" | "ret" | "ref" | "no" | "mod";
type Tone = "module" | "package" | "program" | "stdlib" | "dir";

// A value that flies between two anchors. Anchors are code markers, namespace
// rows, module chips ("sp_<space>"), tree entries ("t_<node>"), the result badge
// ("rv") or the console line ("cons").
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number; dur?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = {
  id: string;
  name: string;
  value: string;
  kind: Kind;
  via?: string;
  at?: number;
  ghost?: boolean; // a name that does NOT exist, drawn dashed
};
type SpaceSpec = { id: string; title: string; tone: Tone; obj?: string };
type Badge = { file: number; line: number; text: string; label?: string; kind?: Kind; at?: number };
type Mark = { id: string; text: string; state: "found" | "run" | "current"; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n function name   p parameter   u name being read   m module name
 *   i import path     a argument    c call target       k punctuation
 *   e closing paren   d leading dot g __name__          s literal (code style)
 */
type Step = {
  label: string;
  note: string;
  active: [number, number][]; // [file, line]
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  hide?: string[]; // markers removed from the line (kept once hidden)
  hideAt?: number; // seconds into the step before they disappear
  bind?: { space: SpaceSpec; rows: Row[] }[]; // create or update namespaces
  release?: string[]; // namespaces to remove
  dimSpaces?: string[];
  out?: string[];
  cmd?: string; // terminal command from this step on
  reset?: boolean; // clear terminal output
  hot?: string[];
  scan?: { ids: string[]; at?: number }; // sweep through tree entries in order
  marks?: Mark[];
  badge?: Badge;
};

type TreeNode = { id: string; name: string; depth: number; tone: Tone; folder?: boolean };
type FileCard = { name: string; tone: Tone; lines: string[] };
type Scene = {
  eyebrow: string;
  title: string;
  cmd: string;
  tree: TreeNode[];
  files: FileCard[];
  steps: Step[];
};

type Space = { spec: SpaceSpec; rows: Row[] };
type View = {
  swaps: Record<string, Swap>;
  hide: Record<string, number>;
  spaces: Space[];
  out: string[];
  cmd: string;
};

type Timed = Flt & { delay: number; dur: number };
type Reg = (id: string) => (el: HTMLElement | null) => void;
type Flight = Timed & { x0: number; y0: number; x1: number; y1: number };
type Ctx = {
  step: Step;
  prevStep?: Step;
  view: View;
  prev?: View;
  reg: Reg;
  reduce: boolean;
  timed: Timed[];
  sid: string;
};

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

const FLY = 0.85;
const CHIP_H = 24;
const SCAN = 0.35; // seconds between entries in a search sweep

// Timeline shared by every function call: arguments fly into parameters,
// parameters fly into the body, the result appears, then flies to the call site.
const T = { arg: 0.15, use: 0.95, badge: 1.6, out: 2.0, dur: 0.6 };

const timedOf = (s: Step): Timed[] =>
  (s.flights ?? []).map((f, i) => ({
    ...f,
    delay: f.at ?? 0.2 + i * 0.14,
    dur: f.dur ?? FLY,
  }));

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay + f.dur)) - 0.08 : fallback;
};

// When a search sweep should start: right after a value lands on the tree.
const scanBase = (s: Step, timed: Timed[]) => {
  if (s.scan?.at !== undefined) return s.scan.at;
  const t = timed.find((f) => f.to.startsWith("t_"));
  return t ? t.delay + t.dur - 0.15 : 0.3;
};

const stepMs = (s: Step) => {
  const timed = timedOf(s);
  const scanEnd = s.scan ? scanBase(s, timed) + s.scan.ids.length * SCAN + 0.5 : 0;
  const end = Math.max(
    0,
    ...timed.map((f) => f.delay + f.dur),
    (s.hideAt ?? 0) + 0.3,
    s.badge ? (s.badge.at ?? 0.2) + 0.6 : 0,
    scanEnd,
  );
  return Math.max(2800, end * 1000 + 1300);
};

/* -------------------------------------------------------------------------- */
/* Content helpers                                                             */
/* -------------------------------------------------------------------------- */

const R = (
  id: string,
  name: string,
  value: string,
  kind: Kind = "val",
  extra: Partial<Row> = {},
): Row => ({ id, name, value, kind, ...extra });

const sp = (id: string, title: string, tone: Tone, obj?: string): SpaceSpec => ({
  id,
  title,
  tone,
  obj,
});

const fnv = (n: string) => `<function ${n}>`;
const builtin = (n: string) => `<built-in ${n}>`;

const outFlt = (to: string, text: string, kind: Kind = "ret", at = T.out): Flt => ({
  from: "rv",
  to,
  text,
  kind,
  at,
  dur: T.dur,
});

type Param = { name: string; from: string; text: string; uses: string[] };

// One call of a function defined in a module. Parameter markers must be p0, p1, ...
function callFn(o: {
  file: number;
  line: number;
  params: Param[];
  result: string;
  call: string; // marker that becomes the result
  args: string[]; // markers that disappear once the result has landed
}): Pick<Step, "flights" | "swap" | "badge" | "hide" | "hideAt"> {
  const flights: Flt[] = [];
  const swap: Record<string, Swap> = {};
  let n = 0;
  o.params.forEach((p, i) => {
    flights.push({ from: p.from, to: `p${i}`, text: p.text, kind: "val", at: T.arg + i * 0.12, dur: T.dur });
    swap[`p${i}`] = { text: p.text, kind: "val", cap: p.name };
    p.uses.forEach((u) => {
      flights.push({ from: `p${i}`, to: u, text: p.text, kind: "val", at: T.use + n * 0.12, dur: T.dur });
      swap[u] = { text: p.text, kind: "val" };
      n += 1;
    });
  });
  flights.push(outFlt(o.call, o.result));
  swap[o.call] = { text: o.result, kind: "ret" };
  return {
    flights,
    swap,
    badge: { file: o.file, line: o.line, text: o.result, label: "returns", kind: "ret", at: T.badge },
    hide: o.args,
    hideAt: T.out + T.dur + 0.1,
  };
}

// Project layouts reused by several scenes.
const STD_TREE: TreeNode[] = [
  { id: "root", name: "project/", depth: 0, tone: "dir", folder: true },
  { id: "main", name: "main.py", depth: 1, tone: "program" },
  { id: "std", name: "python standard library/", depth: 0, tone: "dir", folder: true },
  { id: "json", name: "json", depth: 1, tone: "stdlib" },
  { id: "pathlib", name: "pathlib", depth: 1, tone: "stdlib" },
  { id: "math", name: "math", depth: 1, tone: "stdlib" },
];

const MATH_ROWS = [
  R("cm_sqrt", "sqrt", builtin("sqrt"), "fn"),
  R("cm_floor", "floor", builtin("floor"), "fn"),
  R("cm_pi", "pi", "3.14159"),
];

const SHOP_TREE: TreeNode[] = [
  { id: "root", name: "project/", depth: 0, tone: "dir", folder: true },
  { id: "main", name: "main.py", depth: 1, tone: "program" },
  { id: "shop", name: "shop/", depth: 1, tone: "package", folder: true },
  { id: "init", name: "__init__.py", depth: 2, tone: "module" },
  { id: "prices", name: "prices.py", depth: 2, tone: "module" },
];

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const scenes: Scene[] = [
  /* 1 Module --------------------------------------------------------------- */
  {
    eyebrow: "Module",
    title: "A module gives reusable code its own file",
    cmd: "python main.py",
    tree: [
      { id: "root", name: "project/", depth: 0, tone: "dir", folder: true },
      { id: "calc", name: "calculator.py", depth: 1, tone: "module" },
      { id: "main", name: "main.py", depth: 1, tone: "program" },
    ],
    files: [
      {
        name: "main.py",
        tone: "program",
        lines: [
          "import ⟦m:calculator⟧",
          "print(⟦c:calculator.add⟧⟦k0:(⟧⟦a0:10⟧⟦k1:, ⟧⟦a1:20⟧⟦e:)⟧)",
        ],
      },
      {
        name: "calculator.py",
        tone: "module",
        lines: ["def ⟦n:add⟧(⟦p0:left⟧, ⟦p1:right⟧):", "    return ⟦u0:left⟧ + ⟦u1:right⟧"],
      },
    ],
    steps: [
      {
        label: "Search",
        active: [[0, 0]],
        flights: [{ from: "m", to: "t_calc", text: "calculator", kind: "ref", at: 0.2 }],
        scan: { ids: ["main", "calc"] },
        marks: [{ id: "calc", text: "found", state: "found" }],
        note: "import calculator makes Python look for calculator.py. The folder of the running script is the first place it checks.",
      },
      {
        label: "Execute",
        active: [[1, 0]],
        marks: [{ id: "calc", text: "running", state: "run", at: 0.2 }],
        flights: [{ from: "n", to: "cm_add", text: fnv("add"), kind: "fn", at: 0.4 }],
        bind: [{ space: sp("calc", "module calculator", "module", "<module calculator>"), rows: [R("cm_add", "add", fnv("add"), "fn")] }],
        note: "Python runs calculator.py from top to bottom, once. def add creates a function object inside the new module namespace.",
      },
      {
        label: "Bind",
        active: [[0, 0]],
        flights: [{ from: "sp_calc", to: "mn_calculator", text: "<module calculator>", kind: "mod", at: 0.2 }],
        bind: [{ space: sp("main", "main.py namespace", "program"), rows: [R("mn_calculator", "calculator", "<module calculator>", "mod")] }],
        note: "import binds the module object to the name calculator in main.py's namespace. The add function stays inside the module.",
      },
      {
        label: "Lookup",
        active: [[0, 1]],
        flights: [
          { from: "mn_calculator", to: "c", text: "calculator", kind: "mod", at: 0.2 },
          { from: "cm_add", to: "c", text: fnv("add"), kind: "fn", at: 1.05 },
        ],
        swap: { c: { text: fnv("add"), kind: "fn" } },
        note: "calculator.add is a two-part lookup: first the name calculator, then the member add inside that module.",
      },
      {
        label: "Call",
        active: [[0, 1], [1, 0], [1, 1]],
        ...callFn({
          file: 1,
          line: 1,
          params: [
            { name: "left", from: "a0", text: "10", uses: ["u0"] },
            { name: "right", from: "a1", text: "20", uses: ["u1"] },
          ],
          result: "30",
          call: "c",
          args: ["k0", "a0", "k1", "a1", "e"],
        }),
        note: "10 and 20 flow into left and right, the body becomes 10 + 20, and the result replaces the whole call.",
      },
      {
        label: "Print",
        active: [[0, 1]],
        flights: [{ from: "c", to: "cons", text: "30", kind: "ret" }],
        out: ["30"],
        note: "print receives 30 and writes it to the console.",
      },
    ],
  },
  /* 2 Alias ---------------------------------------------------------------- */
  {
    eyebrow: "Import alias",
    title: "An alias changes the local name for a module",
    cmd: "python main.py",
    tree: STD_TREE,
    files: [
      {
        name: "main.py",
        tone: "program",
        lines: ["import ⟦m:math⟧ as ⟦al:m⟧", "print(⟦c:m.floor⟧⟦k0:(⟧⟦a0:4.8⟧⟦e:)⟧)"],
      },
    ],
    steps: [
      {
        label: "Find",
        active: [[0, 0]],
        flights: [
          { from: "m", to: "t_math", text: "math", kind: "ref", at: 0.2 },
          { from: "t_math", to: "sp_math", text: "math", kind: "mod", at: 2.2 },
        ],
        scan: { ids: ["main", "json", "pathlib", "math"] },
        marks: [{ id: "math", text: "found", state: "found" }],
        bind: [{ space: sp("math", "module math", "module", "<module math>"), rows: MATH_ROWS }],
        note: "Python checks the project folder, then the standard library, and loads math as a module object.",
      },
      {
        label: "Alias",
        active: [[0, 0]],
        hot: ["al"],
        flights: [{ from: "sp_math", to: "mn_m", text: "<module math>", kind: "mod", at: 0.3 }],
        bind: [
          {
            space: sp("main", "main.py namespace", "program"),
            rows: [R("mn_m", "m", "<module math>", "mod"), R("mn_math", "math", "not defined", "no", { ghost: true })],
          },
        ],
        note: "as m binds the module to the name m. The name math is never created, so math.floor would fail here.",
      },
      {
        label: "Lookup",
        active: [[0, 1]],
        flights: [
          { from: "mn_m", to: "c", text: "m", kind: "mod", at: 0.2 },
          { from: "cm_floor", to: "c", text: builtin("floor"), kind: "fn", at: 1.05 },
        ],
        swap: { c: { text: builtin("floor"), kind: "fn" } },
        note: "m.floor looks up m in main's namespace, then floor inside that module.",
      },
      {
        label: "Call",
        active: [[0, 1]],
        flights: [
          { from: "a0", to: "cm_floor", text: "4.8", kind: "val", at: 0.2, dur: 0.6 },
          { from: "cm_floor", to: "c", text: "4", kind: "ret", at: 1.3, dur: 0.6 },
        ],
        swap: { c: { text: "4", kind: "ret" } },
        hide: ["k0", "a0", "e"],
        hideAt: 2.1,
        note: "The argument 4.8 goes into floor, which rounds down to 4. That value replaces the call.",
      },
      {
        label: "Print",
        active: [[0, 1]],
        flights: [{ from: "c", to: "cons", text: "4", kind: "ret" }],
        out: ["4"],
        note: "print writes 4 to the console.",
      },
    ],
  },
  /* 3 Named import -------------------------------------------------------- */
  {
    eyebrow: "Named import",
    title: "A named import brings one member into the current file",
    cmd: "python main.py",
    tree: STD_TREE,
    files: [
      {
        name: "main.py",
        tone: "program",
        lines: ["from ⟦m:math⟧ import ⟦nm:sqrt⟧", "print(⟦c:sqrt⟧⟦k0:(⟧⟦a0:81⟧⟦e:)⟧)"],
      },
    ],
    steps: [
      {
        label: "Find",
        active: [[0, 0]],
        flights: [
          { from: "m", to: "t_math", text: "math", kind: "ref", at: 0.2 },
          { from: "t_math", to: "sp_math", text: "math", kind: "mod", at: 2.2 },
        ],
        scan: { ids: ["main", "json", "pathlib", "math"] },
        marks: [{ id: "math", text: "found", state: "found" }],
        bind: [{ space: sp("math", "module math", "module", "<module math>"), rows: MATH_ROWS }],
        note: "Python loads the math module first, exactly as it does for a normal import.",
      },
      {
        label: "Copy name",
        active: [[0, 0]],
        hot: ["nm"],
        flights: [{ from: "cm_sqrt", to: "mn_sqrt", text: builtin("sqrt"), kind: "fn", at: 0.3 }],
        dimSpaces: ["math"],
        bind: [
          {
            space: sp("main", "main.py namespace", "program"),
            rows: [R("mn_sqrt", "sqrt", builtin("sqrt"), "fn"), R("mn_math", "math", "not defined", "no", { ghost: true })],
          },
        ],
        note: "from ... import copies just the name sqrt into main's namespace. The name math is not created.",
      },
      {
        label: "Lookup",
        active: [[0, 1]],
        flights: [{ from: "mn_sqrt", to: "c", text: builtin("sqrt"), kind: "fn", at: 0.2 }],
        swap: { c: { text: builtin("sqrt"), kind: "fn" } },
        note: "sqrt is found directly in main's namespace, so no math. prefix is needed.",
      },
      {
        label: "Call",
        active: [[0, 1]],
        flights: [
          { from: "a0", to: "mn_sqrt", text: "81", kind: "val", at: 0.2, dur: 0.6 },
          { from: "mn_sqrt", to: "c", text: "9.0", kind: "ret", at: 1.3, dur: 0.6 },
        ],
        swap: { c: { text: "9.0", kind: "ret" } },
        hide: ["k0", "a0", "e"],
        hideAt: 2.1,
        note: "The argument 81 goes into sqrt, which returns 9.0. That value replaces the call.",
      },
      {
        label: "Print",
        active: [[0, 1]],
        flights: [{ from: "c", to: "cons", text: "9.0", kind: "ret" }],
        out: ["9.0"],
        note: "print writes 9.0 to the console.",
      },
    ],
  },
  /* 4 Package -------------------------------------------------------------- */
  {
    eyebrow: "Package",
    title: "A package groups related modules under one name",
    cmd: "python main.py",
    tree: SHOP_TREE,
    files: [
      {
        name: "main.py",
        tone: "program",
        lines: ["from ⟦i0:shop⟧.⟦i1:prices⟧ import ⟦nm:total⟧", "print(⟦c:total⟧⟦k0:(⟧⟦a0:[12, 8]⟧⟦e:)⟧)"],
      },
      {
        name: "shop/prices.py",
        tone: "module",
        lines: ["def ⟦n:total⟧(⟦p0:items⟧):", "    return sum(⟦u0:items⟧)"],
      },
    ],
    steps: [
      {
        label: "Package",
        active: [[0, 0]],
        hot: ["i0"],
        flights: [
          { from: "i0", to: "t_shop", text: "shop", kind: "ref", at: 0.2 },
          { from: "t_init", to: "sp_shop", text: "shop", kind: "mod", at: 2.4 },
        ],
        scan: { ids: ["main", "shop"] },
        marks: [
          { id: "shop", text: "package found", state: "found" },
          { id: "init", text: "runs first", state: "run", at: 1.7 },
        ],
        bind: [{ space: sp("shop", "package shop", "package", "<module shop>"), rows: [R("sh_name", "__name__", '"shop"', "ref")] }],
        note: "The first part of the dotted path is the package. Python finds shop/ and runs its __init__.py first, which creates the package namespace.",
      },
      {
        label: "Module",
        active: [[0, 0], [1, 0]],
        hot: ["i1"],
        flights: [
          { from: "i1", to: "t_prices", text: "prices", kind: "ref", at: 0.2 },
          { from: "n", to: "pm_total", text: fnv("total"), kind: "fn", at: 2.0 },
        ],
        scan: { ids: ["init", "prices"] },
        marks: [{ id: "prices", text: "module found", state: "found" }],
        bind: [{ space: sp("prices", "module shop.prices", "module", "<module shop.prices>"), rows: [R("pm_total", "total", fnv("total"), "fn")] }],
        note: "The next part, prices, is a module inside the package. Python runs prices.py, and def creates total in that module's namespace.",
      },
      {
        label: "Name",
        active: [[0, 0]],
        hot: ["nm"],
        flights: [{ from: "pm_total", to: "mn_total", text: fnv("total"), kind: "fn", at: 0.3 }],
        dimSpaces: ["shop", "prices"],
        bind: [
          {
            space: sp("main", "main.py namespace", "program"),
            rows: [R("mn_total", "total", fnv("total"), "fn"), R("mn_shop", "shop", "not defined", "no", { ghost: true })],
          },
        ],
        note: "Only the final name, total, is bound in main.py. The names shop and prices are not created.",
      },
      {
        label: "Call",
        active: [[0, 1], [1, 0], [1, 1]],
        ...callFn({
          file: 1,
          line: 1,
          params: [{ name: "items", from: "a0", text: "[12, 8]", uses: ["u0"] }],
          result: "20",
          call: "c",
          args: ["k0", "a0", "e"],
        }),
        note: "The list [12, 8] flows into items, the body becomes sum([12, 8]), and the result 20 replaces the call.",
      },
      {
        label: "Print",
        active: [[0, 1]],
        flights: [{ from: "c", to: "cons", text: "20", kind: "ret" }],
        out: ["20"],
        note: "print writes 20 to the console.",
      },
    ],
  },
  /* 5 Relative import ------------------------------------------------------ */
  {
    eyebrow: "Relative import",
    title: "A leading dot starts from the current package",
    cmd: "python -m shop.receipts",
    tree: [
      { id: "root", name: "project/", depth: 0, tone: "dir", folder: true },
      { id: "shop", name: "shop/", depth: 1, tone: "package", folder: true },
      { id: "init", name: "__init__.py", depth: 2, tone: "module" },
      { id: "prices", name: "prices.py", depth: 2, tone: "module" },
      { id: "receipts", name: "receipts.py", depth: 2, tone: "program" },
    ],
    files: [
      {
        name: "shop/receipts.py",
        tone: "program",
        lines: ["from ⟦d:.⟧⟦i1:prices⟧ import ⟦nm:total⟧", "print(⟦c:total⟧⟦k0:(⟧⟦a0:[5, 7]⟧⟦e:)⟧)"],
      },
      {
        name: "shop/prices.py",
        tone: "module",
        lines: ["def ⟦n:total⟧(⟦p0:items⟧):", "    return sum(⟦u0:items⟧)"],
      },
    ],
    steps: [
      {
        label: "The dot",
        active: [[0, 0]],
        hot: ["d"],
        flights: [{ from: "d", to: "t_shop", text: "current package", kind: "ref", at: 0.3 }],
        marks: [{ id: "shop", text: "current package", state: "current", at: 1.0 }],
        note: "receipts.py lives in shop/, so the leading dot means the package that contains this file: shop.",
      },
      {
        label: "Sibling",
        active: [[0, 0], [1, 0]],
        hot: ["i1"],
        flights: [
          { from: "i1", to: "t_prices", text: "prices", kind: "ref", at: 0.2 },
          { from: "n", to: "pm_total", text: fnv("total"), kind: "fn", at: 1.9 },
        ],
        scan: { ids: ["init", "prices"] },
        marks: [
          { id: "shop", text: "current package", state: "current", at: 0 },
          { id: "prices", text: "sibling found", state: "found" },
        ],
        bind: [{ space: sp("prices", "module shop.prices", "module", "<module shop.prices>"), rows: [R("pm_total", "total", fnv("total"), "fn")] }],
        note: ".prices is the sibling module shop.prices. It is the same target as the absolute form from shop.prices import total.",
      },
      {
        label: "Name",
        active: [[0, 0]],
        hot: ["nm"],
        flights: [{ from: "pm_total", to: "rn_total", text: fnv("total"), kind: "fn", at: 0.3 }],
        dimSpaces: ["prices"],
        bind: [{ space: sp("main", "receipts.py namespace", "program"), rows: [R("rn_total", "total", fnv("total"), "fn")] }],
        note: "total is now a name in receipts.py. Two dots (..) would start from the parent package instead.",
      },
      {
        label: "Call",
        active: [[0, 1], [1, 0], [1, 1]],
        ...callFn({
          file: 1,
          line: 1,
          params: [{ name: "items", from: "a0", text: "[5, 7]", uses: ["u0"] }],
          result: "12",
          call: "c",
          args: ["k0", "a0", "e"],
        }),
        note: "The list [5, 7] flows into items, the body becomes sum([5, 7]), and the result 12 replaces the call.",
      },
      {
        label: "Print",
        active: [[0, 1]],
        flights: [{ from: "c", to: "cons", text: "12", kind: "ret" }],
        out: ["12"],
        note: "print writes 12 to the console. Run the package with python -m, because a relative import needs its package context.",
      },
    ],
  },
  /* 6 Main guard ----------------------------------------------------------- */
  {
    eyebrow: "Main guard",
    title: "The main guard separates running a file from importing it",
    cmd: "python calculator.py",
    tree: [
      { id: "root", name: "project/", depth: 0, tone: "dir", folder: true },
      { id: "calc", name: "calculator.py", depth: 1, tone: "module" },
      { id: "main", name: "main.py", depth: 1, tone: "program" },
    ],
    files: [
      {
        name: "calculator.py",
        tone: "module",
        lines: [
          "def ⟦n:main⟧():",
          '    print(⟦s:"Run the program"⟧)',
          "",
          'if ⟦g:__name__⟧ == ⟦s2:"__main__"⟧:',
          "    ⟦c:main⟧()",
        ],
      },
      { name: "main.py", tone: "program", lines: ["import ⟦m:calculator⟧"] },
    ],
    steps: [
      {
        label: "Run directly",
        active: [],
        flights: [{ from: "t_calc", to: "c_name", text: '"__main__"', kind: "ref", at: 0.3 }],
        marks: [{ id: "calc", text: "entry point", state: "run", at: 0.2 }],
        bind: [{ space: sp("calc", "calculator.py namespace", "program"), rows: [R("c_name", "__name__", '"__main__"', "ref")] }],
        note: "Running a file directly makes Python set __name__ to \"__main__\" before any of its code runs.",
      },
      {
        label: "Define",
        active: [[0, 0], [0, 1]],
        flights: [{ from: "n", to: "c_main", text: fnv("main"), kind: "fn", at: 0.4 }],
        bind: [{ space: sp("calc", "calculator.py namespace", "program"), rows: [R("c_main", "main", fnv("main"), "fn")] }],
        note: "def main() only stores the function. Nothing is printed yet.",
      },
      {
        label: "Guard true",
        active: [[0, 3]],
        flights: [{ from: "c_name", to: "g", text: '"__main__"', kind: "ref", at: 0.2 }],
        swap: { g: { text: '"__main__"', kind: "ref" } },
        badge: { file: 0, line: 3, text: "True", label: "test is", kind: "val", at: 1.3 },
        note: "The guard compares __name__ with \"__main__\". They are equal, so the test is True.",
      },
      {
        label: "Run main",
        active: [[0, 4], [0, 1]],
        flights: [
          { from: "c_main", to: "c", text: fnv("main"), kind: "fn", at: 0.2 },
          { from: "s", to: "cons", text: "Run the program", kind: "ret", at: 1.4 },
        ],
        swap: { c: { text: fnv("main"), kind: "fn" } },
        out: ["Run the program"],
        note: "Because the test was True, main() runs and prints its message.",
      },
      {
        label: "Import",
        active: [[1, 0]],
        cmd: "python main.py",
        reset: true,
        drop: ["g", "c"],
        release: ["calc"],
        flights: [
          { from: "m", to: "t_calc", text: "calculator", kind: "ref", at: 0.2 },
          { from: "sp_calc2", to: "mn_calculator", text: "<module calculator>", kind: "mod", at: 1.5 },
        ],
        marks: [{ id: "calc", text: "imported", state: "found", at: 1.0 }],
        bind: [
          {
            space: sp("calc2", "module calculator", "module", "<module calculator>"),
            rows: [R("c2_name", "__name__", '"calculator"', "ref"), R("c2_main", "main", fnv("main"), "fn")],
          },
          { space: sp("main", "main.py namespace", "program"), rows: [R("mn_calculator", "calculator", "<module calculator>", "mod")] },
        ],
        note: "Now main.py is the entry point and calculator is only imported. The module still runs top to bottom, but its __name__ is \"calculator\".",
      },
      {
        label: "Guard false",
        active: [[0, 3]],
        flights: [{ from: "c2_name", to: "g", text: '"calculator"', kind: "ref", at: 0.2 }],
        swap: { g: { text: '"calculator"', kind: "ref" } },
        badge: { file: 0, line: 3, text: "False", label: "test is", kind: "no", at: 1.3 },
        note: "\"calculator\" is not \"__main__\", so the test is False. main() is skipped and nothing prints, but it stays available as calculator.main().",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(scene: Scene): View[] {
  let swaps: Record<string, Swap> = {};
  let hide: Record<string, number> = {};
  let spaces: Space[] = [];
  let out: string[] = [];
  let cmd = scene.cmd;
  return scene.steps.map((st) => {
    swaps = { ...swaps };
    st.drop?.forEach((k) => delete swaps[k]);
    swaps = { ...swaps, ...st.swap };
    // Names hidden in earlier steps stay hidden; new ones can leave after a delay.
    hide = Object.fromEntries(Object.keys(hide).map((k) => [k, 0]));
    st.hide?.forEach((id) => {
      hide[id] = st.hideAt ?? 0;
    });
    if (st.reset) out = [];
    out = [...out, ...(st.out ?? [])];
    if (st.cmd) cmd = st.cmd;
    const gone = new Set(st.release ?? []);
    spaces = spaces.filter((s) => !gone.has(s.spec.id));
    for (const b of st.bind ?? []) {
      const i = spaces.findIndex((s) => s.spec.id === b.space.id);
      if (i < 0) {
        spaces = [...spaces, { spec: b.space, rows: b.rows }];
      } else {
        spaces = spaces.map((s, k) => {
          if (k !== i) return s;
          const rows = [...s.rows];
          for (const row of b.rows) {
            const at = rows.findIndex((r) => r.id === row.id);
            if (at < 0) rows.push(row);
            else rows[at] = row;
          }
          return { spec: b.space, rows };
        });
      }
    }
    return { swaps, hide, spaces, out, cmd };
  });
}

const findRow = (v: View | undefined, id: string): Row | undefined =>
  v?.spaces.flatMap((s) => s.rows).find((r) => r.id === id);

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
  no: "border-rose-400/40 bg-rose-400/15 text-rose-300",
  mod: "border-amber/40 bg-amber/15 text-amber",
};

const toneText: Record<Tone, string> = {
  module: "text-violet",
  package: "text-amber",
  program: "text-mint",
  stdlib: "text-slate-300",
  dir: "text-slate-400",
};

const toneBorder: Record<Tone, string> = {
  module: "border-violet/30 bg-violet/5",
  package: "border-amber/30 bg-amber/5",
  program: "border-mint/30 bg-mint/5",
  stdlib: "border-white/15 bg-white/5",
  dir: "border-white/10 bg-white/5",
};

const markClass: Record<Mark["state"], string> = {
  found: "border-mint/60 bg-mint/10 text-mint",
  run: "border-amber/60 bg-amber/10 text-amber",
  current: "border-sky-400/60 bg-sky-400/10 text-sky-300",
};

const COLOR: Record<string, string> = {
  n: "text-sky-300",
  c: "text-sky-200",
  e: "text-slate-400",
  k: "text-slate-400",
  d: "text-fuchsia-300",
  a: "text-orange-300",
  p: "text-cyan-200",
  u: "text-cyan-200",
  m: "text-amber-200",
  i: "text-amber-200",
  g: "text-cyan-200",
};
// Markers whose text is tokenized like ordinary code.
const CODE_ROLES = new Set(["s"]);

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

const KEYWORDS = new Set(["def", "return", "import", "from", "as", "if"]);
const BUILTIN_NAMES = new Set(["print", "sum"]);

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
/* Code cards                                                                  */
/* -------------------------------------------------------------------------- */

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
      <motion.span
        initial={fly ? { opacity: 0 } : false}
        animate={fly ? { opacity: 1, scale: [1.25, 1] } : { opacity: 1 }}
        transition={{ delay, duration: 0.25 }}
        className={`${chipBase} ${chipClass[kind]}`}
      >
        {cap && <span className="mr-1.5 text-white/50">{cap} =</span>}
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

    const hideDelay = view.hide[id];
    if (hideDelay === 0 || (hideDelay !== undefined && reduce)) return null;
    const hiding = hideDelay !== undefined;

    const role = id[0];
    const isCode = CODE_ROLES.has(role);
    const hot = !!step.hot?.includes(id);
    const dep = timed.find((t) => t.from === id)?.delay;
    return (
      <motion.span
        key={id}
        ref={reg(id)}
        animate={
          hiding
            ? { opacity: 0, transitionEnd: { display: "none" } }
            : hot && !reduce
              ? { scale: [1, 1.08, 1] }
              : { scale: 1 }
        }
        transition={{ duration: hiding ? 0.25 : 0.8, delay: hiding ? hideDelay : (dep ?? 0.25) }}
        className={`relative -mx-[5px] inline-block rounded-md border px-1 transition-[background-color,border-color] duration-500 ${hot ? chipClass.val : `border-transparent ${isCode ? "" : (COLOR[role] ?? "text-slate-200")}`
          }`}
      >
        {isCode ? tokenize(seg.text, state) : seg.text}
      </motion.span>
    );
  });
}

// The result badge fades in, then dims when its value starts flying away.
function BadgeChip({ badge, ctx }: { badge: Badge; ctx: Ctx }) {
  const at = Math.max(0.05, badge.at ?? 0.2);
  const leave = ctx.timed.find((f) => f.from === "rv")?.delay;
  let anim: { opacity: number | number[] };
  let tr: { duration: number; times?: number[] };
  if (ctx.reduce) {
    anim = { opacity: 1 };
    tr = { duration: 0 };
  } else if (leave !== undefined) {
    const l = Math.max(leave, at + 0.35);
    const end = l + 0.4;
    anim = { opacity: [0, 0, 1, 1, 0.25] };
    tr = {
      duration: end,
      times: [0, at / end, (at + 0.25) / end, l / end, (l + 0.3) / end],
    };
  } else {
    const end = at + 0.5;
    anim = { opacity: [0, 0, 1] };
    tr = { duration: end, times: [0, at / end, 1] };
  }
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={anim}
      transition={tr}
      className="ml-3 inline-flex items-center gap-2 align-middle"
    >
      <span className="text-slate-500">{badge.label ?? "returns"}</span>
      <span ref={ctx.reg("rv")} className={`${chipBase} ${chipClass[badge.kind ?? "ret"]}`}>
        {badge.text}
      </span>
    </motion.span>
  );
}

function CodeLine({ line, fi, li, ctx }: { line: string; fi: number; li: number; ctx: Ctx }) {
  const isActive = ctx.step.active.some(([f, l]) => f === fi && l === li);
  const gutter = (
    <span className="mr-4 w-4 select-none text-right text-xs text-slate-600">{li + 1}</span>
  );
  if (line === "") return <div className="flex h-3 items-center px-2">{gutter}</div>;
  const badge = ctx.step.badge?.file === fi && ctx.step.badge.line === li ? ctx.step.badge : null;

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isActive ? "rgba(64,224,180,0.10)" : "rgba(64,224,180,0)" }}
      transition={{ duration: 0.3 }}
      className="relative flex h-7 items-center rounded-md px-2"
    >
      <motion.span
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-y-1 left-0 w-0.5 rounded bg-mint"
      />
      {gutter}
      <span className="whitespace-pre">
        {renderSegments(line, ctx)}
        {badge && <BadgeChip badge={badge} ctx={ctx} />}
      </span>
    </motion.div>
  );
}

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-slate-900 px-4 py-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      {children}
    </div>
  );
}

function FileCardView({ file, fi, ctx }: { file: FileCard; fi: number; ctx: Ctx }) {
  const live = ctx.step.active.some(([f]) => f === fi);
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border bg-slate-950 shadow-xl transition-colors duration-500 ${live ? "border-mint/40" : "border-white/10"
        }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-1.5">
        <span className={`font-mono text-[11px] ${toneText[file.tone]}`}>{file.name}</span>
        {live && (
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-mint">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="size-1.5 rounded-full bg-mint"
            />
            running
          </span>
        )}
      </div>
      <div className="overflow-x-auto p-2 font-mono text-[13px] text-slate-100">
        <div className="min-w-max">
          {file.lines.map((line, li) => (
            <CodeLine key={li} line={line} fi={fi} li={li} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project tree                                                                */
/* -------------------------------------------------------------------------- */

function TreeRow({ node, ctx, base }: { node: TreeNode; ctx: Ctx; base: number }) {
  const { step, reg, reduce, timed, sid } = ctx;
  const scanIds = step.scan?.ids ?? [];
  const scanIdx = scanIds.indexOf(node.id);
  const mark = step.marks?.find((m) => m.id === node.id);
  const scanEnd = base + scanIds.length * SCAN;
  const markAt = mark?.at ?? (scanIds.length ? scanEnd : landOf(timed, `t_${node.id}`, 0.4));
  const Icon = node.folder ? Folder : FileText;

  return (
    <div
      className="relative flex items-center gap-2 rounded-md py-0.5 pr-2"
      style={{ paddingLeft: 8 + node.depth * 16 }}
    >
      {scanIdx >= 0 && !reduce && (
        <motion.span
          key={`scan:${sid}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: base + scanIdx * SCAN, duration: 0.4 }}
          className="pointer-events-none absolute inset-0 rounded-md bg-white/15"
        />
      )}
      {mark && (
        <motion.span
          key={`mark:${sid}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : markAt, duration: 0.25 }}
          className={`pointer-events-none absolute inset-0 rounded-md border ${markClass[mark.state]}`}
        />
      )}
      <Icon className={`relative size-3.5 shrink-0 ${toneText[node.tone]}`} />
      <span ref={reg(`t_${node.id}`)} className={`relative ${toneText[node.tone]}`}>
        {node.name}
      </span>
      {mark && (
        <motion.span
          key={`tag:${sid}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : markAt, duration: 0.25 }}
          className={`relative ml-auto whitespace-pre text-[9px] tracking-wider ${markClass[mark.state].split(" ").pop()}`}
        >
          {mark.state === "run" ? "● " : ""}
          {mark.text}
        </motion.span>
      )}
    </div>
  );
}

function Tree({ nodes, ctx }: { nodes: TreeNode[]; ctx: Ctx }) {
  const base = scanBase(ctx.step, ctx.timed);
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>project</PanelHeader>
      <div className="flex flex-col gap-0.5 p-2 font-mono text-xs">
        {nodes.map((n) => (
          <TreeRow key={n.id} node={n} ctx={ctx} base={base} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Namespaces                                                                  */
/* -------------------------------------------------------------------------- */

function RowView({ row, ctx }: { row: Row; ctx: Ctx }) {
  const { prev, reg, reduce, timed } = ctx;
  const before = findRow(prev, row.id);
  const isNew = !reduce && !before;
  const land = landOf(timed, row.via ?? row.id, row.at ?? 0.15);
  const changed = !reduce && !!before && before.value !== row.value;

  return (
    <motion.div
      initial={isNew ? { opacity: 0 } : false}
      animate={{ opacity: row.ghost ? 0.75 : 1 }}
      transition={{ delay: isNew ? land : 0, duration: 0.2 }}
      className={`flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 rounded-md border px-2.5 py-1 font-mono text-xs ${row.ghost ? "border-dashed border-rose-400/30" : "border-white/10 bg-slate-900"
        }`}
    >
      <span className={row.ghost ? "text-slate-500 line-through" : row.kind === "fn" ? "text-sky-300" : "text-cyan-200"}>
        {row.name}
      </span>
      <span className="text-slate-500">=</span>
      <motion.span
        key={row.value}
        ref={reg(row.id)}
        initial={changed ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: changed ? land : 0, duration: 0.2 }}
        className={`${chipBase} ${chipClass[row.kind]} ${row.ghost ? "border-dashed" : ""}`}
      >
        {row.value}
      </motion.span>
    </motion.div>
  );
}

function SpaceCard({ space, ctx }: { space: Space; ctx: Ctx }) {
  const { step, prev, reg, reduce, timed } = ctx;
  const { spec } = space;
  const fresh = !reduce && !prev?.spaces.some((s) => s.spec.id === spec.id);
  const dim = !!step.dimSpaces?.includes(spec.id);
  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: dim ? 0.5 : 1 }}
      transition={{ delay: fresh ? landOf(timed, `sp_${spec.id}`, 0.15) : 0, duration: 0.3 }}
      className={`min-w-0 rounded-lg border px-3 py-2 ${toneBorder[spec.tone]}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`font-mono text-[10px] tracking-[0.14em] ${toneText[spec.tone]}`}>{spec.title}</span>
        {spec.obj && (
          <span ref={reg(`sp_${spec.id}`)} className={`${chipBase} ${chipClass.mod}`}>
            {spec.obj}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {space.rows.map((row) => (
          <RowView key={row.id} row={row} ctx={ctx} />
        ))}
      </div>
    </motion.div>
  );
}

function SpacesPanel({ ctx }: { ctx: Ctx }) {
  const { view } = ctx;
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>namespaces</PanelHeader>
      <div className="grid gap-2 p-2.5 sm:grid-cols-2" style={{ minHeight: 150 }}>
        {view.spaces.length === 0 && (
          <div className="flex min-h-[110px] items-center justify-center rounded-lg border border-dashed border-white/10 px-3 text-center font-mono text-xs text-slate-500 sm:col-span-2">
            names appear here as the program runs
          </div>
        )}
        {view.spaces.map((s) => (
          <SpaceCard key={s.spec.id} space={s} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Terminal                                                                    */
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

function Terminal({ ctx }: { ctx: Ctx }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>terminal</PanelHeader>
      <div className="min-h-[84px] p-2.5 font-mono text-sm leading-6">
        <div className="break-all">
          <span className="text-mint">$</span> <span className="text-slate-300">{view.cmd}</span>
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
        {view.out.length === 0 && ctx.step.label === "Guard false" && (
          <div className="min-h-6 text-slate-500">(no output)</div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Flying chip                                                                 */
/* -------------------------------------------------------------------------- */

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
        x: { duration: f.dur, delay: f.delay, ease: "easeInOut" },
        y: { duration: f.dur, delay: f.delay, times: [0, 0.45, 1], ease: "easeInOut" },
        opacity: { duration: f.dur, delay: f.delay, times: [0, 0.1, 0.86, 1] },
        scale: { duration: f.dur, delay: f.delay, times: [0, 0.3, 0.86, 1] },
      }}
    >
      <span className={`${chipBase} ${chipClass[f.kind]}`}>{f.text}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function ModulesPackagesCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [scene, setScene] = useState(0);
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

  const current = scenes[scene];
  const last = current.steps.length - 1;
  const at = Math.min(phase, last);
  const views = useMemo(() => compile(current), [current]);
  const step = current.steps[at];
  const view = views[at];
  const prev = views[at - 1];
  const prevStep = current.steps[at - 1];
  const timed = useMemo(() => timedOf(step), [step]);

  // Autoplay: step through the phases, then move to the next scene.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (at < last) setPhase(at + 1);
      else {
        setScene((value) => (value + 1) % scenes.length);
        setPhase(0);
      }
    }, stepMs(step));
    return () => window.clearTimeout(timer);
  }, [at, playing, scene, last, step]);

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
  }, [scene, at, reduce, timed]);

  const goScene = (target: number) => {
    setPlaying(false);
    setScene((target + scenes.length) % scenes.length);
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

  const ctx: Ctx = { step, prevStep, view, prev, reg, reduce, timed, sid: `${scene}-${at}` };

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[640px] w-full min-w-0 flex-col overflow-hidden px-4 py-4 sm:px-6"
      >
        {/* Fade only (no translate) so measured chip positions stay exact. */}
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full min-w-0 max-w-5xl"
        >
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.2em] text-violet">{current.eyebrow}</p>
            <h3 className="mt-1 text-xl font-light text-foreground">{current.title}</h3>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {current.steps.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => goPhase(i)}
                aria-current={i === at ? "step" : undefined}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors ${i === at
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

          {/* Narration sits above the code so nothing above the editor ever moves. */}
          <div className="mx-auto mt-2 min-h-[72px] max-w-3xl text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${scene}-${at}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-6 text-muted-foreground"
              >
                <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-mint">
                  Step {at + 1}
                </span>
                {step.note}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* md: (768px) instead of lg: (1024px) so the two-column layout applies
              inside a lesson column. minmax(0, ...) stops wide code from pushing
              the grid wider than the page. */}
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-start">
            <Tree nodes={current.tree} ctx={ctx} />
            <div className="flex min-w-0 flex-col gap-3">
              {current.files.map((file, fi) => (
                <FileCardView key={file.name} file={file} fi={fi} ctx={ctx} />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] md:items-start">
            <SpacesPanel ctx={ctx} />
            <Terminal ctx={ctx} />
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={`${scene}-${at}-${f.from}-${f.to}-${f.delay}`} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${((at + 1) / current.steps.length) * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay scene">
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goScene(scene - 1)}
            className={controlBtn}
            aria-label="Previous scene"
          >
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
          <button
            type="button"
            onClick={() => goScene(scene + 1)}
            className={controlBtn}
            aria-label="Next scene"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {scenes.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => goScene(i)}
                aria-label={`Go to scene ${i + 1}: ${s.eyebrow}`}
                className={`h-1.5 rounded-full transition-all ${i === scene ? "w-4 bg-mint" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                  }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {scene + 1} / {scenes.length}
          </span>
        </div>
      </div>
    </div>
  );
}