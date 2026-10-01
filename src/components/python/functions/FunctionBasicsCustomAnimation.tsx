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

type Kind = "arg" | "fn" | "ret" | "doc" | "type";

// A value that flies from one anchor to another. Anchors are marker ids in the
// code, memory row ids, or "cons" / "cons1" (the console line being written).
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = { id: string; name: string; value: string; kind: Kind; note?: string; at?: number; via?: string };
type Frame = { title: string; rows: Row[]; empty?: string } | null;

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n function name   p parameter   u parameter used in body   a argument
 *   c call text       e closing paren   k separator   t type hint   d docstring
 *   v, x, g, r, q variables and expressions   s string (highlighted normally)
 */
type Step = {
  label: string;
  note: string;
  active: number[];
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  hide?: string[]; // markers removed from the line (kept once hidden)
  globals?: Row[]; // rows added to global memory (kept)
  frame?: Frame; // the call frame shown in this step
  out?: string[]; // console lines added (kept)
  hot?: string[];
  dim?: string[];
  ul?: string[];
  tags?: { id: string; text: string; kind: Kind }[]; // labels pointing at a token
  badge?: { line: number; text: string; label?: string };
};

type Slide = { eyebrow: string; title: string; lines: string[]; steps: Step[] };

type View = {
  swaps: Record<string, Swap>;
  hide: Set<string>;
  globals: Row[];
  out: string[];
  frame: Frame;
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
const LIFT = 0.95; // pause before a return value leaves the function
const RET = LIFT + FLY - 0.08; // when a returned value lands
const CHIP_H = 24;

const startAt = (n: number) => 0.2 + n * STAGGER;

const timedOf = (s: Step): Timed[] =>
  (s.flights ?? []).map((f, i) => ({ ...f, delay: f.at ?? startAt(i) }));

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay)) + FLY - 0.08 : fallback;
};

const stepMs = (s: Step) => {
  const last = Math.max(0, ...timedOf(s).map((f) => f.delay));
  return Math.max(2400, (last + FLY) * 1000 + 1600);
};

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const fnv = (n: string) => `<function ${n}>`;
const emptyFrame = (title: string, empty = "no parameters, no locals"): Frame => ({ title, rows: [], empty });
const HIDE_CALL = ["a0", "k", "a1", "e"];

// The Define step is the same shape everywhere: the name flies into memory.
const D = (n: string) => ({
  flights: [{ from: "n", to: `m_${n}`, text: fnv(n), kind: "fn" as const }],
  globals: [{ id: `m_${n}`, name: n, value: fnv(n), kind: "fn" as const }],
  ul: ["n"],
});

const F3: Frame = {
  title: "welcome()",
  rows: [{ id: "f_name", name: "name", value: '"Noah"', kind: "arg", note: "parameter", via: "p0" }],
};
const F5: Frame = {
  title: "add()",
  rows: [
    { id: "f_a", name: "a", value: "10", kind: "arg", note: "parameter", via: "p0" },
    { id: "f_b", name: "b", value: "20", kind: "arg", note: "parameter", via: "p1" },
  ],
};
const F5R: Frame = {
  title: "add()",
  rows: [...F5.rows, { id: "f_result", name: "result", value: "30", kind: "ret", note: "local", at: 1.25 }],
};
const F6: Frame = {
  title: "calculate()",
  rows: [
    { id: "f_a", name: "a", value: "20", kind: "arg", note: "parameter", via: "p0" },
    { id: "f_b", name: "b", value: "10", kind: "arg", note: "parameter", via: "p1" },
  ],
};
const F7: Frame = {
  title: "calculate_area()",
  rows: [
    { id: "f_length", name: "length", value: "4", kind: "arg", note: "parameter", via: "p0" },
    { id: "f_width", name: "width", value: "3", kind: "arg", note: "parameter", via: "p1" },
  ],
};
const F8: Frame = {
  title: "add()",
  rows: [
    { id: "f_a", name: "a", value: "10", kind: "arg", note: "parameter", via: "p0" },
    { id: "f_b", name: "b", value: "20", kind: "arg", note: "parameter", via: "p1" },
  ],
};

