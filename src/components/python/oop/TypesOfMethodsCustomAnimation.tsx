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
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Fixed canvas                                                                */
/* -------------------------------------------------------------------------- */

// Everything is laid out at one fixed design size. The stage has a fixed height,
// and the canvas only ever scales down uniformly when the column is narrower
// than the design, so no panel can grow, shrink, wrap or overflow.
const DESIGN_W = 800;
const DESIGN_H = 580;
const STAGE_H = 600;

const BODY_H = 450;
const LEFT_W = 466;
const RIGHT_W = 324;
const CODE_H = 340;
const CONSOLE_H = 102;
const ZONE_NAMES_H = 88;
const ZONE_CLASS_H = 130;
const ZONE_OBJECTS_H = 168;

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "val" | "fn" | "ret" | "ref" | "cls" | "no";

// A value that flies between anchors: code markers, name rows, object cards
// ("obj_<id>"), attribute rows, the result badge ("rv") or the console ("cons").
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number };
type Swap = { text: string; kind: Kind; cap?: string };
type Row = { id: string; name: string; value: string; kind: Kind };
type Method = { id: string; name: string; kind?: Kind };
type Zone = "class" | "object" | "frame";
// The class, an object, or a temporary method-call frame living in memory.
type Heap = { id: string; title: string; zone: Zone; methods?: Method[]; attrs: Row[] };
type Badge = { line: number; text: string; label?: string; kind?: Kind; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n class name   v name being assigned   u value being read   a argument
 *   c call target  k separator             e closing paren      g printed value
 *   s self or cls  p parameter             q literal (highlighted as code)
 */
type Step = {
  label: string;
  note: string;
  active: number[];
  flights?: Flt[];
  swap?: Record<string, Swap>; // markers replaced by a value chip (kept until dropped)
  drop?: string[];
  globals?: Row[]; // names added to (or updated in) the names zone
  heaps?: Heap[]; // class, object or frame cards added or updated
  remove?: string[]; // heap cards to remove
  out?: string[];
  hot?: string[];
  badge?: Badge;
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
  const last = Math.max(0, ...timedOf(s).map((f) => f.delay), (s.badge?.at ?? 0) + 0.3);
  return Math.max(2800, (last + FLY) * 1000 + 1400);
};

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const R = (id: string, name: string, value: string, kind: Kind = "val"): Row => ({ id, name, value, kind });
const N = (id: string, name: string, value: string): Row => R(id, name, value, "ref");
const M = (name: string, kind: Kind = "fn"): Method => ({ id: `cls_${name}`, name, kind });
const CLS = (name: string, methods: Method[], attrs: Row[] = []): Heap => ({
  id: "cls",
  title: `class ${name}`,
  zone: "class",
  methods,
  attrs,
});
const OBJ = (id: "o1" | "o2", title: string, attrs: Row[]): Heap => ({ id, title, zone: "object", attrs });
const FRAME = (title: string, attrs: Row[]): Heap => ({ id: "fr", title, zone: "frame", attrs });

const slides: Slide[] = [
  /* 1 Instance method ------------------------------------------------------ */
  {
    eyebrow: "Instance method",
    title: "An instance method receives the object as self",
    lines: [
      "class ⟦n:Product⟧:",
      "    def __init__(self, name, price):",
      "        self.name = name",
      "        self.price = price",
      "",
      "    def display_details(⟦s:self⟧):",
      '        print(f"{⟦u0:self.name⟧}: ${⟦u1:self.price⟧}")',
      "",
      '⟦v:laptop⟧ = ⟦c0:Product(⟧⟦a0:"Laptop"⟧⟦k0:, ⟧⟦a1:900⟧⟦e0:)⟧',
      "⟦c1:laptop.display_details()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 5, 6],
        flights: [{ from: "n", to: "obj_cls", text: "class Product", kind: "cls" }],
        heaps: [CLS("Product", [M("__init__", "ref"), M("display_details", "ref")])],
        note: "The class stores two instance methods. Neither one runs yet, and no product exists.",
      },
      {
        label: "Create",
        active: [8],
        hot: ["a0", "a1"],
        flights: [
          { from: "c0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_name", text: '"Laptop"', kind: "val", at: 0.9 },
          { from: "a1", to: "o1_price", text: "900", kind: "val", at: 1.04 },
          { from: "obj_o1", to: "m_laptop", text: "<Product #1>", kind: "ref", at: 1.9 },
        ],
        heaps: [OBJ("o1", "Product #1", [R("o1_name", "name", '"Laptop"'), R("o1_price", "price", "900")])],
        globals: [N("m_laptop", "laptop", "<Product #1>")],
        note: "laptop is a Product object that holds its own name and price.",
      },
      {
        label: "Call",
        active: [9, 5],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "laptop", kind: "ref", at: 0.2 },
          { from: "s", to: "fr_self", text: "<Product #1>", kind: "ref", at: 1.2 },
        ],
        swap: { s: { text: "laptop", kind: "ref", cap: "self" } },
        heaps: [FRAME("display_details()", [R("fr_self", "self", "<Product #1>", "ref")])],
        note: "laptop.display_details() passes the object before the dot into the first parameter, self, automatically.",
      },
      {
        label: "Print",
        active: [6],
        flights: [
          { from: "o1_name", to: "u0", text: "Laptop", kind: "val", at: 0.2 },
          { from: "o1_price", to: "u1", text: "900", kind: "val", at: 0.34 },
          { from: "u1", to: "cons", text: "Laptop: $900", kind: "ret", at: 1.4 },
        ],
        swap: { u0: { text: "Laptop", kind: "val" }, u1: { text: "900", kind: "val" } },
        out: ["Laptop: $900"],
        note: "self.name and self.price read the data of the object self refers to, so each product prints its own details.",
      },
      {
        label: "Finish",
        active: [9],
        drop: ["s", "u0", "u1"],
        remove: ["fr"],
        note: "The call ends and self goes away. The object itself, with its name and price, is unchanged.",
      },
    ],
  },
  /* 2 Class method --------------------------------------------------------- */
  {
    eyebrow: "Class method",
    title: "A class method receives the class as cls",
    lines: [
      "class ⟦n:Product⟧:",
      "    ⟦v0:tax_rate⟧ = ⟦q0:0.08⟧",
      "",
      "    @classmethod",
      "    def update_tax_rate(⟦s:cls⟧, ⟦p0:new_rate⟧):",
      "        ⟦v1:cls.tax_rate⟧ = ⟦u0:new_rate⟧",
      "",
      "⟦c0:Product.update_tax_rate⟧(⟦a0:0.09⟧)",
      "print(⟦g0:Product.tax_rate⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 3, 4, 5],
        flights: [
          { from: "n", to: "obj_cls", text: "class Product", kind: "cls", at: 0.2 },
          { from: "q0", to: "cls_tax", text: "0.08", kind: "val", at: 0.9 },
        ],
        heaps: [CLS("Product", [M("update_tax_rate", "cls")], [R("cls_tax", "tax_rate", "0.08")])],
        note: "tax_rate lives on the class. @classmethod marks update_tax_rate as a method that works with the class.",
      },
      {
        label: "Call",
        active: [7, 4],
        hot: ["a0"],
        flights: [
          { from: "obj_cls", to: "s", text: "Product", kind: "cls", at: 0.2 },
          { from: "a0", to: "p0", text: "0.09", kind: "val", at: 0.5 },
          { from: "s", to: "fr_cls", text: "Product", kind: "cls", at: 1.3 },
          { from: "p0", to: "fr_new", text: "0.09", kind: "val", at: 1.45 },
        ],
        swap: {
          s: { text: "Product", kind: "cls", cap: "cls" },
          p0: { text: "0.09", kind: "val", cap: "new_rate" },
        },
        heaps: [FRAME("update_tax_rate()", [R("fr_cls", "cls", "Product", "cls"), R("fr_new", "new_rate", "0.09")])],
        note: "Calling through the class passes the class itself into cls automatically. 0.09 goes into new_rate.",
      },
      {
        label: "Update",
        active: [5],
        flights: [
          { from: "p0", to: "u0", text: "0.09", kind: "val", at: 0.2 },
          { from: "u0", to: "cls_tax", text: "0.09", kind: "val", at: 1.2 },
        ],
        swap: { u0: { text: "0.09", kind: "val" } },
        heaps: [CLS("Product", [], [R("cls_tax", "tax_rate", "0.09")])],
        note: "cls.tax_rate = new_rate changes the attribute stored on the class, so it changes for every object of that class.",
      },
      {
        label: "Print",
        active: [8],
        drop: ["s", "p0", "u0"],
        remove: ["fr"],
        flights: [
          { from: "cls_tax", to: "g0", text: "0.09", kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "0.09", kind: "ret", at: 1.1 },
        ],
        swap: { g0: { text: "0.09", kind: "val" } },
        out: ["0.09"],
        note: "The frame is gone, but the class keeps the new value, 0.09.",
      },
    ],
  },
  /* 3 Static method -------------------------------------------------------- */
  {
    eyebrow: "Static method",
    title: "A static method receives nothing automatically",
    lines: [
      "class ⟦n:Product⟧:",
      "    @staticmethod",
      "    def is_valid_price(⟦p0:price⟧):",
      "        return ⟦u0:price⟧ >= 0",
      "",
      "print(⟦c0:Product.is_valid_price(100)⟧)",
      "print(⟦c1:Product.is_valid_price(-20)⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3],
        flights: [{ from: "n", to: "obj_cls", text: "class Product", kind: "cls" }],
        heaps: [CLS("Product", [M("is_valid_price", "fn")])],
        note: "@staticmethod marks is_valid_price. It sits in the class for organization but needs neither an object nor the class.",
      },
      {
        label: "Call",
        active: [5, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "p0", text: "100", kind: "val", at: 0.3 },
          { from: "p0", to: "fr_price", text: "100", kind: "val", at: 1.3 },
        ],
        swap: { p0: { text: "100", kind: "val", cap: "price" } },
        heaps: [FRAME("is_valid_price()", [R("fr_price", "price", "100"), R("fr_none", "self / cls", "none", "no")])],
        note: "Only the argument you pass arrives. Python adds no self and no cls, so nothing extra reaches the method.",
      },
      {
        label: "Run",
        active: [3],
        flights: [
          { from: "p0", to: "u0", text: "100", kind: "val", at: 0.2 },
          { from: "rv", to: "c0", text: "True", kind: "ret", at: 1.6 },
        ],
        swap: { u0: { text: "100", kind: "val" }, c0: { text: "True", kind: "ret" } },
        badge: { line: 3, text: "True", label: "returns", kind: "ret", at: 1.0 },
        note: "100 >= 0 is True, and that result replaces the call. The method used nothing but its argument.",
      },
      {
        label: "Print",
        active: [5],
        remove: ["fr"],
        flights: [{ from: "c0", to: "cons", text: "True", kind: "ret", at: 0.2 }],
        out: ["True"],
        note: "print writes True to the console.",
      },
      {
        label: "Call again",
        active: [6, 2],
        hot: ["c1"],
        drop: ["p0", "u0"],
        flights: [
          { from: "c1", to: "p0", text: "-20", kind: "val", at: 0.3 },
          { from: "p0", to: "fr_price", text: "-20", kind: "val", at: 1.3 },
        ],
        swap: { p0: { text: "-20", kind: "val", cap: "price" } },
        heaps: [FRAME("is_valid_price()", [R("fr_price", "price", "-20"), R("fr_none", "self / cls", "none", "no")])],
        note: "The same method with another argument. Again only the argument arrives, with no self and no cls.",
      },
      {
        label: "Run again",
        active: [3],
        flights: [
          { from: "p0", to: "u0", text: "-20", kind: "val", at: 0.2 },
          { from: "rv", to: "c1", text: "False", kind: "ret", at: 1.6 },
        ],
        swap: { u0: { text: "-20", kind: "val" }, c1: { text: "False", kind: "ret" } },
        badge: { line: 3, text: "False", label: "returns", kind: "ret", at: 1.0 },
        note: "-20 >= 0 is False, and that result replaces the call.",
      },
      {
        label: "Print",
        active: [6],
        remove: ["fr"],
        flights: [{ from: "c1", to: "cons", text: "False", kind: "ret", at: 0.2 }],
        out: ["False"],
        note: "print writes False to the console.",
      },
    ],
  },
  /* 4 Getter --------------------------------------------------------------- */
  {
    eyebrow: "Getter method",
    title: "A getter returns an attribute through a method",
    lines: [
      "class ⟦n:Profile⟧:",
      "    def __init__(self, name):",
      "        self.name = name",
      "",
      "    def get_name(⟦s:self⟧):",
      "        return ⟦u0:self.name⟧",
      "",
      '⟦v:profile⟧ = ⟦c0:Profile(⟧⟦a0:"Maya"⟧⟦e0:)⟧',
      "print(⟦c1:profile.get_name()⟧)",
    ],
    heaps: [CLS("Profile", [M("__init__", "ref"), M("get_name", "ref")])],
    steps: [
      {
        label: "Create",
        active: [7],
        hot: ["a0"],
        flights: [
          { from: "c0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_name", text: '"Maya"', kind: "val", at: 0.9 },
          { from: "obj_o1", to: "m_profile", text: "<Profile #1>", kind: "ref", at: 1.7 },
        ],
        heaps: [OBJ("o1", "Profile #1", [R("o1_name", "name", '"Maya"')])],
        globals: [N("m_profile", "profile", "<Profile #1>")],
        note: "The profile object stores a name. A getter will be the way to read it.",
      },
      {
        label: "Call",
        active: [8, 4],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "profile", kind: "ref", at: 0.2 },
          { from: "s", to: "fr_self", text: "<Profile #1>", kind: "ref", at: 1.2 },
        ],
        swap: { s: { text: "profile", kind: "ref", cap: "self" } },
        heaps: [FRAME("get_name()", [R("fr_self", "self", "<Profile #1>", "ref")])],
        note: "A getter is an ordinary instance method, so the object arrives as self.",
      },
      {
        label: "Return",
        active: [5],
        flights: [
          { from: "o1_name", to: "u0", text: '"Maya"', kind: "val", at: 0.2 },
          { from: "rv", to: "c1", text: '"Maya"', kind: "ret", at: 1.7 },
        ],
        swap: { u0: { text: '"Maya"', kind: "val" }, c1: { text: '"Maya"', kind: "ret" } },
        badge: { line: 5, text: '"Maya"', label: "returns", kind: "ret", at: 1.0 },
        note: "self.name reads the attribute and return hands the value back, replacing the call.",
      },
      {
        label: "Print",
        active: [8],
        drop: ["s", "u0"],
        remove: ["fr"],
        flights: [{ from: "c1", to: "cons", text: "Maya", kind: "ret", at: 0.2 }],
        out: ["Maya"],
        note: "print writes Maya. A getter is worth writing when reading needs formatting, calculation, or control.",
      },
    ],
  },
  /* 5 Setter --------------------------------------------------------------- */
  {
    eyebrow: "Setter method",
    title: "A setter checks a value before storing it",
    lines: [
      "class ⟦n:Student⟧:",
      "    def __init__(self, age=⟦q0:0⟧):",
      "        self._age = age",
      "",
      "    def set_age(⟦s:self⟧, ⟦p0:age⟧):",
      "        if ⟦u0:age⟧ < 0:",
      '            print(⟦q1:"Age cannot be negative"⟧)',
      "            return",
      "        self._age = ⟦u1:age⟧",
      "",
      "⟦v:student⟧ = ⟦c0:Student()⟧",
      "⟦c1:student.set_age(-2)⟧",
      "⟦c2:student.set_age(21)⟧",
    ],
    heaps: [CLS("Student", [M("__init__", "ref"), M("set_age", "ref")])],
    steps: [
      {
        label: "Create",
        active: [10, 1, 2],
        flights: [
          { from: "c0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "q0", to: "o1_age", text: "0", kind: "val", at: 0.9 },
          { from: "obj_o1", to: "m_student", text: "<Student #1>", kind: "ref", at: 1.7 },
        ],
        heaps: [OBJ("o1", "Student #1", [R("o1_age", "_age", "0")])],
        globals: [N("m_student", "student", "<Student #1>")],
        note: "student starts with _age = 0, the default value from __init__.",
      },
      {
        label: "Call -2",
        active: [11, 4],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "student", kind: "ref", at: 0.2 },
          { from: "c1", to: "p0", text: "-2", kind: "val", at: 0.45 },
          { from: "s", to: "fr_self", text: "<Student #1>", kind: "ref", at: 1.2 },
          { from: "p0", to: "fr_age", text: "-2", kind: "val", at: 1.35 },
        ],
        swap: {
          s: { text: "student", kind: "ref", cap: "self" },
          p0: { text: "-2", kind: "val", cap: "age" },
        },
        heaps: [FRAME("set_age()", [R("fr_self", "self", "<Student #1>", "ref"), R("fr_age", "age", "-2")])],
        note: "student.set_age(-2) passes the object as self and -2 as age.",
      },
      {
        label: "Reject",
        active: [5, 6, 7],
        flights: [
          { from: "p0", to: "u0", text: "-2", kind: "val", at: 0.2 },
          { from: "q1", to: "cons", text: "Age cannot be negative", kind: "ret", at: 1.6 },
        ],
        swap: { u0: { text: "-2", kind: "val" } },
        badge: { line: 5, text: "True", label: "test is", kind: "ret", at: 1.0 },
        out: ["Age cannot be negative"],
        note: "-2 < 0 is True, so the setter prints a message and returns. Nothing is stored, and _age stays 0.",
      },
      {
        label: "Call 21",
        active: [12, 4],
        hot: ["c2"],
        drop: ["u0"],
        flights: [
          { from: "c2", to: "s", text: "student", kind: "ref", at: 0.2 },
          { from: "c2", to: "p0", text: "21", kind: "val", at: 0.45 },
          { from: "p0", to: "fr_age", text: "21", kind: "val", at: 1.35 },
        ],
        swap: { p0: { text: "21", kind: "val", cap: "age" } },
        heaps: [FRAME("set_age()", [R("fr_age", "age", "21")])],
        note: "The same setter is called again, this time with 21.",
      },
      {
        label: "Store",
        active: [5, 8],
        flights: [
          { from: "p0", to: "u0", text: "21", kind: "val", at: 0.2 },
          { from: "p0", to: "u1", text: "21", kind: "val", at: 1.3 },
          { from: "u1", to: "o1_age", text: "21", kind: "val", at: 2.2 },
        ],
        swap: { u0: { text: "21", kind: "val" }, u1: { text: "21", kind: "val" } },
        heaps: [OBJ("o1", "Student #1", [R("o1_age", "_age", "21")])],
        badge: { line: 5, text: "False", label: "test is", kind: "ret", at: 0.9 },
        note: "21 < 0 is False, so the check passes and the assignment runs. The object now stores 21.",
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
    if (st.remove) heaps = heaps.filter((h) => !st.remove?.includes(h.id));
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
  no: "border-rose-400/40 bg-rose-400/15 text-rose-300",
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

const KEYWORDS = new Set(["def", "class", "return", "if"]);
const DECORATORS = new Set(["classmethod", "staticmethod"]);
const BUILTIN_NAMES = new Set(["print"]);

function tokenize(text: string, state: { inStr: boolean }): ReactNode[] {
  const parts = text.match(/"|\s+|[A-Za-z_]\w*|\d+(?:\.\d+)?|./g) ?? [];
  return parts.map((tok, i) => {
    let cls = "text-slate-200";
    if (tok === '"') {
      state.inStr = !state.inStr;
      cls = "text-amber-200";
    } else if (state.inStr) cls = "text-amber-200";
    else if (KEYWORDS.has(tok) || DECORATORS.has(tok)) cls = "text-fuchsia-300";
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

// A value chip that replaces a name in the code. An optional caption names the
// parameter it fills and sits above the chip, so long lines stay short.
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
    const hot = !!step.hot?.includes(id);
    const isCode = CODE_ROLES.has(role);
    return (
      <motion.span
        key={id}
        ref={reg(id)}
        animate={hot && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, delay: 0.25 }}
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
    tr = { duration: end, times: [0, at / end, (at + 0.25) / end, l / end, (l + 0.3) / end] };
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
      className="ml-2 inline-flex items-center gap-1.5 align-middle"
    >
      <span className="text-[10px] text-slate-500">{badge.label ?? "returns"}</span>
      <span ref={ctx.reg("rv")} className={`${chipBase} ${chipClass[badge.kind ?? "ret"]}`}>
        {badge.text}
      </span>
    </motion.span>
  );
}

function CodeLine({ line, index, ctx }: { line: string; index: number; ctx: Ctx }) {
  const isActive = ctx.step.active.includes(index);
  const gutter = (
    <span className="mr-3 w-3 select-none text-right text-[10px] text-slate-600">{index + 1}</span>
  );
  if (line === "") return <div className="flex h-3 items-center px-1.5">{gutter}</div>;
  const badge = ctx.step.badge?.line === index ? ctx.step.badge : null;
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
      <span className="whitespace-pre">
        {renderSegments(line, ctx)}
        {badge && <BadgeChip badge={badge} ctx={ctx} />}
      </span>
    </motion.div>
  );
}

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="h-[26px] shrink-0 border-b border-white/10 bg-slate-900 px-3 font-mono text-[9px] leading-[26px] tracking-[0.16em] text-slate-300">
      {children}
    </div>
  );
}

function CodeEditor({ lines, ctx }: { lines: string[]; ctx: Ctx }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg"
      style={{ width: LEFT_W, height: CODE_H }}
    >
      <div className="flex h-7 shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900 px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className="flex-1 overflow-hidden p-2 font-mono text-[12px] text-slate-100">
        {lines.map((line, i) => (
          <CodeLine key={i} line={line} index={i} ctx={ctx} />
        ))}
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
    <div ref={anchor} className="h-5 overflow-hidden whitespace-nowrap text-slate-100">
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

// Three fixed rows: the prompt plus up to two printed lines.
function ConsolePanel({ ctx }: { ctx: Ctx }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg"
      style={{ width: LEFT_W, height: CONSOLE_H }}
    >
      <PanelHeader>console</PanelHeader>
      <div className="flex-1 overflow-hidden p-2 font-mono text-[12px] leading-5">
        <div className="h-5">
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
/* Memory                                                                      */
/* -------------------------------------------------------------------------- */

const rowBox =
  "flex h-7 items-center gap-x-2 overflow-hidden rounded-md border border-white/10 bg-slate-900 px-2 font-mono text-[11px]";
// Label above the value: used inside the narrow object cards so nothing is clipped.
const rowStacked =
  "flex h-[42px] flex-col items-start justify-center gap-0.5 overflow-hidden rounded-md border border-white/10 bg-slate-900 px-2 font-mono text-[11px]";

function RowView({ row, ctx, stacked }: { row: Row; ctx: Ctx; stacked?: boolean }) {
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
      className={stacked ? rowStacked : rowBox}
    >
      <span className={`shrink-0 text-cyan-200 ${stacked ? "text-[10px] leading-3" : ""}`}>{row.name}</span>
      {!stacked && <span className="text-slate-500">=</span>}
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

// Colors match the overview: instance things are blue, the class is amber, and
// a call frame (what Python passes in) is neutral.
const HEAP_LOOK: Record<string, { box: string; chip: Kind }> = {
  cls: { box: "border-dashed border-amber/50 bg-amber/5", chip: "cls" },
  o1: { box: "border-sky-400/40 bg-sky-400/5", chip: "ref" },
  o2: { box: "border-sky-400/40 bg-sky-400/5", chip: "ref" },
  fr: { box: "border-dashed border-white/25 bg-white/5", chip: "ret" },
};

function HeapCard({ heap, ctx }: { heap: Heap; ctx: Ctx }) {
  const { prev, reg, reduce, timed } = ctx;
  const before = prev?.heaps.find((h) => h.id === heap.id);
  const fresh = !reduce && !before;
  const look = HEAP_LOOK[heap.id] ?? HEAP_LOOK.o1;
  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: fresh ? landOf(timed, `obj_${heap.id}`) : 0, duration: 0.3 }}
      className={`min-w-0 overflow-hidden rounded-lg border p-2 ${look.box}`}
    >
      <div className="mb-1.5 flex h-5 items-center">
        <span ref={reg(`obj_${heap.id}`)} className={`${chipBase} shrink-0 ${chipClass[look.chip]}`}>
          {heap.title}
        </span>
      </div>
      {heap.methods && heap.methods.length > 0 && (
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {heap.methods.map((m) => {
            const isNew = !reduce && !before?.methods?.some((q) => q.id === m.id);
            return (
              <motion.span
                key={m.id}
                ref={reg(m.id)}
                initial={isNew ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isNew ? landOf(timed, m.id, 0.4) : 0, duration: 0.25 }}
                className={`${chipBase} ${chipClass[m.kind ?? "fn"]}`}
              >
                {m.name}()
              </motion.span>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {heap.attrs.map((row) => (
          <RowView key={row.id} row={row} ctx={ctx} stacked={heap.zone !== "class"} />
        ))}
        {heap.attrs.length === 0 && heap.zone === "object" && (
          <div className="font-mono text-[10px] text-slate-500">no attributes yet</div>
        )}
      </div>
    </motion.div>
  );
}

function ZoneBox({ label, height, children }: { label: string; height: number; children: ReactNode }) {
  return (
    <div className="shrink-0 overflow-hidden" style={{ height }}>
      <p className="mb-1 h-3 font-mono text-[9px] leading-3 tracking-[0.16em] text-slate-500">{label}</p>
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-white/10 font-mono text-[11px] text-slate-500">
      {children}
    </div>
  );
}

// Three fixed zones. Cards fill them, but a zone never changes size.
function MemoryPanel({ ctx }: { ctx: Ctx }) {
  const { view } = ctx;
  const cls = view.heaps.find((h) => h.zone === "class");
  const objs = view.heaps.filter((h) => h.zone !== "class");
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg"
      style={{ width: RIGHT_W, height: BODY_H }}
    >
      <PanelHeader>memory</PanelHeader>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
        <ZoneBox label="names" height={ZONE_NAMES_H}>
          <div className="flex flex-col gap-1">
            {view.globals.length === 0 && <Placeholder>no names yet</Placeholder>}
            {view.globals.map((row) => (
              <RowView key={row.id} row={row} ctx={ctx} />
            ))}
          </div>
        </ZoneBox>
        <ZoneBox label="class" height={ZONE_CLASS_H}>
          {cls ? <HeapCard heap={cls} ctx={ctx} /> : <Placeholder>no class yet</Placeholder>}
        </ZoneBox>
        <ZoneBox label="objects and calls" height={ZONE_OBJECTS_H}>
          <div className="grid grid-cols-2 items-start gap-2">
            <AnimatePresence initial={false}>
              {objs.map((h) => (
                <HeapCard key={h.id} heap={h} ctx={ctx} />
              ))}
            </AnimatePresence>
          </div>
          {objs.length === 0 && <Placeholder>no objects yet</Placeholder>}
        </ZoneBox>
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
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Overview scene (no code)                                                    */
/* -------------------------------------------------------------------------- */

// A small clock that restarts whenever the step changes. Every timed moment in
// the overview is derived from it, so the pills and arrows can jump anywhere.
function useClock(resetKey: number, reduce: boolean, running: boolean) {
  const [t, setT] = useState(reduce ? 99 : 0);
  const elapsed = useRef(0);

  // A new step starts from zero.
  useEffect(() => {
    elapsed.current = 0;
    setT(reduce ? 99 : 0);
  }, [resetKey, reduce]);

  // The clock only advances while running. Pausing keeps the time where it is,
  // so every timed moment in the overview freezes with it.
  useEffect(() => {
    if (reduce || !running || elapsed.current > 12) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += (now - last) / 1000;
      last = now;
      setT(elapsed.current);
      if (elapsed.current > 12) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [resetKey, reduce, running]);
  return t;
}

// One color per method type, used by every card in the overview and matched by
// the code slides: instance is blue, class is amber, static is violet.
const CAT = {
  instance: {
    box: "border-sky-400/50",
    pill: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    text: "text-sky-300",
    chip: "ref" as Kind,
    glow: "shadow-[0_0_24px_rgba(56,189,248,0.12)]",
    line: "#38bdf8",
  },
  class: {
    box: "border-amber/50",
    pill: "border-amber/40 bg-amber/10 text-amber",
    text: "text-amber",
    chip: "cls" as Kind,
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.12)]",
    line: "#fbbf24",
  },
  static: {
    box: "border-violet/50",
    pill: "border-violet/40 bg-violet/10 text-violet",
    text: "text-violet",
    chip: "fn" as Kind,
    glow: "shadow-[0_0_24px_rgba(167,139,250,0.12)]",
    line: "#a78bfa",
  },
};
type Cat = keyof typeof CAT;

function Pill({ cat, children }: { cat: Cat; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-px font-mono text-[9px] leading-[14px] tracking-wider ${CAT[cat].pill}`}
    >
      {children}
    </span>
  );
}

// The key makes the chip pop whenever its text changes.
function Chip({ kind, children }: { kind: Kind; children: string }) {
  return (
    <motion.span
      key={children}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`${chipBase} ${chipClass[kind]}`}
    >
      {children}
    </motion.span>
  );
}

function ValueRow({ label, hot, children }: { label: string; hot?: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex h-7 items-center gap-2 overflow-hidden rounded-md border bg-slate-950 px-2 font-mono text-[11px] transition-colors duration-300 ${hot ? "border-sky-400/70" : "border-white/10"
        }`}
    >
      <span className="shrink-0 text-cyan-200">{label}</span>
      <span className="text-slate-500">=</span>
      {children}
    </div>
  );
}

const COLS: { cat: Cat; label: string; title: string; sub: string; slot: string; who: string; reach: string[] }[] = [
  {
    cat: "instance",
    label: "instance",
    title: "Instance method",
    sub: "Works with one object",
    slot: "self",
    who: "the object",
    reach: ["Reads this object's data", "Changes this object's data", "Needs an object to run"],
  },
  {
    cat: "class",
    label: "class",
    title: "Class method",
    sub: "Works with the class",
    slot: "cls",
    who: "the class",
    reach: ["Reads the class's shared data", "Changes it for every object", "Needs the class, not an object"],
  },
  {
    cat: "static",
    label: "static",
    title: "Static method",
    sub: "Works with neither",
    slot: "",
    who: "",
    reach: ["Uses only its own arguments", "Never touches object or class data", "A tidy helper inside the class"],
  },
];

// Steps: 0 overview, 1 instance, 2 class, 3 static. The three columns stay on
// screen; each step lights one column and dims the others.
function DiagramScene({ at, t, reduce }: { at: number; t: number; reduce: boolean }) {
  const [entered, setEntered] = useState(reduce);
  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 1800);
    return () => window.clearTimeout(id);
  }, []);
  const d = (n: number) => (entered ? 0 : n);

  const opacity = (i: number) => (at === 0 || at === i + 1 ? 1 : 0.3);
  const instFilled = at > 1 || (at === 1 && t >= 1.2);
  const classFilled = at > 2 || (at === 2 && t >= 1.2);
  const staticMarked = at === 3 && t >= 1.0;
  const instHot = at === 1 && t >= 1.8;
  const tax = at > 2 || (at === 2 && t >= 2.0) ? "0.09" : "0.08";
  const answer = at === 3 && t >= 2.0 ? "True" : "?";

  const panels = [
    // Instance: one object with its own data
    <div key="p0" className="h-full rounded-xl border border-sky-400/30 bg-slate-900 p-2">
      <div className="mb-1.5 flex h-5 items-center">
        <Chip kind="ref">laptop</Chip>
      </div>
      <div className="flex flex-col gap-1">
        <ValueRow label="name" hot={instHot}>
          <Chip kind="val">"Laptop"</Chip>
        </ValueRow>
        <ValueRow label="price" hot={instHot}>
          <Chip kind="val">900</Chip>
        </ValueRow>
      </div>
    </div>,
    // Class: shared data that every object reads
    <div key="p1" className="h-full rounded-xl border border-dashed border-amber/40 bg-slate-900 p-2">
      <div className="mb-1.5 flex h-5 items-center">
        <Chip kind="cls">Product</Chip>
      </div>
      <ValueRow label="tax_rate">
        <Chip kind="cls">{tax}</Chip>
      </ValueRow>
      <div className="mt-1.5 flex gap-1.5 font-mono text-[10px] text-slate-400">
        {["laptop", "headphones"].map((name) => (
          <span key={name} className="inline-flex h-[22px] items-center gap-1 rounded-md border border-white/10 bg-slate-950 px-1.5">
            {name}
            <motion.span key={tax} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber">
              {tax}
            </motion.span>
          </span>
        ))}
      </div>
    </div>,
    // Static: only an argument in and a result out
    <div
      key="p2"
      className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-slate-900 p-2 text-center"
    >
      <p className="text-[11px] leading-4 text-slate-500">no object, no class</p>
      <div className="flex items-center gap-2">
        <Chip kind="val">100</Chip>
        <span className="font-mono text-slate-500">→</span>
        <Chip kind="ret">{answer}</Chip>
      </div>
      <p className="text-[10px] text-slate-500">your argument in, a result out</p>
    </div>,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
      style={{ width: DESIGN_W, height: BODY_H }}
    >
      {COLS.map((c, i) => {
        const filled = i === 0 ? instFilled : i === 1 ? classFilled : false;
        return (
          <motion.div
            key={c.cat}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: opacity(i), y: 0 }}
            transition={{ duration: 0.35, delay: d(i * 0.2) }}
            className={`absolute top-0 overflow-hidden rounded-2xl border bg-slate-950 p-3 ${CAT[c.cat].box} ${CAT[c.cat].glow}`}
            style={{ left: i * 272, width: 256, height: BODY_H }}
          >
            <div style={{ height: 64 }}>
              <Pill cat={c.cat}>{c.label}</Pill>
              <p className="mt-1.5 text-[15px] font-medium leading-5 text-slate-100">{c.title}</p>
              <p className="text-[12px] leading-4 text-slate-400">{c.sub}</p>
            </div>

            <div style={{ height: 124 }}>{panels[i]}</div>

            <div className="flex flex-col items-center justify-center gap-0.5 text-slate-500" style={{ height: 40 }}>
              <ArrowDown className="size-4" />
              <span className="text-[10px] leading-3">
                {i === 2 ? "nothing is passed in" : "Python passes this in"}
              </span>
            </div>

            <div style={{ height: 64 }}>
              <p className="mb-1 text-[10px] leading-3 tracking-wider text-slate-500">first parameter</p>
              <div
                className={`flex h-10 items-center overflow-hidden rounded-lg border px-3 ${filled || staticMarked ? CAT[c.cat].box : "border-dashed border-white/20"
                  }`}
              >
                {i < 2 && filled && (
                  <motion.div
                    key="slot-chip"
                    initial={reduce ? false : { y: -140, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 16 }}
                    className="flex items-center gap-2"
                  >
                    <Chip kind={CAT[c.cat].chip}>{c.slot}</Chip>
                    <span className="text-[11px] text-slate-400">{c.who}</span>
                  </motion.div>
                )}
                {i < 2 && !filled && <span className="text-[11px] text-slate-600">empty until called</span>}
                {i === 2 && staticMarked && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Chip kind="no">none</Chip>
                    <span className="text-[11px] text-slate-400">no self, no cls</span>
                  </motion.div>
                )}
                {i === 2 && !staticMarked && <span className="text-[11px] text-slate-600">nothing is added</span>}
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1.5">
              {c.reach.map((r) => (
                <div key={r} className="flex items-start gap-2 text-[12px] leading-4 text-slate-300">
                  <Check className={`mt-0.5 size-3.5 shrink-0 ${CAT[c.cat].text}`} />
                  {r}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Step 4: the two questions, with each of the three answers lit in turn. The
// whole flow sits on its own dark panel, so every line and label stays readable
// on any page theme.

const P_INST = "M 400 64 L 400 96 L 136 96 L 136 140";
const P_Q2 = "M 400 64 L 400 96 L 600 96 L 600 140";
const P_CLASS = "M 600 204 L 600 240 L 465 240 L 465 288";
const P_STATIC = "M 600 204 L 600 240 L 690 240 L 690 288";

function Branch({ d, color, on }: { d: string; color: string; on: boolean }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    />
  );
}

function DecisionBox({ x, y, w, title, sub }: { x: number; y: number; w: number; title: string; sub: string }) {
  return (
    <div
      className="absolute rounded-xl border border-white/20 bg-slate-900 px-3 py-2 text-center"
      style={{ left: x, top: y, width: w, height: 64 }}
    >
      <p className="text-[13px] leading-5 text-white">{title}</p>
      <p className="text-[11px] leading-4 text-slate-400">{sub}</p>
    </div>
  );
}

function ResultCard({
  cat,
  x,
  y,
  w,
  title,
  lines,
  lit,
}: {
  cat: Cat;
  x: number;
  y: number;
  w: number;
  title: string;
  lines: string[];
  lit: boolean;
}) {
  return (
    <motion.div
      data-lit={lit ? "true" : "false"}
      animate={{ opacity: lit ? 1 : 0.5, scale: lit ? 1.03 : 1 }}
      transition={{ duration: 0.3 }}
      className={`absolute rounded-xl border bg-slate-900 p-3 ${CAT[cat].box} ${lit ? CAT[cat].glow : ""}`}
      style={{ left: x, top: y, width: w, height: 100 }}
    >
      <Pill cat={cat}>{cat}</Pill>
      <p className="mt-1.5 text-[14px] font-medium leading-5 text-white">{title}</p>
      {lines.map((l) => (
        <p key={l} className="text-[11px] leading-4 text-slate-400">
          {l}
        </p>
      ))}
    </motion.div>
  );
}

function ChooseScene({ t }: { t: number }) {
  const k = t < 0.8 ? -1 : Math.min(2, Math.floor((t - 0.8) / 2.8));
  const local = k < 0 ? 0 : t - 0.8 - k * 2.8;
  const instPath = k === 0 && local >= 0.2;
  const q2Path = k >= 1 && (k === 2 || local >= 0.2);
  const classPath = k === 1 && local >= 1.0;
  const staticPath = k === 2 && local >= 1.0;
  const instLit = k === 0 && local >= 0.9;
  const classLit = k === 1 && local >= 1.7;
  const staticLit = k === 2 && local >= 1.7;
  const label = "absolute font-mono text-[11px] tracking-wider text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
      style={{ width: DESIGN_W, height: BODY_H }}
    >
      <div className="absolute left-0" style={{ top: 30, width: DESIGN_W, height: 392 }}>
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={DESIGN_W}
          height={BODY_H}
          viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}
        >
          {[P_INST, P_Q2, P_CLASS, P_STATIC].map((p) => (
            <path key={p} d={p} fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth={2} strokeLinejoin="round" />
          ))}
          <Branch d={P_INST} color={CAT.instance.line} on={instPath} />
          <Branch d={P_Q2} color="#e2e8f0" on={q2Path} />
          <Branch d={P_CLASS} color={CAT.class.line} on={classPath} />
          <Branch d={P_STATIC} color={CAT.static.line} on={staticPath} />
        </svg>

        <DecisionBox x={220} y={0} w={360} title="Does it use this object's data?" sub="for example, read or change a price" />
        <DecisionBox x={440} y={140} w={320} title="Does it use the class's shared data?" sub="for example, update a shared tax rate" />

        <span className={label} style={{ left: 240, top: 78 }}>
          YES
        </span>
        <span className={label} style={{ left: 490, top: 78 }}>
          NO
        </span>
        <span className={label} style={{ left: 515, top: 222 }}>
          YES
        </span>
        <span className={label} style={{ left: 640, top: 222 }}>
          NO
        </span>

        <ResultCard cat="instance" x={16} y={140} w={240} title="Instance method" lines={["first parameter: self", "getters and setters too"]} lit={instLit} />
        <ResultCard cat="class" x={350} y={288} w={230} title="Class method" lines={["first parameter: cls", "works on shared data"]} lit={classLit} />
        <ResultCard cat="static" x={596} y={288} w={188} title="Static method" lines={["no automatic parameter", "a plain helper"]} lit={staticLit} />
      </div>
    </motion.div>
  );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
  const t = useClock(step, reduce, running);
  return (
    <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
      <AnimatePresence mode="wait">
        {step === 4 ? (
          <ChooseScene key="choose" t={t} />
        ) : (
          <DiagramScene key="diagram" at={step} t={t} reduce={reduce} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Entries: the overview first, then the code slides                           */
/* -------------------------------------------------------------------------- */

type OvStep = { label: string; note: string; ms: number };
type Overview = { kind: "overview"; eyebrow: string; title: string; steps: OvStep[] };
type CodeEntry = Slide & { kind: "code" };
type Entry = Overview | CodeEntry;

const OVERVIEW: Overview = {
  kind: "overview",
  eyebrow: "The big picture",
  title: "Three kinds of methods",
  steps: [
    {
      label: "Three kinds",
      ms: 4800,
      note: "Methods differ in what Python passes in automatically. An instance method gets the object, a class method gets the class, and a static method gets nothing extra.",
    },
    {
      label: "Instance",
      ms: 6000,
      note: "An instance method receives the object it is called on, so it can read and change that one object's data. Getters and setters are instance methods.",
    },
    {
      label: "Class",
      ms: 7000,
      note: "A class method receives the class itself. It can read or change data shared by every object, so one call changes it for all of them.",
    },
    {
      label: "Static",
      ms: 6400,
      note: "A static method receives nothing automatically. It only uses the arguments you pass, which suits a helper that belongs with the class but needs no object or class data.",
    },
    {
      label: "Choose",
      ms: 10400,
      note: "To choose a method type, ask what data it needs: this object's data, the class's shared data, or neither.",
    },
  ],
};

const ENTRIES: Entry[] = [OVERVIEW, ...slides.map((s): Entry => ({ kind: "code", ...s }))];

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

export function TypesOfMethodsCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [frozen, setFrozen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback<Reg>(
    (id) => (el) => {
      anchors.current[id] = el;
    },
    [],
  );

  // The canvas keeps its design size and is only ever scaled down to fit.
  const width = useWidth(stageRef);
  const scale = width === 0 ? 1 : Math.min(1, (width - 16) / DESIGN_W);

  const entry = ENTRIES[idx];
  const isCode = entry.kind === "code";
  const codeSlide: Slide = entry.kind === "code" ? entry : slides[0];
  const last = entry.steps.length - 1;
  const at = Math.min(phase, last);
  const views = useMemo(() => compile(codeSlide), [codeSlide]);
  const codeAt = Math.min(at, codeSlide.steps.length - 1);
  const step = codeSlide.steps[codeAt];
  const view = views[codeAt];
  const prev = views[codeAt - 1];
  const timed = useMemo(() => (isCode ? timedOf(step) : []), [isCode, step]);
  const note = entry.steps[at].note;

  // Autoplay: step through the phases, then move to the next scene.
  useEffect(() => {
    if (!playing) return;
    const ms = entry.kind === "overview" ? entry.steps[at].ms : stepMs(step);
    const timer = window.setTimeout(() => {
      if (at < last) setPhase(at + 1);
      else {
        setIdx((value) => (value + 1) % ENTRIES.length);
        setPhase(0);
      }
    }, ms);
    return () => window.clearTimeout(timer);
  }, [at, playing, idx, last, step, entry]);

  // Measure where each value starts and ends (in canvas units), then launch the chips.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduce || !isCode) {
      setFlights([]);
      return;
    }
    const cr = canvas.getBoundingClientRect();
    const s = cr.width / DESIGN_W || 1;
    const out: Flight[] = [];
    for (const t of timed) {
      const from = anchors.current[t.from];
      const to = anchors.current[t.to];
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      out.push({
        ...t,
        x0: (a.left - cr.left) / s,
        y0: (a.top - cr.top) / s + a.height / s / 2 - CHIP_H / 2,
        x1: (b.left - cr.left) / s,
        y1: (b.top - cr.top) / s + b.height / s / 2 - CHIP_H / 2,
      });
    }
    setFlights(out);
  }, [idx, at, reduce, timed, scale, isCode]);

  const goEntry = (target: number) => {
    setPlaying(false);
    setFrozen(false);
    setIdx((target + ENTRIES.length) % ENTRIES.length);
    setPhase(0);
  };
  const goPhase = (target: number) => {
    setPlaying(false);
    setFrozen(false);
    setPhase(target);
  };
  const replay = () => {
    setPhase(0);
    setPlaying(true);
    setFrozen(false);
  };

  // Pause freezes the overview timeline. Pressing play continues from the same moment.
  const toggle = () => {
    if (playing) {
      setPlaying(false);
      setFrozen(true);
    } else {
      setPlaying(true);
      setFrozen(false);
    }
  };

  const ctx: Ctx = { step, view, prev, reg, reduce, timed };
  const progress = (idx + (at + 1) / (last + 1)) / ENTRIES.length;

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div ref={stageRef} className="relative w-full overflow-hidden" style={{ height: STAGE_H }}>
        <div
          ref={canvasRef}
          className="absolute left-1/2 top-1/2"
          style={{
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {/* Fade only (no translate) so measured chip positions stay exact. */}
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex h-full w-full flex-col"
          >
            <div className="flex shrink-0 flex-col items-center" style={{ height: 70 }}>
              <p className="h-4 font-mono text-[10px] leading-4 tracking-[0.2em] text-violet">{entry.eyebrow}</p>
              <h3 className="h-7 max-w-full truncate text-lg font-light leading-7 text-foreground">{entry.title}</h3>
              <div className="mt-2 flex h-6 items-center justify-center gap-1.5">
                {entry.steps.map((s, i) => (
                  <button
                    key={`${s.label}-${i}`}
                    type="button"
                    onClick={() => goPhase(i)}
                    aria-current={i === at ? "step" : undefined}
                    className={`h-6 whitespace-nowrap rounded-full border px-2.5 font-mono text-[10px] tracking-[0.08em] transition-colors ${i === at
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
            </div>

            <div
              className="mx-auto shrink-0 overflow-hidden text-center"
              style={{ height: 44, width: 720, marginTop: 6 }}
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
                  {note}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 justify-center gap-[10px]" style={{ height: BODY_H, marginTop: 10 }}>
              {entry.kind === "overview" ? (
                <OverviewScene step={at} reduce={reduce} running={!frozen} />
              ) : (
                <>
                  <div className="flex flex-col gap-2" style={{ width: LEFT_W }}>
                    <CodeEditor lines={codeSlide.lines} ctx={ctx} />
                    <ConsolePanel ctx={ctx} />
                  </div>
                  <MemoryPanel ctx={ctx} />
                </>
              )}
            </div>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
            {flights.map((f) => (
              <FlyingChip key={`${idx}-${at}-${f.from}-${f.to}-${f.delay}`} f={f} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${progress * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay slide">
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" onClick={() => goEntry(idx - 1)} className={controlBtn} aria-label="Previous slide">
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className={controlBtn}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" onClick={() => goEntry(idx + 1)} className={controlBtn} aria-label="Next slide">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {ENTRIES.map((e, i) => (
              <button
                key={e.eyebrow}
                type="button"
                onClick={() => goEntry(i)}
                aria-label={`Go to slide ${i + 1}: ${e.eyebrow}`}
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