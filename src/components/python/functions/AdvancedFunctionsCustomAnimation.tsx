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

type Kind = "val" | "fn" | "ret" | "ref" | "no";

// A value that flies between two anchors. Anchors are code markers, memory rows,
// list items ("rowId:index"), the result badge ("rv") or the console line ("cons").
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number; dur?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = {
  id: string;
  name: string;
  kind: Kind;
  value?: string;
  items?: string[];
  via?: string; // the anchor whose arrival makes this row appear
  at?: number;
  note?: string;
};
type Frame = { id: string; title: string; rows: Row[]; empty?: string; at?: number };
type Badge = { line: number; text: string; label?: string; kind?: Kind; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n function name   v name being assigned   u name being read   p parameter
 *   a argument        c call text             e closing paren     r returned name
 *   x loop variable   z zip argument          d decorator
 *   s, f, g literals and keywords, highlighted like normal code
 */
type Step = {
  label: string;
  note: string;
  active: number[];
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  hide?: string[]; // markers removed from the line (kept once hidden)
  bind?: Row[]; // rows added to (or updated in) global memory
  release?: string[];
  frames?: Frame[]; // call frames shown in this step, oldest first
  out?: string[];
  hot?: string[];
  dim?: string[]; // list items shown faded
  dimAt?: number;
  ul?: string[];
  tags?: { id: string; text: string; kind: Kind }[];
  badge?: Badge;
};

type Slide = { eyebrow: string; title: string; lines: string[]; steps: Step[] };

type View = {
  swaps: Record<string, Swap>;
  hide: Set<string>;
  globals: Row[];
  frames: Frame[];
  out: string[];
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
const STAGGER = 0.14;
const LIFT = 0.95; // pause before a return value leaves the function
const CHIP_H = 24;

// Timeline shared by every lambda call: arguments fly into parameters, parameters
// fly into the body, the body result appears as a badge, then the result flies out.
const T = { arg: 0.15, use: 0.95, badge: 1.6, out: 2.0, dur: 0.6 };

const startAt = (n: number) => 0.2 + n * STAGGER;

const timedOf = (s: Step): Timed[] =>
  (s.flights ?? []).map((f, i) => ({ ...f, delay: f.at ?? startAt(i), dur: f.dur ?? FLY }));

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay + f.dur)) - 0.08 : fallback;
};