const DOC = '"Return the area of a rectangle."';
const ANN = "{'a': int, 'b': int, 'return': int}";

// Bind: the call's arguments fly into the parameter slots. Same shape on every slide.
const bind2 = (a: string, b: string, ca: string, cb: string) => ({
  hot: ["a0", "a1"],
  dim: ["a0", "a1"],
  flights: [
    { from: "a0", to: "p0", text: a, kind: "arg" as const },
    { from: "a1", to: "p1", text: b, kind: "arg" as const },
  ],
  swap: { p0: { text: a, kind: "arg" as const, cap: ca }, p1: { text: b, kind: "arg" as const, cap: cb } },
});

const slides: Slide[] = [
  /* 1 ---------------------------------------------------------------------- */
  {
    eyebrow: "Define and call",
    title: "A function body runs only when it is called",
    lines: ["def ⟦n:greet⟧():", '    print(⟦s1:"Hello, welcome to Python"⟧)', "", "⟦c:greet()⟧"],
    steps: [
      { ...D("greet"), label: "Define", active: [0, 1], note: "def stores a function named greet. Nothing is printed yet because the body has not run." },
      { label: "Call", active: [3], ul: ["c"], frame: emptyFrame("greet()"), note: "The parentheses make this a call. Python looks up greet and jumps into its body." },
      {
        label: "Run", active: [1], frame: emptyFrame("greet()"),
        flights: [{ from: "s1", to: "cons", text: "Hello, welcome to Python", kind: "ret" }],
        out: ["Hello, welcome to Python"],
        note: "The body runs from top to bottom. print writes its text to the console.",
      },
      { label: "Finish", active: [3], note: "The body ended and its frame is released. Python carries on after the call." },
    ],
  },
  /* 2 ---------------------------------------------------------------------- */
  {
    eyebrow: "Parameters and arguments",
    title: "The parameter is the name, the argument is the value",
    lines: [
      "def ⟦n:welcome⟧(⟦p0:name⟧):",
      '    print(⟦s1:"Welcome,"⟧, ⟦u0:name⟧)',
      "",
      '⟦c:welcome(⟧⟦a0:"Noah"⟧⟦e:)⟧',
    ],
    steps: [
      {
        ...D("welcome"), ul: ["n", "p0"], label: "Define", active: [0, 1],
        tags: [{ id: "p0", text: "parameter", kind: "type" }],
        note: "name is a parameter: a placeholder written in the definition. It has no value yet.",
      },
      {
        label: "Call", active: [3], hot: ["a0"],
        tags: [
          { id: "p0", text: "parameter", kind: "type" },
          { id: "a0", text: "argument", kind: "arg" },
        ],
        note: '"Noah" is an argument: the actual value supplied by the call. Python is about to hand it to the parameter.',
      },
      {
        label: "Bind", active: [0], hot: ["a0"], dim: ["a0"], frame: F3,
        flights: [{ from: "a0", to: "p0", text: '"Noah"', kind: "arg" }],
        swap: { p0: { text: '"Noah"', kind: "arg", cap: "name" } },
        note: 'The argument "Noah" is copied into the parameter name inside a new frame.',
      },
      {
        label: "Run", active: [1], dim: ["a0"], frame: F3,
        flights: [{ from: "p0", to: "u0", text: '"Noah"', kind: "arg" }],
        swap: { u0: { text: '"Noah"', kind: "arg" } },
        note: "Every use of name in the body now reads Noah.",
      },
      {
        label: "Print", active: [1], dim: ["a0"], frame: F3,
        flights: [{ from: "s1", to: "cons", text: "Welcome, Noah", kind: "ret" }],
        out: ["Welcome, Noah"],
        note: "print joins its values with a space and writes the line to the console.",
      },
      { label: "Finish", active: [3], drop: ["p0", "u0"], note: "The call ends. The frame and its name variable are released." },
    ],
  },
  /* 3 ---------------------------------------------------------------------- */
  {
    eyebrow: "Empty functions",
    title: "pass keeps a planned function valid",
    lines: ["def ⟦n:save_draft⟧():", "    pass", "", "⟦c:save_draft()⟧", 'print(⟦s1:"Program continues"⟧)'],
    steps: [
      { ...D("save_draft"), label: "Define", active: [0, 1], note: "A body cannot be empty. pass is a real statement that does nothing, so this definition is valid." },
      { label: "Call", active: [3], ul: ["c"], frame: emptyFrame("save_draft()", "no locals"), note: "The call jumps into the function like any other." },
      { label: "Run", active: [1], frame: emptyFrame("save_draft()", "no locals"), note: "pass runs and does nothing. There is no output and nothing new in memory." },
      {
        label: "Continue", active: [4],
        flights: [{ from: "s1", to: "cons", text: "Program continues", kind: "ret" }],
        out: ["Program continues"],
        note: "Control returns to the caller and the program carries on. You can fill in the real logic later.",
      },
    ],
  },
  /* 4 ---------------------------------------------------------------------- */
  {
    eyebrow: "Return values",
    title: "return sends a value back and ends the call",
    lines: [
      "def ⟦n:add⟧(⟦p0:a⟧, ⟦p1:b⟧):",
      "    ⟦v:result⟧ = ⟦u0:a⟧ + ⟦u1:b⟧",
      "    return ⟦r:result⟧",
      "",
      "⟦x:answer⟧ = ⟦c:add(⟧⟦a0:10⟧⟦k:, ⟧⟦a1:20⟧⟦e:)⟧",
      "print(⟦g:answer⟧)",
    ],
    steps: [
      { ...D("add"), ul: ["n", "p0", "p1"], label: "Define", active: [0, 1, 2], note: "def stores add. The parameters a and b are only placeholders for now." },
      { label: "Call", active: [4], hot: ["a0", "a1"], note: "Python evaluates the arguments 10 and 20, then calls add." },
      { ...bind2("10", "20", "a", "b"), label: "Bind", active: [0], frame: F5, note: "10 goes to a and 20 goes to b, matched by position." },
      {
        label: "Run", active: [1], dim: ["a0", "a1"], frame: F5R,
        flights: [
          { from: "p0", to: "u0", text: "10", kind: "arg" },
          { from: "p1", to: "u1", text: "20", kind: "arg" },
        ],
        swap: { u0: { text: "10", kind: "arg" }, u1: { text: "20", kind: "arg" } },
        note: "The body computes 10 + 20 and stores 30 in the local variable result.",
      },
      {
        label: "Return", active: [2, 4], frame: F5R,
        badge: { line: 2, text: "30", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "30", kind: "ret", at: LIFT }],
        swap: { c: { text: "30", kind: "ret" } },
        hide: HIDE_CALL,
        globals: [{ id: "m_answer", name: "answer", value: "30", kind: "ret", at: RET }],
        note: "return hands 30 back and ends the call. The whole call expression becomes 30, and answer stores it.",
      },
      {
        label: "Print", active: [5], drop: ["p0", "p1", "u0", "u1"],
        flights: [
          { from: "c", to: "g", text: "30", kind: "ret" },
          { from: "g", to: "cons", text: "30", kind: "ret", at: 1.1 },
        ],
        swap: { g: { text: "30", kind: "ret" } },
        out: ["30"],
        note: "The stored value can be printed, reused, or passed on. That is only possible because add returned it.",
      },
    ],
  },
  /* 5 ---------------------------------------------------------------------- */
  {
    eyebrow: "Return versus print",
    title: "print shows a value, return hands one back",
    lines: ["def ⟦n:announce⟧():", '    print(⟦s1:"Ready"⟧)', "", "⟦x:result⟧ = ⟦c:announce()⟧", "print(⟦g:result⟧)"],
    steps: [
      { ...D("announce"), label: "Define", active: [0, 1], note: "This function only prints. It has no return statement." },
      { label: "Call", active: [3], ul: ["c"], frame: emptyFrame("announce()"), note: "The result of the call will be assigned to result." },
      {
        label: "Run", active: [1], frame: emptyFrame("announce()"),
        flights: [{ from: "s1", to: "cons", text: "Ready", kind: "ret" }],
        out: ["Ready"],
        note: "print shows Ready for a person to read. It does not hand anything back to the program.",
      },
      {
        label: "Return", active: [1, 3], frame: emptyFrame("announce()"),
        badge: { line: 1, text: "None", label: "no return, so it gives back" },
        flights: [{ from: "rv", to: "c", text: "None", kind: "ret", at: LIFT }],
        swap: { c: { text: "None", kind: "ret" } },
        globals: [{ id: "m_result", name: "result", value: "None", kind: "ret", at: RET }],
        note: "Reaching the end of a function without return gives back None, and result stores it.",
      },
      {
        label: "Print", active: [4],
        flights: [
          { from: "c", to: "g", text: "None", kind: "ret" },
          { from: "g", to: "cons", text: "None", kind: "ret", at: 1.1 },
        ],
        swap: { g: { text: "None", kind: "ret" } },
        out: ["None"],
        note: "Ready was printed inside the function, but the returned value is None. Use return when later code needs the result.",
      },
    ],
  },
  /* 6 ---------------------------------------------------------------------- */
  {
    eyebrow: "Multiple return values",
    title: "Comma-separated values come back as a tuple",
    lines: [
      "def ⟦n:calculate⟧(⟦p0:a⟧, ⟦p1:b⟧):",
      "    return ⟦u0:a⟧ + ⟦u1:b⟧, ⟦u2:a⟧ - ⟦u3:b⟧",
      "",
      "⟦x0:total⟧, ⟦x1:difference⟧ = ⟦c:calculate(⟧⟦a0:20⟧⟦k:, ⟧⟦a1:10⟧⟦e:)⟧",
      "print(⟦g0:total⟧)",
      "print(⟦g1:difference⟧)",
    ],
    steps: [
      { ...D("calculate"), ul: ["n", "p0", "p1"], label: "Define", active: [0, 1], note: "The return line lists two values separated by a comma." },
      { label: "Call", active: [3], hot: ["a0", "a1"], note: "Python evaluates the arguments 20 and 10, then calls calculate." },
      { ...bind2("20", "10", "a", "b"), label: "Bind", active: [0], frame: F6, note: "20 goes to a and 10 goes to b, matched by position." },
      {
        label: "Run", active: [1], dim: ["a0", "a1"], frame: F6,
        flights: [
          { from: "p0", to: "u0", text: "20", kind: "arg" },
          { from: "p1", to: "u1", text: "10", kind: "arg" },
          { from: "p0", to: "u2", text: "20", kind: "arg" },
          { from: "p1", to: "u3", text: "10", kind: "arg" },
        ],
        swap: {
          u0: { text: "20", kind: "arg" }, u1: { text: "10", kind: "arg" },
          u2: { text: "20", kind: "arg" }, u3: { text: "10", kind: "arg" },
        },
        note: "Both expressions read the same parameters: 20 + 10 and 20 - 10.",
      },
      {
        label: "Return", active: [1, 3], frame: F6,
        badge: { line: 1, text: "(30, 10)", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "(30, 10)", kind: "ret", at: LIFT }],
        swap: { c: { text: "(30, 10)", kind: "ret" } },
        hide: HIDE_CALL,
        note: "The comma makes Python pack both results into one tuple, so the call becomes (30, 10).",
      },
      {
        label: "Unpack", active: [3], drop: ["p0", "p1", "u0", "u1", "u2", "u3"],
        flights: [
          { from: "c", to: "m_total", text: "30", kind: "ret" },
          { from: "c", to: "m_difference", text: "10", kind: "ret" },
        ],
        globals: [
          { id: "m_total", name: "total", value: "30", kind: "ret" },
          { id: "m_difference", name: "difference", value: "10", kind: "ret" },
        ],
        note: "The frame is gone. Unpacking assigns the first item to total and the second to difference.",
      },
      {
        label: "Print", active: [4, 5],
        flights: [
          { from: "g0", to: "cons", text: "30", kind: "ret", at: 0.5 },
          { from: "g1", to: "cons1", text: "10", kind: "ret", at: 1.0 },
        ],
        swap: { g0: { text: "30", kind: "ret" }, g1: { text: "10", kind: "ret" } },
        out: ["30", "10"],
        note: "Each print displays one of the two unpacked values.",
      },
    ],
  },
  /* 7 ---------------------------------------------------------------------- */
  {
    eyebrow: "Docstrings",
    title: "A first-line string documents the function",
    lines: [
      "def ⟦n:calculate_area⟧(⟦p0:length⟧, ⟦p1:width⟧):",
      '    ⟦d:"""Return the area of a rectangle."""⟧',
      "    return ⟦u0:length⟧ * ⟦u1:width⟧",
      "",
      "print(⟦c:calculate_area(⟧⟦a0:4⟧⟦k:, ⟧⟦a1:3⟧⟦e:)⟧)",
      "print(⟦q:calculate_area.__doc__⟧)",
    ],
    steps: [
      {
        label: "Define", active: [0, 1], hot: ["d"], ul: ["n", "p0", "p1"],
        flights: [
          { from: "n", to: "m_calculate_area", text: fnv("calculate_area"), kind: "fn" },
          { from: "d", to: "m_doc", text: DOC, kind: "doc" },
        ],
        globals: [
          { id: "m_calculate_area", name: "calculate_area", value: fnv("calculate_area"), kind: "fn" },
          { id: "m_doc", name: "calculate_area.__doc__", value: DOC, kind: "doc" },
        ],
        note: "A string placed first in the body is stored as the function's __doc__. Nothing runs yet.",
      },
      { label: "Call", active: [4], hot: ["a0", "a1"], note: "Python evaluates the arguments 4 and 3, then calls calculate_area." },
      { ...bind2("4", "3", "length", "width"), label: "Bind", active: [0], frame: F7, note: "4 goes to length and 3 goes to width, matched by position." },
      {
        label: "Run", active: [2], dim: ["a0", "a1"], frame: F7,
        flights: [
          { from: "p0", to: "u0", text: "4", kind: "arg" },
          { from: "p1", to: "u1", text: "3", kind: "arg" },
        ],
        swap: { u0: { text: "4", kind: "arg" }, u1: { text: "3", kind: "arg" } },
        note: "The docstring line does nothing at run time. The return line computes 4 * 3.",
      },
      {
        label: "Return", active: [2, 4], frame: F7,
        badge: { line: 2, text: "12", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "12", kind: "ret", at: LIFT }],
        swap: { c: { text: "12", kind: "ret" } },
        hide: HIDE_CALL,
        note: "return hands 12 back, and the call expression becomes 12.",
      },
      {
        label: "Print", active: [4], drop: ["p0", "p1", "u0", "u1"],
        flights: [{ from: "c", to: "cons", text: "12", kind: "ret" }],
        out: ["12"],
        note: "The frame is released and print displays the returned value.",
      },
      {
        label: "Read __doc__", active: [5],
        flights: [
          { from: "m_doc", to: "q", text: DOC, kind: "doc" },
          { from: "q", to: "cons", text: "Return the area of a rectangle.", kind: "doc", at: 1.2 },
        ],
        swap: { q: { text: DOC, kind: "doc" } },
        out: ["Return the area of a rectangle."],
        note: "__doc__ gives access to the stored docstring, so editors and help() can show it to readers.",
      },
    ],
  },
  /* 8 ---------------------------------------------------------------------- */
  {
    eyebrow: "Annotations",
    title: "Type hints describe a function without enforcing it",
    lines: [
      "def ⟦n:add⟧(⟦p0:a⟧: ⟦t0:int⟧, ⟦p1:b⟧: ⟦t1:int⟧) -> ⟦t2:int⟧:",
      '    """Return the sum of two integers."""',
      "    return ⟦u0:a⟧ + ⟦u1:b⟧",
      "",
      "print(⟦c:add(⟧⟦a0:10⟧⟦k:, ⟧⟦a1:20⟧⟦e:)⟧)",
      "print(⟦q:add.__annotations__⟧)",
    ],
    steps: [
      {
        label: "Define", active: [0], hot: ["t0", "t1", "t2"], ul: ["n"],
        flights: [
          { from: "n", to: "m_add", text: fnv("add"), kind: "fn" },
          { from: "t0", to: "m_ann", text: "int", kind: "type" },
          { from: "t1", to: "m_ann", text: "int", kind: "type" },
          { from: "t2", to: "m_ann", text: "int", kind: "type" },
        ],
        globals: [
          { id: "m_add", name: "add", value: fnv("add"), kind: "fn" },
          { id: "m_ann", name: "add.__annotations__", value: ANN, kind: "type" },
        ],
        note: "A colon after a parameter adds a type hint, and -> hints the return type. Python stores them as metadata.",
      },
      { label: "Call", active: [4], hot: ["a0", "a1"], note: 'Python evaluates the arguments 10 and 20. The hints are not checked here, so add("x", "y") would run too.' },
      { ...bind2("10", "20", "a", "b"), label: "Bind", active: [0], frame: F8, note: "10 goes to a and 20 goes to b, exactly as without hints." },
      {
        label: "Run", active: [2], dim: ["a0", "a1"], frame: F8,
        flights: [
          { from: "p0", to: "u0", text: "10", kind: "arg" },
          { from: "p1", to: "u1", text: "20", kind: "arg" },
        ],
        swap: { u0: { text: "10", kind: "arg" }, u1: { text: "20", kind: "arg" } },
        note: "The body computes 10 + 20. The hints play no part in running the code.",
      },
      {
        label: "Return", active: [2, 4], frame: F8,
        badge: { line: 2, text: "30", label: "returns" },
        flights: [{ from: "rv", to: "c", text: "30", kind: "ret", at: LIFT }],
        swap: { c: { text: "30", kind: "ret" } },
        hide: HIDE_CALL,
        note: "return hands 30 back, and the call expression becomes 30.",
      },
      {
        label: "Print", active: [4], drop: ["p0", "p1", "u0", "u1"],
        flights: [{ from: "c", to: "cons", text: "30", kind: "ret" }],
        out: ["30"],
        note: "The frame is released and print displays the returned value.",
      },
      {
        label: "Inspect", active: [5],
        flights: [
          { from: "m_ann", to: "q", text: ANN, kind: "type" },
          { from: "q", to: "cons", text: "{'a': <class 'int'>, ...}", kind: "type", at: 1.2 },
        ],
        swap: { q: { text: ANN, kind: "type" } },
        out: ["{'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}"],
        note: "__annotations__ exposes the stored hints. Editors and type checkers read them before the code runs.",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(slide: Slide): View[] {
  let swaps: Record<string, Swap> = {};
  let hide = new Set<string>();
  let globals: Row[] = [];
  let out: string[] = [];
  return slide.steps.map((st) => {
    swaps = { ...swaps, ...st.swap };
    st.drop?.forEach((k) => delete swaps[k]);
    hide = new Set([...hide, ...(st.hide ?? [])]);
    globals = [...globals, ...(st.globals ?? [])];
    out = [...out, ...(st.out ?? [])];
    return { swaps, hide, globals, out, frame: st.frame ?? null };
  });
}

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const chipBase =
  "inline-flex h-6 items-center whitespace-pre rounded-md border px-1.5 font-mono text-[12px] leading-none";

const chipClass: Record<Kind, string> = {
  arg: "border-mint/40 bg-mint/15 text-mint",
  fn: "border-violet/40 bg-violet/15 text-violet",
  ret: "border-white/30 bg-white/10 text-white",
  doc: "border-amber/40 bg-amber/15 text-amber",
  type: "border-sky-400/40 bg-sky-400/15 text-sky-300",
};

const COLOR: Record<string, string> = {
  n: "text-sky-300", c: "text-sky-200", e: "text-sky-200", k: "text-slate-400",
  t: "text-sky-300", d: "text-amber-200", a: "text-orange-300",
  p: "text-cyan-200", u: "text-cyan-200", v: "text-cyan-200", x: "text-cyan-200",
  g: "text-cyan-200", r: "text-cyan-200", q: "text-cyan-200",
};
const KIND_OF: Record<string, Kind> = { a: "arg", n: "fn", t: "type", d: "doc" };

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

const KEYWORDS = new Set(["def", "return", "pass"]);
const BUILTINS = new Set(["print"]);

function tokenize(text: string, state: { inStr: boolean }): ReactNode[] {
  const parts = text.match(/"|\s+|[A-Za-z_]\w*|\d+(?:\.\d+)?|./g) ?? [];
  return parts.map((tok, i) => {
    let cls = "text-slate-200";
    if (tok === '"') {
      state.inStr = !state.inStr;
      cls = "text-amber-200";
    } else if (state.inStr) cls = "text-amber-200";
    else if (KEYWORDS.has(tok)) cls = "text-fuchsia-300";
    else if (BUILTINS.has(tok)) cls = "text-sky-300";
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
        className={`relative -mx-[5px] inline-block rounded-md border px-1 transition-[opacity,background-color,border-color] duration-500 ${hot ? chipClass[KIND_OF[role] ?? "arg"] : `border-transparent ${COLOR[role] ?? "text-slate-200"}`
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
  if (line === "") return <div className="flex h-5 items-center px-2">{gutter}</div>;
  const badge = ctx.step.badge?.line === index ? ctx.step.badge : null;

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isActive ? "rgba(64,224,180,0.10)" : "rgba(64,224,180,0)" }}
      transition={{ duration: 0.3 }}
      className="relative flex h-9 items-center rounded-md px-2"
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

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      {children}
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
/* Memory and console                                                          */
/* -------------------------------------------------------------------------- */

const rowBox =
  "flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-xs";

function MemoryPanel({
  ctx, ever,
}: {
  ctx: Ctx; ever: boolean;
}) {
  const { view, prev, reg, reduce, timed } = ctx;
  const frame = view.frame;
  const prevFrameIds = new Set(prev?.frame?.rows.map((r) => r.id));

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>memory</PanelHeader>
      <div className="space-y-3 p-3">
        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">globals</p>
          <div className="flex min-h-9 flex-col gap-1.5">
            {view.globals.length === 0 && (
              <div className="flex min-h-9 items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-xs text-slate-500">
                nothing stored yet
              </div>
            )}
            {view.globals.map((row) => {
              const fresh = !reduce && !prev?.globals.some((r) => r.id === row.id);
              return (
                <motion.div
                  key={row.id}
                  initial={fresh ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fresh ? landOf(timed, row.via ?? row.id, row.at ?? 0.15) : 0, duration: 0.2 }}
                  className={rowBox}
                >
                  <span className={row.kind === "fn" ? "text-sky-300" : "text-cyan-200"}>{row.name}</span>
                  <span className="text-slate-500">=</span>
                  <span ref={reg(row.id)} className={`${chipBase} ${chipClass[row.kind]}`}>
                    {row.value}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">
            {frame ? `frame of ${frame.title}` : "call frame"}
          </p>
          <div className="flex min-h-[92px] flex-col gap-1.5">
            {frame && frame.rows.length > 0 ? (
              frame.rows.map((row) => {
                const fresh = !reduce && !prevFrameIds.has(row.id);
                return (
                  <motion.div
                    key={row.id}
                    initial={fresh ? { opacity: 0, x: -12 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: fresh ? landOf(timed, row.via ?? row.id, row.at ?? 0.15) : 0,
                      type: "spring", stiffness: 260, damping: 22,
                    }}
                    className={rowBox}
                  >
                    <span className="text-cyan-200">{row.name}</span>
                    <span className="text-slate-500">=</span>
                    <span ref={reg(row.id)} className={`${chipBase} ${chipClass[row.kind]}`}>
                      {row.value}
                    </span>
                    {row.note && <span className="ml-auto text-[10px] tracking-wider text-slate-500">{row.note}</span>}
                  </motion.div>
                );
              })
            ) : (
              <div className="flex min-h-[92px] flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 px-3 text-center font-mono text-xs text-slate-500">
                {frame ? frame.empty : ever ? "call finished, locals released" : "no active call"}
              </div>
            )}
          </div>
        </div>
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

export function FunctionBasicsCustomAnimation() {
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
  const ever = current.steps.slice(0, phase).some((s) => s.frame);

  return (
    <div className="flex w-full flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[680px] w-full flex-col justify-center overflow-hidden px-5 py-8 sm:px-8"
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

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-stretch">
            <CodeEditor lines={current.lines} ctx={ctx} />
            <div className="flex flex-col gap-4">
              <MemoryPanel ctx={ctx} ever={ever} />
              <ConsolePanel ctx={ctx} />
            </div>
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