const stepMs = (s: Step) => {
  const end = Math.max(0, ...timedOf(s).map((f) => f.delay + f.dur));
  return Math.max(2600, end * 1000 + 1300);
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

const L = (id: string, name: string, items: string[], kind: Kind = "val"): Row => ({
  id,
  name,
  items,
  kind,
});

const fnv = (n: string) => `<function ${n}>`;
const none = (id: string, title: string, e = "no locals", at?: number): Frame => ({
  id,
  title,
  rows: [],
  empty: e,
  at,
});
const HIDE = ["a0", "e"];
const bare = (s: string) => s.replace(/"/g, "");

// One flight per list item, from a single source (a literal in the code).
const fill = (from: string, rowId: string, texts: string[]): Flt[] =>
  texts.map((text, i) => ({ from, to: `${rowId}:${i}`, text, kind: "val" }));

const outFlt = (to: string, text: string, kind: Kind = "val", at = T.out): Flt => ({
  from: "rv",
  to,
  text,
  kind,
  at,
  dur: T.dur,
});

type Param = { name: string; from: string; text: string; uses: string[]; kind?: Kind };

// One call of a lambda. Parameter markers must be p0, p1, ... in order.
function lam(
  line: number,
  params: Param[],
  result: { text: string; kind?: Kind },
): { flights: Flt[]; swap: Record<string, Swap>; badge: Badge } {
  const flights: Flt[] = [];
  const swap: Record<string, Swap> = {};
  let n = 0;
  params.forEach((p, i) => {
    const kind = p.kind ?? "val";
    flights.push({ from: p.from, to: `p${i}`, text: p.text, kind, at: T.arg + i * 0.12, dur: T.dur });
    swap[`p${i}`] = { text: p.text, kind, cap: p.name };
    p.uses.forEach((u) => {
      flights.push({ from: `p${i}`, to: u, text: p.text, kind, at: T.use + n * 0.12, dur: T.dur });
      swap[u] = { text: p.text, kind };
      n += 1;
    });
  });
  return {
    flights,
    swap,
    badge: { line, text: result.text, label: "returns", kind: result.kind ?? "ret", at: T.badge },
  };
}

const lamFrame = (
  params: { name: string; value: string }[],
  ret: { text: string; kind?: Kind },
): Frame => ({
  id: "lf",
  title: "lambda call",
  rows: [
    ...params.map((p, i) => R(`lf_${p.name}`, p.name, p.value, "val", { via: `p${i}` })),
    R("lf_ret", "returns", ret.text, ret.kind ?? "ret", { at: T.badge + 0.25 }),
  ],
});

const NUMS = ["1", "2", "3", "4"];
const NUMS6 = ["1", "2", "3", "4", "5", "6"];
const SQUARES = NUMS.map((n) => String(Number(n) ** 2));
const NAMES = ['"Ava"', '"Noah"', '"Mina"'];
const SCORES = ["92", "87", "95"];
const PAIRS = ['("Ava", 92)', '("Noah", 87)', '("Mina", 95)'];

/* -------------------------------------------------------------------------- */
/* Content: map, filter, reduce, zip                                           */
/* -------------------------------------------------------------------------- */

const mapItem = (k: number): Step => {
  const v = NUMS[k];
  const r = SQUARES[k];
  const c = lam(1, [{ name: "number", from: `m_numbers:${k}`, text: v, uses: ["u0", "u1"] }], { text: r });
  return {
    label: `Item ${k + 1}`,
    active: [3, 1],
    swap: c.swap,
    badge: c.badge,
    flights: [...c.flights, outFlt(`m_list:${k}`, r)],
    frames: [lamFrame([{ name: "number", value: v }], { text: r })],
    bind: [L("m_list", "list(squares)", SQUARES.slice(0, k + 1))],
    note: `${v} is passed in as number, the body becomes ${v} * ${v}, and the result ${r} joins the new list.`,
  };
};

const filterItem = (k: number): Step => {
  const v = NUMS6[k];
  const keep = Number(v) % 2 === 0;
  const keptSoFar = NUMS6.slice(0, k + 1).filter((n) => Number(n) % 2 === 0);
  const verdict = keep ? "True" : "False";
  const kind: Kind = keep ? "val" : "no";
  const c = lam(1, [{ name: "number", from: `m_numbers:${k}`, text: v, uses: ["u0"] }], {
    text: verdict,
    kind,
  });
  const dropped = NUMS6.flatMap((n, i) =>
    i <= k && Number(n) % 2 !== 0 ? [`m_numbers:${i}`] : [],
  );
  const toList: Flt[] = keep
    ? [
      {
        from: `m_numbers:${k}`,
        to: `m_list:${keptSoFar.length - 1}`,
        text: v,
        kind: "val",
        at: T.out,
        dur: T.dur,
      },
    ]
    : [];
  return {
    label: `Item ${k + 1}`,
    active: [3, 1],
    swap: c.swap,
    badge: c.badge,
    dim: dropped,
    dimAt: T.out,
    flights: [...c.flights, ...toList],
    frames: [lamFrame([{ name: "number", value: v }], { text: verdict, kind })],
    bind: keptSoFar.length ? [L("m_list", "list(evens)", keptSoFar)] : [],
    note: keep
      ? `${v} % 2 == 0 is True, so ${v} passes the test and is kept.`
      : `${v} % 2 == 0 is False, so ${v} fails the test and is dropped.`,
  };
};

const REDUCE = [
  { cur: "1", curFrom: "m_numbers:0", num: "2", numFrom: "m_numbers:1", res: "3" },
  { cur: "3", curFrom: "m_acc", num: "3", numFrom: "m_numbers:2", res: "6" },
  { cur: "6", curFrom: "m_acc", num: "4", numFrom: "m_numbers:3", res: "10" },
];

const reducePair = (k: number): Step => {
  const p = REDUCE[k];
  const c = lam(
    3,
    [
      {
        name: "current",
        from: p.curFrom,
        text: p.cur,
        kind: p.curFrom === "m_acc" ? "ret" : "val",
        uses: ["u0"],
      },
      { name: "number", from: p.numFrom, text: p.num, uses: ["u1"] },
    ],
    { text: p.res },
  );
  return {
    label: `Pair ${k + 1}`,
    active: [3],
    swap: c.swap,
    badge: c.badge,
    flights: [...c.flights, outFlt("m_acc", p.res, "ret")],
    frames: [
      lamFrame(
        [
          { name: "current", value: p.cur },
          { name: "number", value: p.num },
        ],
        { text: p.res },
      ),
    ],
    bind: [R("m_acc", "running result", p.res, "ret")],
    note:
      k === 0
        ? `The first two items enter the lambda as current and number: ${p.cur} + ${p.num} = ${p.res}.`
        : `The previous result ${p.cur} becomes current and the next item ${p.num} is number: ${p.cur} + ${p.num} = ${p.res}.`,
  };
};

const zipLoop = (k: number): Step => {
  const n = NAMES[k];
  const s = SCORES[k];
  const nb = bare(n);
  const text = `${nb}: ${s}`;
  return {
    label: `Loop ${k + 1}`,
    active: [3, 4],
    dim: PAIRS.flatMap((_, i) => (i < k ? [`m_pairs:${i}`] : [])),
    swap: {
      x0: { text: n, kind: "val" },
      x1: { text: s, kind: "val" },
      u0: { text: nb, kind: "val" },
      u1: { text: s, kind: "val" },
    },
    flights: [
      { from: `m_pairs:${k}`, to: "x0", text: n, kind: "val", at: T.arg, dur: T.dur },
      { from: `m_pairs:${k}`, to: "x1", text: s, kind: "val", at: T.arg + 0.12, dur: T.dur },
      { from: "x0", to: "u0", text: nb, kind: "val", at: T.use, dur: T.dur },
      { from: "x1", to: "u1", text: s, kind: "val", at: T.use + 0.12, dur: T.dur },
      outFlt("cons", text, "ret"),
    ],
    badge: { line: 4, text, label: "prints", kind: "ret", at: T.badge },
    bind: [
      R("m_name", "name", n, "val", { via: "x0" }),
      R("m_score", "score", s, "val", { via: "x1" }),
    ],
    out: [text],
    note:
      k === 0
        ? "The first tuple is unpacked into name and score. Both names in the f-string are then replaced by those values."
        : k === 1
          ? "The next tuple is unpacked and its values flow into the print call."
          : "The last tuple. After it, zip has nothing left to give.",
  };
};

/* -------------------------------------------------------------------------- */
/* Content: recursion                                                          */
/* -------------------------------------------------------------------------- */

const FAC_RET: Record<number, string> = {
  1: "1",
  2: "2 * 1 = 2",
  3: "3 * 2 = 6",
  4: "4 * 6 = 24",
  5: "5 * 24 = 120",
};

const facFrame = (k: number, ret?: string): Frame => ({
  id: `f${k}`,
  title: `factorial(${k})`,
  rows: [
    R(`f${k}_n`, "number", String(k)),
    ...(ret === undefined ? [] : [R(`f${k}_ret`, "returns", ret, "ret")]),
  ],
});

// Frames from factorial(5) down to factorial(upTo), oldest first.
const stack = (upTo: number, rets: Record<number, string> = {}): Frame[] => {
  const out: Frame[] = [];
  for (let k = 5; k >= upTo; k--) out.push(facFrame(k, rets[k]));
  return out;
};

/* -------------------------------------------------------------------------- */
/* Content: slides                                                             */
/* -------------------------------------------------------------------------- */

const slides: Slide[] = [
  /* 1 First-class ---------------------------------------------------------- */
  {
    eyebrow: "Functions are objects",
    title: "A function name can be stored in another variable",
    lines: [
      "def ⟦n:greet⟧():",
      '    print(⟦s1:"Hello, Python"⟧)',
      "",
      "⟦v:message⟧ = ⟦r:greet⟧",
      "⟦c:message()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1],
        ul: ["n"],
        flights: [{ from: "n", to: "m_greet", text: fnv("greet"), kind: "fn" }],
        bind: [R("m_greet", "greet", fnv("greet"), "fn")],
        note: "def creates a function object and binds it to the name greet. The body has not run.",
      },
      {
        label: "Alias",
        active: [3],
        tags: [{ id: "r", text: "no parentheses, no call", kind: "ref" }],
        flights: [{ from: "r", to: "m_message", text: fnv("greet"), kind: "fn" }],
        bind: [R("m_message", "message", fnv("greet"), "fn")],
        note: "Without parentheses greet is not called. message becomes a second name for the same function object.",
      },
      {
        label: "Call",
        active: [4],
        ul: ["c"],
        flights: [{ from: "m_message", to: "c", text: fnv("greet"), kind: "fn", at: 0.2 }],
        frames: [none("fg", "greet()", "no parameters, no locals", 1.0)],
        note: "message() looks up the function object that message refers to and calls it, so greet's body runs.",
      },
      {
        label: "Run",
        active: [1],
        frames: [none("fg", "greet()", "no parameters, no locals")],
        flights: [{ from: "s1", to: "cons", text: "Hello, Python", kind: "ret" }],
        out: ["Hello, Python"],
        note: "The body runs and print writes to the console.",
      },
      {
        label: "Finish",
        active: [4],
        note: "The frame is released. greet and message still refer to the same function object.",
      },
    ],
  },
  /* 2 Lambda --------------------------------------------------------------- */
  {
    eyebrow: "Lambda functions",
    title: "A lambda is a small function with one expression",
    lines: [
      "⟦v:square⟧ = ⟦f:lambda⟧ ⟦p0:number⟧: ⟦u0:number⟧ * ⟦u1:number⟧",
      "",
      "print(⟦c:square(⟧⟦a0:5⟧⟦e:)⟧)",
    ],
    steps: [
      {
        label: "Create",
        active: [0],
        ul: ["f"],
        flights: [{ from: "f", to: "m_square", text: "<lambda>", kind: "fn" }],
        bind: [R("m_square", "square", "<lambda>", "fn")],
        note: "lambda builds an anonymous function object. The assignment gives it the name square. The body does not run yet.",
      },
      {
        label: "Call",
        active: [2, 0],
        hot: ["a0"],
        flights: [
          { from: "m_square", to: "c", text: "<lambda>", kind: "fn", at: 0.2 },
          { from: "a0", to: "p0", text: "5", kind: "val", at: 1.05, dur: 0.7 },
        ],
        swap: { p0: { text: "5", kind: "val", cap: "number" } },
        frames: [
          {
            id: "lf",
            title: "lambda call",
            rows: [R("lf_number", "number", "5", "val", { via: "p0" })],
          },
        ],
        note: "square(5) looks up the function object. The argument 5 is then passed into the parameter number.",
      },
      {
        label: "Fill in",
        active: [0],
        flights: [
          { from: "p0", to: "u0", text: "5", kind: "val", at: 0.2, dur: 0.7 },
          { from: "p0", to: "u1", text: "5", kind: "val", at: 0.34, dur: 0.7 },
        ],
        swap: { u0: { text: "5", kind: "val" }, u1: { text: "5", kind: "val" } },
        frames: [
          {
            id: "lf",
            title: "lambda call",
            rows: [R("lf_number", "number", "5", "val", { via: "p0" })],
          },
        ],
        note: "Every use of number in the body is replaced by 5, so the body becomes 5 * 5.",
      },
      {
        label: "Return",
        active: [0, 2],
        badge: { line: 0, text: "25", label: "returns", kind: "ret", at: 0.3 },
        flights: [outFlt("c", "25", "ret", 1.1), outFlt("lf_ret", "25", "ret", 1.2)],
        swap: { c: { text: "25", kind: "ret" } },
        hide: HIDE,
        frames: [
          {
            id: "lf",
            title: "lambda call",
            rows: [
              R("lf_number", "number", "5", "val", { via: "p0" }),
              R("lf_ret", "returns", "25", "ret"),
            ],
          },
        ],
        note: "5 * 5 is evaluated and returned automatically. A lambda needs no return keyword. The call expression becomes 25.",
      },
      {
        label: "Print",
        active: [2],
        drop: ["p0", "u0", "u1"],
        flights: [{ from: "c", to: "cons", text: "25", kind: "ret" }],
        out: ["25"],
        note: "The frame is released, the lambda goes back to its original form, and print displays 25.",
      },
    ],
  },
  /* 3 map ------------------------------------------------------------------ */
  {
    eyebrow: "map()",
    title: "map applies a function to every item",
    lines: [
      "⟦v0:numbers⟧ = ⟦s0:[1, 2, 3, 4]⟧",
      "⟦v1:squares⟧ = map(⟦f:lambda⟧ ⟦p0:number⟧: ⟦u0:number⟧ * ⟦u1:number⟧, ⟦u2:numbers⟧)",
      "",
      "print(⟦g:list(squares)⟧)",
    ],
    steps: [
      {
        label: "List",
        active: [0],
        flights: fill("s0", "m_numbers", NUMS),
        bind: [L("m_numbers", "numbers", NUMS)],
        note: "numbers is bound to a list of four items.",
      },
      {
        label: "Call map",
        active: [1],
        ul: ["f"],
        flights: [{ from: "f", to: "m_squares", text: "<map object>", kind: "ref" }],
        bind: [R("m_squares", "squares", "<map object>", "ref")],
        note: "map(function, iterable) computes nothing yet. It returns a lazy iterator that remembers the function and the list.",
      },
      ...NUMS.map((_, k) => mapItem(k)),
      {
        label: "Print",
        active: [3],
        drop: ["p0", "u0", "u1"],
        flights: [
          { from: "m_list:0", to: "g", text: "[1, 4, 9, 16]", kind: "ret", at: 0.2 },
          { from: "g", to: "cons", text: "[1, 4, 9, 16]", kind: "ret", at: 1.2 },
        ],
        swap: { g: { text: "[1, 4, 9, 16]", kind: "ret" } },
        out: ["[1, 4, 9, 16]"],
        note: "The finished list is printed. It has one result for every input item.",
      },
    ],
  },
  /* 4 filter --------------------------------------------------------------- */
  {
    eyebrow: "filter()",
    title: "filter keeps only the items that pass a test",
    lines: [
      "⟦v0:numbers⟧ = ⟦s0:[1, 2, 3, 4, 5, 6]⟧",
      "⟦v1:evens⟧ = filter(⟦f:lambda⟧ ⟦p0:number⟧: ⟦u0:number⟧ % 2 == 0, ⟦u1:numbers⟧)",
      "",
      "print(⟦g:list(evens)⟧)",
    ],
    steps: [
      {
        label: "List",
        active: [0],
        flights: fill("s0", "m_numbers", NUMS6),
        bind: [L("m_numbers", "numbers", NUMS6)],
        note: "numbers is bound to a list of six items.",
      },
      {
        label: "Call filter",
        active: [1],
        ul: ["f"],
        flights: [{ from: "f", to: "m_evens", text: "<filter object>", kind: "ref" }],
        bind: [R("m_evens", "evens", "<filter object>", "ref")],
        note: "filter(function, iterable) is lazy too. Nothing is tested until the result is used.",
      },
      ...NUMS6.map((_, k) => filterItem(k)),
      {
        label: "Print",
        active: [3],
        drop: ["p0", "u0"],
        dim: NUMS6.flatMap((n, i) => (Number(n) % 2 !== 0 ? [`m_numbers:${i}`] : [])),
        flights: [
          { from: "m_list:0", to: "g", text: "[2, 4, 6]", kind: "ret", at: 0.2 },
          { from: "g", to: "cons", text: "[2, 4, 6]", kind: "ret", at: 1.2 },
        ],
        swap: { g: { text: "[2, 4, 6]", kind: "ret" } },
        out: ["[2, 4, 6]"],
        note: "The result can be shorter than the input, because only the items that passed the test survive.",
      },
    ],
  },
  /* 5 reduce --------------------------------------------------------------- */
  {
    eyebrow: "reduce()",
    title: "reduce combines items into one value",
    lines: [
      "from functools import reduce",
      "",
      "⟦v0:numbers⟧ = ⟦s0:[1, 2, 3, 4]⟧",
      "⟦v1:total⟧ = reduce(⟦f:lambda⟧ ⟦p0:current⟧, ⟦p1:number⟧: ⟦u0:current⟧ + ⟦u1:number⟧, ⟦u2:numbers⟧)",
      "",
      "print(⟦g:total⟧)",
    ],
    steps: [
      {
        label: "Setup",
        active: [0, 2],
        flights: fill("s0", "m_numbers", NUMS),
        bind: [R("m_reduce", "reduce", fnv("reduce"), "fn"), L("m_numbers", "numbers", NUMS)],
        note: "reduce lives in functools, so it must be imported. numbers is a list of four items.",
      },
      reducePair(0),
      reducePair(1),
      reducePair(2),
      {
        label: "Result",
        active: [3],
        drop: ["p0", "p1", "u0", "u1"],
        flights: [{ from: "m_acc", to: "m_total", text: "10", kind: "ret" }],
        bind: [R("m_total", "total", "10")],
        note: "The items ran out, so reduce returns the running result and total stores it.",
      },
      {
        label: "Print",
        active: [5],
        flights: [
          { from: "m_total", to: "g", text: "10", kind: "val", at: 0.2 },
          { from: "g", to: "cons", text: "10", kind: "ret", at: 1.2 },
        ],
        swap: { g: { text: "10", kind: "val" } },
        out: ["10"],
        note: "print displays the single combined value.",
      },
    ],
  },
  /* 6 zip ------------------------------------------------------------------ */
  {
    eyebrow: "zip()",
    title: "zip pairs items that share a position",
    lines: [
      '⟦v0:names⟧ = ⟦s0:["Ava", "Noah", "Mina"]⟧',
      "⟦v1:scores⟧ = ⟦s1:[92, 87, 95]⟧",
      "",
      "for ⟦x0:name⟧, ⟦x1:score⟧ in zip(⟦z0:names⟧, ⟦z1:scores⟧):",
      '    print(f"⟦u0:{name}⟧: ⟦u1:{score}⟧")',
    ],
    steps: [
      {
        label: "Lists",
        active: [0, 1],
        flights: [
          ...fill("s0", "m_names", NAMES),
          ...fill("s1", "m_scores", SCORES).map((f, i) => ({ ...f, at: startAt(i + 3) })),
        ],
        bind: [L("m_names", "names", NAMES), L("m_scores", "scores", SCORES)],
        note: "Two lists of the same length: names and scores.",
      },
      {
        label: "Pair up",
        active: [3],
        flights: NAMES.flatMap(
          (n, i): Flt[] => [
            { from: `m_names:${i}`, to: `m_pairs:${i}`, text: n, kind: "val", at: 0.2 + i * 0.4 },
            { from: `m_scores:${i}`, to: `m_pairs:${i}`, text: SCORES[i], kind: "val", at: 0.3 + i * 0.4 },
          ],
        ),
        bind: [L("m_pairs", "zip(names, scores)", PAIRS, "ref")],
        note: "zip matches item 1 with item 1, item 2 with item 2, and so on. Each pair is a tuple, handed out one at a time.",
      },
      ...NAMES.map((_, k) => zipLoop(k)),
      {
        label: "Done",
        active: [3],
        drop: ["x0", "x1", "u0", "u1"],
        dim: PAIRS.map((_, i) => `m_pairs:${i}`),
        note: "zip has no pairs left, so the loop ends. name and score keep the values from the last pass.",
      },
    ],
  },
  /* 7 Recursion ------------------------------------------------------------ */
  {
    eyebrow: "Recursion",
    title: "A function can call itself on a smaller problem",
    lines: [
      "def ⟦n:factorial⟧(⟦p0:number⟧):",
      "    if number == 1:",
      "        return 1",
      "",
      "    return ⟦u0:number⟧ * ⟦c1:factorial(⟧number - 1⟦e1:)⟧",
      "",
      "print(⟦c:factorial(⟧⟦a0:5⟧⟦e:)⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0],
        ul: ["n"],
        flights: [{ from: "n", to: "m_factorial", text: fnv("factorial"), kind: "fn" }],
        bind: [R("m_factorial", "factorial", fnv("factorial"), "fn")],
        note: "def stores factorial. Its body contains a call to factorial itself, but nothing runs yet.",
      },
      {
        label: "Call 5",
        active: [6],
        hot: ["a0"],
        frames: stack(5),
        flights: [{ from: "a0", to: "f5_n", text: "5", kind: "val" }],
        note: "factorial(5) creates the first frame. The argument 5 is passed into number.",
      },
      {
        label: "Recurse",
        active: [4],
        ul: ["c1"],
        frames: stack(1),
        flights: [4, 3, 2, 1].map(
          (k, i): Flt => ({
            from: "c1",
            to: `f${k}_n`,
            text: String(k),
            kind: "val",
            at: 0.2 + i * 0.6,
          }),
        ),
        note: "number is not 1, so each call waits for factorial(number - 1). Each smaller value is passed down into a new frame, and five frames pile up.",
      },
      {
        label: "Base case",
        active: [1, 2],
        frames: stack(1, { 1: FAC_RET[1] }),
        badge: { line: 2, text: "1", label: "base case returns", kind: "ret", at: 0.3 },
        note: "When number == 1, the base case returns 1 without another call. This is what stops the recursion.",
      },
      {
        label: "Unwind",
        active: [4],
        frames: stack(1, FAC_RET),
        flights: [1, 2, 3, 4].map(
          (k, i): Flt => ({
            from: `f${k}_ret`,
            to: `f${k + 1}_ret`,
            text: String([1, 2, 6, 24][i]),
            kind: "ret",
            at: 0.2 + i * 0.82,
          }),
        ),
        note: "Each waiting frame receives the smaller answer and multiplies it by its own number: 2 x 1, 3 x 2, 4 x 6, 5 x 24.",
      },
      {
        label: "Return",
        active: [6],
        frames: [facFrame(5, FAC_RET[5])],
        flights: [{ from: "f5_ret", to: "c", text: "120", kind: "ret", at: 0.3 }],
        swap: { c: { text: "120", kind: "ret" } },
        hide: HIDE,
        note: "The outermost call finishes with 120, and the call expression becomes that value.",
      },
      {
        label: "Print",
        active: [6],
        flights: [{ from: "c", to: "cons", text: "120", kind: "ret" }],
        out: ["120"],
        note: "The stack is empty again and print displays 120.",
      },
    ],
  },
  /* 8 Closure -------------------------------------------------------------- */
  {
    eyebrow: "Closures",
    title: "A returned function remembers its outer value",
    lines: [
      "def ⟦n0:multiplier⟧(⟦p0:number⟧):",
      "    def ⟦n1:multiply⟧(⟦p1:value⟧):",
      "        return ⟦u1:value⟧ * ⟦u0:number⟧",
      "",
      "    return ⟦r:multiply⟧",
      "",
      "⟦v:double⟧ = ⟦c:multiplier(⟧⟦a0:2⟧⟦e:)⟧",
      "print(⟦c2:double(⟧⟦a1:5⟧⟦e2:)⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0],
        ul: ["n0"],
        flights: [{ from: "n0", to: "m_multiplier", text: fnv("multiplier"), kind: "fn" }],
        bind: [R("m_multiplier", "multiplier", fnv("multiplier"), "fn")],
        note: "def stores multiplier. The inner function does not exist until multiplier runs.",
      },
      {
        label: "Call",
        active: [6, 0],
        hot: ["a0"],
        frames: [
          { id: "fm", title: "multiplier()", rows: [R("f_number", "number", "2", "val", { via: "p0" })] },
        ],
        flights: [
          { from: "m_multiplier", to: "c", text: fnv("multiplier"), kind: "fn", at: 0.2 },
          { from: "a0", to: "p0", text: "2", kind: "val", at: 1.05, dur: 0.7 },
        ],
        swap: { p0: { text: "2", kind: "val", cap: "number" } },
        note: "multiplier(2) looks up the function, then passes the argument 2 into the parameter number.",
      },
      {
        label: "Inner def",
        active: [1],
        frames: [
          {
            id: "fm",
            title: "multiplier()",
            rows: [
              R("f_number", "number", "2", "val", { via: "p0" }),
              R("f_multiply", "multiply", fnv("multiply"), "fn"),
            ],
          },
        ],
        flights: [{ from: "n1", to: "f_multiply", text: fnv("multiply"), kind: "fn" }],
        note: "Running the def line creates the inner function and binds it inside multiplier's frame.",
      },
      {
        label: "Return fn",
        active: [4, 6],
        frames: [
          {
            id: "fm",
            title: "multiplier()",
            rows: [
              R("f_number", "number", "2", "val", { via: "p0" }),
              R("f_multiply", "multiply", fnv("multiply"), "fn"),
            ],
          },
        ],
        badge: { line: 4, text: fnv("multiply"), label: "returns", kind: "fn", at: 0.3 },
        flights: [outFlt("c", fnv("multiply"), "fn", LIFT)],
        swap: { c: { text: fnv("multiply"), kind: "fn" } },
        hide: HIDE,
        bind: [R("m_double", "double", fnv("multiply"), "fn", { via: "c" })],
        note: "return multiply hands back the function itself, not a call to it. double now refers to it.",
      },
      {
        label: "Closure",
        active: [6],
        drop: ["p0"],
        flights: [{ from: "c", to: "m_cell", text: "number = 2", kind: "ref" }],
        bind: [R("m_cell", "double.__closure__", "number = 2", "ref")],
        note: "multiplier's frame is gone, but multiply keeps number = 2 alive. That remembered value is the closure.",
      },
      {
        label: "Call double",
        active: [7, 1],
        hot: ["a1"],
        frames: [
          { id: "fd", title: "multiply()", rows: [R("f_value", "value", "5", "val", { via: "p1" })] },
        ],
        flights: [
          { from: "m_double", to: "c2", text: fnv("multiply"), kind: "fn", at: 0.2 },
          { from: "a1", to: "p1", text: "5", kind: "val", at: 1.05, dur: 0.7 },
        ],
        swap: { p1: { text: "5", kind: "val", cap: "value" } },
        note: "double(5) runs multiply and passes the argument 5 into the parameter value.",
      },
      {
        label: "Run",
        active: [2],
        frames: [
          { id: "fd", title: "multiply()", rows: [R("f_value", "value", "5", "val", { via: "p1" })] },
        ],
        flights: [
          { from: "p1", to: "u1", text: "5", kind: "val", at: 0.2, dur: 0.7 },
          { from: "m_cell", to: "u0", text: "2", kind: "ref", at: 0.34, dur: 0.7 },
        ],
        swap: { u1: { text: "5", kind: "val" }, u0: { text: "2", kind: "ref" } },
        note: "value is local. number is neither local nor global, so Python finds it in the closure.",
      },
      {
        label: "Return",
        active: [2, 7],
        frames: [
          { id: "fd", title: "multiply()", rows: [R("f_value", "value", "5", "val", { via: "p1" })] },
        ],
        badge: { line: 2, text: "10", label: "returns", kind: "ret", at: 0.3 },
        flights: [
          outFlt("c2", "10", "ret", 1.1),
          { from: "c2", to: "cons", text: "10", kind: "ret", at: 2.1 },
        ],
        swap: { c2: { text: "10", kind: "ret" } },
        hide: ["a1", "e2"],
        out: ["10"],
        note: "5 * 2 = 10 is returned, and print displays it.",
      },
    ],
  },
  /* 9 Decorator ------------------------------------------------------------ */
  {
    eyebrow: "Decorators",
    title: "A decorator wraps a function with extra behavior",
    lines: [
      "def ⟦n0:announce⟧(⟦p0:function⟧):",
      "    def ⟦n1:wrapper⟧():",
      '        print(⟦s1:"Starting"⟧)',
      "        return ⟦u0:function⟧()",
      "",
      "    return wrapper",
      "",
      "⟦d:@announce⟧",
      "def ⟦n2:greet⟧():",
      '    print(⟦s2:"Hello"⟧)',
      "",
      "⟦c:greet()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0],
        ul: ["n0"],
        flights: [{ from: "n0", to: "m_announce", text: fnv("announce"), kind: "fn" }],
        bind: [R("m_announce", "announce", fnv("announce"), "fn")],
        note: "announce is a higher-order function: it receives a function and will return another one.",
      },
      {
        label: "Create greet",
        active: [8, 9],
        ul: ["n2"],
        flights: [{ from: "n2", to: "m_greet", text: fnv("greet"), kind: "fn" }],
        bind: [R("m_greet", "greet", fnv("greet"), "fn")],
        note: "def greet builds the original function. The @announce line above it is about to wrap it.",
      },
      {
        label: "Apply @",
        active: [7, 0],
        hot: ["d"],
        tags: [{ id: "d", text: "greet = announce(greet)", kind: "ref" }],
        frames: [
          {
            id: "fa",
            title: "announce()",
            rows: [R("f_function", "function", fnv("greet"), "fn", { via: "p0" })],
          },
        ],
        flights: [{ from: "m_greet", to: "p0", text: fnv("greet"), kind: "fn", at: 0.5 }],
        swap: { p0: { text: fnv("greet"), kind: "fn", cap: "function" } },
        note: "@announce passes the original greet into announce as the parameter function.",
      },
      {
        label: "Wrapper",
        active: [1, 5],
        frames: [
          {
            id: "fa",
            title: "announce()",
            rows: [
              R("f_function", "function", fnv("greet"), "fn", { via: "p0" }),
              R("f_wrapper", "wrapper", fnv("wrapper"), "fn"),
            ],
          },
        ],
        flights: [{ from: "n1", to: "f_wrapper", text: fnv("wrapper"), kind: "fn" }],
        note: "announce defines wrapper, which will use function from the enclosing scope.",
      },
      {
        label: "Rebind",
        active: [5, 7],
        frames: [
          {
            id: "fa",
            title: "announce()",
            rows: [
              R("f_function", "function", fnv("greet"), "fn", { via: "p0" }),
              R("f_wrapper", "wrapper", fnv("wrapper"), "fn"),
            ],
          },
        ],
        badge: { line: 5, text: fnv("wrapper"), label: "returns", kind: "fn", at: 0.3 },
        flights: [outFlt("m_greet", fnv("wrapper"), "fn", LIFT)],
        bind: [
          R("m_greet", "greet", fnv("wrapper"), "fn"),
          R("m_cell", "greet.__closure__", `function = ${fnv("greet")}`, "ref", { via: "m_greet" }),
        ],
        note: "announce returns wrapper, and the name greet now refers to it. The original greet lives on inside wrapper's closure.",
      },
      {
        label: "Call",
        active: [11],
        ul: ["c"],
        drop: ["p0"],
        flights: [{ from: "m_greet", to: "c", text: fnv("wrapper"), kind: "fn", at: 0.2 }],
        frames: [none("fw", "wrapper()", "no locals", 1.0)],
        note: "greet() now calls wrapper, because that is what the name greet refers to.",
      },
      {
        label: "Before",
        active: [2],
        frames: [none("fw", "wrapper()", "no locals")],
        flights: [{ from: "s1", to: "cons", text: "Starting", kind: "ret" }],
        out: ["Starting"],
        note: "wrapper adds its own behavior first: it prints Starting.",
      },
      {
        label: "Original",
        active: [3, 9],
        frames: [none("fw", "wrapper()", "no locals"), none("fg", "greet()", "no locals", 1.4)],
        flights: [
          { from: "m_cell", to: "u0", text: fnv("greet"), kind: "fn", at: 0.2 },
          { from: "s2", to: "cons", text: "Hello", kind: "ret", at: 1.6 },
        ],
        swap: { u0: { text: fnv("greet"), kind: "fn" } },
        out: ["Hello"],
        note: "wrapper then calls the original greet, found through the closure. It prints Hello.",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(slide: Slide): View[] {
  let swaps: Record<string, Swap> = {};
  let hide = new Set<string>();
  let out: string[] = [];
  let globals: Row[] = [];
  return slide.steps.map((st) => {
    swaps = { ...swaps };
    st.drop?.forEach((k) => delete swaps[k]);
    swaps = { ...swaps, ...st.swap };
    hide = new Set([...hide, ...(st.hide ?? [])]);
    out = [...out, ...(st.out ?? [])];
    const gone = new Set(st.release ?? []);
    globals = globals.filter((r) => !gone.has(r.id));
    for (const row of st.bind ?? []) {
      globals = globals.some((r) => r.id === row.id)
        ? globals.map((r) => (r.id === row.id ? row : r))
        : [...globals, row];
    }
    return { swaps, hide, globals, frames: st.frames ?? [], out };
  });
}

const findRow = (v: View | undefined, id: string): Row | undefined =>
  v?.globals.find((r) => r.id === id) ?? v?.frames.flatMap((f) => f.rows).find((r) => r.id === id);

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
};

const COLOR: Record<string, string> = {
  n: "text-sky-300",
  c: "text-sky-200",
  e: "text-sky-200",
  d: "text-fuchsia-300",
  a: "text-orange-300",
  p: "text-cyan-200",
  u: "text-cyan-200",
  v: "text-cyan-200",
  x: "text-cyan-200",
  z: "text-cyan-200",
  r: "text-cyan-200",
};
// Markers whose text is tokenized like ordinary code.
const CODE_ROLES = new Set(["s", "f", "g"]);

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

const KEYWORDS = new Set(["def", "return", "lambda", "if", "for", "in", "from", "import"]);
const BUILTIN_NAMES = new Set(["print", "list", "map", "filter", "reduce", "zip"]);

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
    if (view.hide.has(id)) return null;

    const role = id[0];
    const isCode = CODE_ROLES.has(role);
    const hot = !!step.hot?.includes(id);
    const dep = timed.find((t) => t.from === id)?.delay;
    const tag = step.tags?.find((t) => t.id === id);
    const underline = step.ul?.includes(id)
      ? "underline decoration-dashed decoration-cyan-300/60 underline-offset-4"
      : "";
    return (
      <motion.span
        key={id}
        ref={reg(id)}
        animate={hot && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, delay: dep ?? 0.25 }}
        className={`relative -mx-[5px] inline-block rounded-md border px-1 transition-[opacity,background-color,border-color] duration-500 ${hot ? chipClass.val : `border-transparent ${isCode ? "" : (COLOR[role] ?? "text-slate-200")}`
          } ${underline}`}
      >
        {isCode ? tokenize(seg.text, state) : seg.text}
        {tag && (
          <motion.span
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.25 }}
            className="pointer-events-none absolute -top-[27px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
          >
            <span
              className={`whitespace-pre rounded border bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] leading-none tracking-wider ${chipClass[tag.kind]}`}
            >
              {tag.text}
            </span>
            <span className={`-mt-px text-[9px] leading-none ${chipClass[tag.kind].split(" ").pop()}`}>
              ▼
            </span>
          </motion.span>
        )}
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

function CodeLine({ line, index, ctx }: { line: string; index: number; ctx: Ctx }) {
  const isActive = ctx.step.active.includes(index);
  const gutter = (
    <span className="mr-4 w-4 select-none text-right text-xs text-slate-600">{index + 1}</span>
  );
  if (line === "") return <div className="flex h-3 items-center px-2">{gutter}</div>;
  const badge = ctx.step.badge?.line === index ? ctx.step.badge : null;

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
    <div className="border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      {children}
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

function Terminal({ ctx, rows }: { ctx: Ctx; rows: number }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div
      className="border-t border-white/10 px-4 py-3 font-mono text-sm leading-6"
      style={{ minHeight: 64 + rows * 24 }}
    >
      <p className="mb-1 text-[10px] tracking-[0.16em] text-slate-500">terminal</p>
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
  );
}

function CodeEditor({ lines, ctx, rows }: { lines: string[]; ctx: Ctx; rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className="overflow-x-auto p-3 pt-4 font-mono text-[13px] text-slate-100">
        <div className="min-w-max">
          {lines.map((line, i) => (
            <CodeLine key={i} line={line} index={i} ctx={ctx} />
          ))}
        </div>
      </div>
      <Terminal ctx={ctx} rows={rows} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Memory                                                                      */
/* -------------------------------------------------------------------------- */

const rowBox =
  "flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-xs";
const rowInline = "inline-flex items-center gap-1.5 font-mono text-xs";

function RowView({ row, ctx, inline }: { row: Row; ctx: Ctx; inline?: boolean }) {
  const { step, prevStep, prev, reg, reduce, timed, sid } = ctx;
  const before = findRow(prev, row.id);
  const isNew = !reduce && !before;
  const land = landOf(timed, row.via ?? row.id, row.at ?? 0.15);
  const changed = !reduce && !!before && before.value !== row.value;

  return (
    <motion.div
      initial={isNew ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      // Lists fade in quickly; their items land one by one.
      transition={{ delay: isNew && !row.items ? land : 0, duration: 0.2 }}
      className={inline ? rowInline : rowBox}
    >
      <span className={row.kind === "fn" ? "text-sky-300" : "text-cyan-200"}>{row.name}</span>
      <span className="text-slate-500">=</span>
      {row.items ? (
        <span className="flex flex-wrap items-center gap-1">
          <span className="text-slate-500">[</span>
          {row.items.map((item, i) => {
            const id = `${row.id}:${i}`;
            const fresh = !reduce && !(before?.items && before.items[i] === item);
            const faded = !!step.dim?.includes(id);
            const wasFaded = !!prevStep?.dim?.includes(id);
            const dep = timed.find((t) => t.from === id)?.delay;
            const pulse = dep !== undefined && !reduce;
            return (
              <motion.span
                // A source item remounts each step so its pulse plays again.
                key={`${i}:${item}:${pulse ? sid : ""}`}
                ref={reg(id)}
                initial={fresh ? { opacity: 0 } : false}
                animate={{ opacity: faded ? 0.3 : 1, scale: pulse ? [1, 1.18, 1] : 1 }}
                transition={{
                  opacity: {
                    delay: fresh ? landOf(timed, id) : faded && !wasFaded ? (step.dimAt ?? 0) : 0,
                    duration: 0.2,
                  },
                  scale: { delay: dep ?? 0, duration: 0.45 },
                }}
                className={`${chipBase} ${chipClass[row.kind]} ${faded ? "line-through" : ""}`}
              >
                {item}
              </motion.span>
            );
          })}
          <span className="text-slate-500">]</span>
        </span>
      ) : (
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
      )}
      {row.note && <span className="ml-auto text-[10px] tracking-wider text-slate-500">{row.note}</span>}
    </motion.div>
  );
}

function MemoryPanel({ ctx }: { ctx: Ctx }) {
  const { view, prev, reduce, timed } = ctx;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>memory</PanelHeader>
      <div className="grid gap-4 p-3 md:grid-cols-2" style={{ minHeight: 210 }}>
        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">globals</p>
          <div className="flex flex-col gap-1.5">
            {view.globals.length === 0 && (
              <div className="flex min-h-9 items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-xs text-slate-500">
                nothing stored yet
              </div>
            )}
            {view.globals.map((row) => (
              <RowView key={row.id} row={row} ctx={ctx} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">call stack</p>
          <div className="flex flex-col gap-1.5">
            {view.frames.length === 0 && (
              <div className="flex min-h-[64px] items-center justify-center rounded-lg border border-dashed border-white/10 px-3 text-center font-mono text-xs text-slate-500">
                no active call
              </div>
            )}
            {/* Newest frame on top, like a stack. */}
            {[...view.frames].reverse().map((frame) => {
              const fresh = !reduce && !prev?.frames.some((f) => f.id === frame.id);
              const first = frame.rows[0];
              const land = frame.at ?? landOf(timed, first?.via ?? first?.id ?? "", 0.15);
              return (
                <motion.div
                  key={frame.id}
                  initial={fresh ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fresh ? land : 0, duration: 0.2 }}
                  className="rounded-lg border border-violet/30 bg-violet/5 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                    <span className="font-mono text-[10px] tracking-[0.14em] text-violet">
                      {frame.title}
                    </span>
                    {frame.rows.length === 0 && (
                      <span className="font-mono text-[11px] text-slate-500">{frame.empty}</span>
                    )}
                    {frame.rows.map((row) => (
                      <RowView key={row.id} row={row} ctx={ctx} inline />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
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

export function AdvancedFunctionsCustomAnimation() {
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
  const last = current.steps.length - 1;
  const at = Math.min(phase, last);
  const views = useMemo(() => compile(current), [current]);
  const step = current.steps[at];
  const view = views[at];
  const prev = views[at - 1];
  const prevStep = current.steps[at - 1];
  const timed = useMemo(() => timedOf(step), [step]);
  const termRows = useMemo(() => Math.max(1, ...views.map((v) => v.out.length)), [views]);

  // Autoplay: step through the phases, then move to the next example.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (at < last) setPhase(at + 1);
      else {
        setSlide((value) => (value + 1) % slides.length);
        setPhase(0);
      }
    }, stepMs(step));
    return () => window.clearTimeout(timer);
  }, [at, playing, slide, last, step]);

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
  }, [slide, at, reduce, timed]);

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

  const ctx: Ctx = { step, prevStep, view, prev, reg, reduce, timed, sid: `${slide}-${at}` };

  return (
    <div className="flex w-full flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[720px] w-full flex-col overflow-hidden px-5 py-8 sm:px-8"
      >
        {/* Fade only (no translate) so measured chip positions stay exact. */}
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full max-w-5xl"
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
          <div className="mx-auto mt-4 min-h-[56px] max-w-3xl text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${slide}-${at}`}
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

          <div className="mt-2 flex flex-col gap-4">
            <CodeEditor lines={current.lines} ctx={ctx} rows={termRows} />
            <MemoryPanel ctx={ctx} />
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={`${slide}-${at}-${f.from}-${f.to}-${f.delay}`} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${((at + 1) / current.steps.length) * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay example">
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goSlide(slide - 1)}
            className={controlBtn}
            aria-label="Previous example"
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
            onClick={() => goSlide(slide + 1)}
            className={controlBtn}
            aria-label="Next example"
          >
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