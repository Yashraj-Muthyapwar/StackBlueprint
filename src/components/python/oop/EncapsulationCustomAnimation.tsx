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
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Unlock,
  XCircle,
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
type Method = { id: string; name: string; kind?: Kind; label?: string };
type Zone = "class" | "object" | "frame";
// The class, an object, or a temporary method-call frame living in memory.
type Heap = { id: string; title: string; zone: Zone; methods?: Method[]; attrs: Row[] };
type Badge = { line: number; text: string; label?: string; kind?: Kind; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n class name   v name being assigned   u value being read   a argument
 *   c call target  k separator             e closing paren      g printed value
 *   s self         p parameter             q literal (highlighted as code)
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
  wide?: boolean; // one wide object card with inline rows (for objects with several attributes)
  dense?: boolean; // smaller code lines, for long examples
  consoleRows?: number; // prompt plus printed lines; 3 by default
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
type Ctx = {
  step: Step;
  view: View;
  prev?: View;
  reg: Reg;
  reduce: boolean;
  timed: Timed[];
  dense: boolean;
  wide: boolean;
};

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
const M = (name: string, kind: Kind = "fn", label?: string): Method => ({ id: `cls_${name}`, name, kind, label });
const CLS = (name: string, methods: Method[], attrs: Row[] = []): Heap => ({
  id: "cls",
  title: `class ${name}`,
  zone: "class",
  methods,
  attrs,
});
const OBJ = (id: "o1" | "o2", title: string, attrs: Row[]): Heap => ({ id, title, zone: "object", attrs });
const FRAME = (title: string, attrs: Row[]): Heap => ({ id: "fr", title, zone: "frame", attrs });

// Access levels share one palette across the overview and the code slides:
// public attributes are green, protected amber, private violet.
const PUB = "val" as Kind;
const PROT = "cls" as Kind;
const PRIV = "fn" as Kind;

const slides: Slide[] = [
  /* 1 Methods as gatekeepers ----------------------------------------------- */
  {
    eyebrow: "Methods as gatekeepers",
    title: "A method checks a value before the data changes",
    lines: [
      "class ⟦n:BankAccount⟧:",
      "    def __init__(self, balance):",
      "        self.__balance = balance",
      "",
      "    def withdraw(⟦s:self⟧, ⟦p0:amount⟧):",
      "        if 0 < ⟦u0:amount⟧ <= ⟦u1:self.__balance⟧:",
      "            self.__balance -= ⟦u2:amount⟧",
      '            return ⟦q0:"Withdrawal accepted"⟧',
      '        return ⟦q1:"Withdrawal declined"⟧',
      "",
      "⟦v:account⟧ = ⟦cc:BankAccount(⟧⟦a0:1000⟧⟦e0:)⟧",
      "print(⟦c1:account.withdraw(5000)⟧)",
      "print(⟦c2:account.withdraw(200)⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 6, 7, 8],
        flights: [{ from: "n", to: "obj_cls", text: "class BankAccount", kind: "cls" }],
        heaps: [CLS("BankAccount", [M("__init__", "ref"), M("withdraw", "ref")])],
        note: "The class keeps the data and the rules for changing it together. withdraw is the only door the rest of the program should use.",
      },
      {
        label: "Create",
        active: [10, 2],
        hot: ["a0"],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_bal", text: "1000", kind: PRIV, at: 0.9 },
          { from: "obj_o1", to: "m_account", text: "<BankAccount #1>", kind: "ref", at: 1.7 },
        ],
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_bal", "__balance", "1000", PRIV)])],
        globals: [N("m_account", "account", "<BankAccount #1>")],
        note: "The balance is stored in a private attribute, __balance, inside the object. Outside code is meant to go through methods.",
      },
      {
        label: "Call 5000",
        active: [11, 4],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "account", kind: "ref", at: 0.2 },
          { from: "c1", to: "p0", text: "5000", kind: "val", at: 0.45 },
          { from: "s", to: "fr_self", text: "BankAccount #1", kind: "ref", at: 1.2 },
          { from: "p0", to: "fr_amount", text: "5000", kind: "val", at: 1.35 },
        ],
        swap: {
          s: { text: "account", kind: "ref", cap: "self" },
          p0: { text: "5000", kind: "val", cap: "amount" },
        },
        heaps: [FRAME("withdraw()", [R("fr_self", "self", "BankAccount #1", "ref"), R("fr_amount", "amount", "5000")])],
        note: "account.withdraw(5000) passes the object as self and 5000 as amount.",
      },
      {
        label: "Declined",
        active: [5, 8],
        flights: [
          { from: "p0", to: "u0", text: "5000", kind: "val", at: 0.2 },
          { from: "o1_bal", to: "u1", text: "1000", kind: PRIV, at: 0.34 },
          { from: "q1", to: "c1", text: '"Withdrawal declined"', kind: "ret", at: 1.6 },
          { from: "c1", to: "cons", text: "Withdrawal declined", kind: "ret", at: 2.6 },
        ],
        swap: {
          u0: { text: "5000", kind: "val" },
          u1: { text: "1000", kind: PRIV },
          c1: { text: '"Withdrawal declined"', kind: "ret" },
        },
        badge: { line: 5, text: "False", label: "test is", kind: "ret", at: 1.0 },
        out: ["Withdrawal declined"],
        note: "0 < 5000 <= 1000 is False, so the data is never touched. The method returns a message, and the balance stays 1000.",
      },
      {
        label: "Call 200",
        active: [12, 4],
        hot: ["c2"],
        drop: ["u0", "u1"],
        remove: ["fr"],
        flights: [
          { from: "c2", to: "s", text: "account", kind: "ref", at: 0.2 },
          { from: "c2", to: "p0", text: "200", kind: "val", at: 0.45 },
          { from: "s", to: "fr_self", text: "BankAccount #1", kind: "ref", at: 1.2 },
          { from: "p0", to: "fr_amount", text: "200", kind: "val", at: 1.35 },
        ],
        swap: { p0: { text: "200", kind: "val", cap: "amount" } },
        heaps: [FRAME("withdraw()", [R("fr_self", "self", "BankAccount #1", "ref"), R("fr_amount", "amount", "200")])],
        note: "The same method is called again, this time with 200.",
      },
      {
        label: "Accepted",
        active: [5, 6, 7],
        flights: [
          { from: "p0", to: "u0", text: "200", kind: "val", at: 0.2 },
          { from: "o1_bal", to: "u1", text: "1000", kind: PRIV, at: 0.34 },
          { from: "p0", to: "u2", text: "200", kind: "val", at: 1.5 },
          { from: "u2", to: "o1_bal", text: "800", kind: PRIV, at: 2.3 },
          { from: "q0", to: "c2", text: '"Withdrawal accepted"', kind: "ret", at: 3.1 },
          { from: "c2", to: "cons", text: "Withdrawal accepted", kind: "ret", at: 4.0 },
        ],
        swap: {
          u0: { text: "200", kind: "val" },
          u1: { text: "1000", kind: PRIV },
          u2: { text: "200", kind: "val" },
          c2: { text: '"Withdrawal accepted"', kind: "ret" },
        },
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_bal", "__balance", "800", PRIV)])],
        badge: { line: 5, text: "True", label: "test is", kind: "ret", at: 1.0 },
        out: ["Withdrawal accepted"],
        note: "0 < 200 <= 1000 is True, so the method changes the balance itself: 1000 minus 200 leaves 800.",
      },
    ],
  },
  /* 2 Access levels and name mangling -------------------------------------- */
  {
    eyebrow: "Access levels and mangling",
    title: "Underscores signal intent, and double underscores rename",
    wide: true,
    consoleRows: 4,
    lines: [
      "class ⟦n:BankAccount⟧:",
      "    def __init__(self):",
      '        self.owner = ⟦q0:"Aman"⟧',
      '        self._account_type = ⟦q1:"Savings"⟧',
      "        ⟦v2:self.__pin⟧ = ⟦q2:1234⟧",
      "",
      "⟦v:account⟧ = ⟦c0:BankAccount()⟧",
      "print(⟦g0:account.owner⟧)",
      "print(⟦g1:account._account_type⟧)",
      "print(⟦g2:account._BankAccount__pin⟧)",
    ],
    heaps: [CLS("BankAccount", [M("__init__", "ref")])],
    steps: [
      {
        label: "Create",
        active: [6],
        flights: [
          { from: "c0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_account", text: "<BankAccount #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "BankAccount #1", [])],
        globals: [N("m_account", "account", "<BankAccount #1>")],
        note: "account is a new, empty object. __init__ now sets three attributes, one for each access level.",
      },
      {
        label: "Public",
        active: [1, 2],
        flights: [{ from: "q0", to: "o1_owner", text: '"Aman"', kind: PUB, at: 0.3 }],
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_owner", "owner", '"Aman"', PUB)])],
        note: "owner has no underscore, so it is public. Use it normally, from inside or outside the class.",
      },
      {
        label: "Protected",
        active: [3],
        flights: [{ from: "q1", to: "o1_type", text: '"Savings"', kind: PROT, at: 0.3 }],
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_type", "_account_type", '"Savings"', PROT)])],
        note: "One underscore marks _account_type as protected: meant for the class and its subclasses. Python still allows access.",
      },
      {
        label: "Private",
        active: [4],
        flights: [
          { from: "v2", to: "o1_pin", text: "_BankAccount__pin", kind: PRIV, at: 0.3 },
          { from: "q2", to: "o1_pin", text: "1234", kind: PRIV, at: 1.0 },
        ],
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_pin", "_BankAccount__pin", "1234", PRIV)])],
        note: "Two underscores trigger name mangling: __pin is stored as _BankAccount__pin, so a plain account.__pin would fail.",
      },
      {
        label: "Read two",
        active: [7, 8],
        flights: [
          { from: "o1_owner", to: "g0", text: '"Aman"', kind: PUB, at: 0.2 },
          { from: "g0", to: "cons", text: "Aman", kind: "ret", at: 1.1 },
          { from: "o1_type", to: "g1", text: '"Savings"', kind: PROT, at: 1.7 },
          { from: "g1", to: "cons1", text: "Savings", kind: "ret", at: 2.6 },
        ],
        swap: { g0: { text: '"Aman"', kind: PUB }, g1: { text: '"Savings"', kind: PROT } },
        out: ["Aman", "Savings"],
        note: "Public and protected attributes read normally. The underscore is a signal to other developers, not a barrier.",
      },
      {
        label: "Mangled",
        active: [9],
        flights: [
          { from: "o1_pin", to: "g2", text: "1234", kind: PRIV, at: 0.2 },
          { from: "g2", to: "cons", text: "1234", kind: "ret", at: 1.1 },
        ],
        swap: { g2: { text: "1234", kind: PRIV } },
        out: ["1234"],
        note: "The mangled name still works. Name mangling guards against accidents, not against someone who goes looking.",
      },
    ],
  },
  /* 3 Property getter ------------------------------------------------------ */
  {
    eyebrow: "Property getter",
    title: "A property reads like an attribute but runs a method",
    lines: [
      "class ⟦n:BankAccount⟧:",
      "    def __init__(self, balance):",
      "        self.__balance = balance",
      "",
      "    @property",
      "    def balance(⟦s:self⟧):",
      "        return ⟦u0:self.__balance⟧",
      "",
      "⟦v:account⟧ = ⟦cc:BankAccount(⟧⟦a0:1000⟧⟦e0:)⟧",
      "print(⟦c1:account.balance⟧)",
    ],
    heaps: [CLS("BankAccount", [M("__init__", "ref"), M("balance", "fn", "balance (property)")])],
    steps: [
      {
        label: "Create",
        active: [8, 2],
        hot: ["a0"],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_bal", text: "1000", kind: PRIV, at: 0.9 },
          { from: "obj_o1", to: "m_account", text: "<BankAccount #1>", kind: "ref", at: 1.7 },
        ],
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_bal", "__balance", "1000", PRIV)])],
        globals: [N("m_account", "account", "<BankAccount #1>")],
        note: "The balance sits in a private attribute. The @property below will be its public face.",
      },
      {
        label: "Read",
        active: [9, 5],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "account", kind: "ref", at: 0.2 },
          { from: "s", to: "fr_self", text: "BankAccount #1", kind: "ref", at: 1.2 },
        ],
        swap: { s: { text: "account", kind: "ref", cap: "self" } },
        heaps: [FRAME("balance", [R("fr_self", "self", "BankAccount #1", "ref")])],
        note: "account.balance looks like plain attribute access, but Python calls the property's getter and passes the object as self.",
      },
      {
        label: "Return",
        active: [6],
        flights: [
          { from: "o1_bal", to: "u0", text: "1000", kind: PRIV, at: 0.2 },
          { from: "rv", to: "c1", text: "1000", kind: "ret", at: 1.7 },
        ],
        swap: { u0: { text: "1000", kind: PRIV }, c1: { text: "1000", kind: "ret" } },
        badge: { line: 6, text: "1000", label: "returns", kind: "ret", at: 1.0 },
        note: "The getter reads the private attribute and returns it. The caller never needs to know the attribute's name.",
      },
      {
        label: "Print",
        active: [9],
        drop: ["s", "u0"],
        remove: ["fr"],
        flights: [{ from: "c1", to: "cons", text: "1000", kind: "ret", at: 0.2 }],
        out: ["1000"],
        note: "print writes 1000. Because no setter exists, assigning to account.balance would raise an error.",
      },
    ],
  },
  /* 4 Property setter ------------------------------------------------------ */
  {
    eyebrow: "Property setter",
    title: "A property setter validates every assignment",
    dense: true,
    lines: [
      "class ⟦n:BankAccount⟧:",
      "    @property",
      "    def balance(self):",
      "        return self.__balance",
      "",
      "    @balance.setter",
      "    def balance(⟦s:self⟧, ⟦p0:value⟧):",
      "        if ⟦u0:value⟧ < 0:",
      '            raise ⟦q0:ValueError("Balance cannot be negative")⟧',
      "        ⟦v1:self.__balance⟧ = ⟦u1:value⟧",
      "",
      "⟦v:account⟧ = ⟦cc:BankAccount()⟧",
      "⟦c1:account.balance = 1500⟧",
      "⟦c2:account.balance = -100⟧",
    ],
    heaps: [CLS("BankAccount", [M("balance", "fn", "balance (property)")])],
    steps: [
      {
        label: "Create",
        active: [11],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_account", text: "<BankAccount #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "BankAccount #1", [])],
        globals: [N("m_account", "account", "<BankAccount #1>")],
        note: "A new account with no balance yet. The first valid assignment through the setter will create it.",
      },
      {
        label: "Call 1500",
        active: [12, 6],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "s", text: "account", kind: "ref", at: 0.2 },
          { from: "c1", to: "p0", text: "1500", kind: "val", at: 0.45 },
          { from: "s", to: "fr_self", text: "BankAccount #1", kind: "ref", at: 1.2 },
          { from: "p0", to: "fr_value", text: "1500", kind: "val", at: 1.35 },
        ],
        swap: {
          s: { text: "account", kind: "ref", cap: "self" },
          p0: { text: "1500", kind: "val", cap: "value" },
        },
        heaps: [FRAME("balance", [R("fr_self", "self", "BankAccount #1", "ref"), R("fr_value", "value", "1500")])],
        note: "account.balance = 1500 looks like a plain assignment, but Python calls the setter with 1500 as value.",
      },
      {
        label: "Accepted",
        active: [7, 9],
        flights: [
          { from: "p0", to: "u0", text: "1500", kind: "val", at: 0.2 },
          { from: "p0", to: "u1", text: "1500", kind: "val", at: 1.2 },
          { from: "u1", to: "o1_bal", text: "1500", kind: PRIV, at: 2.1 },
        ],
        swap: { u0: { text: "1500", kind: "val" }, u1: { text: "1500", kind: "val" } },
        heaps: [OBJ("o1", "BankAccount #1", [R("o1_bal", "__balance", "1500", PRIV)])],
        badge: { line: 7, text: "False", label: "test is", kind: "ret", at: 0.9 },
        note: "1500 < 0 is False, so no error is raised and the assignment runs. The private balance is now 1500.",
      },
      {
        label: "Call -100",
        active: [13, 6],
        hot: ["c2"],
        drop: ["u0", "u1"],
        remove: ["fr"],
        flights: [
          { from: "c2", to: "s", text: "account", kind: "ref", at: 0.2 },
          { from: "c2", to: "p0", text: "-100", kind: "val", at: 0.45 },
          { from: "s", to: "fr_self", text: "BankAccount #1", kind: "ref", at: 1.2 },
          { from: "p0", to: "fr_value", text: "-100", kind: "val", at: 1.35 },
        ],
        swap: { p0: { text: "-100", kind: "val", cap: "value" } },
        heaps: [FRAME("balance", [R("fr_self", "self", "BankAccount #1", "ref"), R("fr_value", "value", "-100")])],
        note: "A second assignment, this time with -100. The same setter runs again.",
      },
      {
        label: "Rejected",
        active: [7, 8],
        flights: [
          { from: "p0", to: "u0", text: "-100", kind: "val", at: 0.2 },
          { from: "q0", to: "cons", text: "ValueError: Balance cannot be negative", kind: "ret", at: 1.6 },
        ],
        swap: { u0: { text: "-100", kind: "val" } },
        badge: { line: 7, text: "True", label: "test is", kind: "ret", at: 1.0 },
        out: ["ValueError: Balance cannot be negative"],
        note: "-100 < 0 is True, so the setter raises ValueError before the last line runs. The balance stays 1500.",
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
    if (st.remove) heaps = heaps.filter((h) => !st.remove?.includes(h.id));
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

const KEYWORDS = new Set(["def", "class", "return", "if", "raise"]);
const DECORATORS = new Set(["classmethod", "staticmethod", "property"]);
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
      className={`relative flex items-center rounded px-1.5 ${ctx.dense ? "h-[22px]" : "h-6"}`}
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

function CodeEditor({ lines, ctx, height }: { lines: string[]; ctx: Ctx; height: number }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg"
      style={{ width: LEFT_W, height }}
    >
      <div className="flex h-7 shrink-0 items-center gap-3 border-b border-white/10 bg-slate-900 px-3">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className={`flex-1 overflow-hidden p-2 font-mono text-slate-100 ${ctx.dense ? "text-[11px]" : "text-[12px]"}`}>
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
function ConsolePanel({ ctx, height }: { ctx: Ctx; height: number }) {
  const { view, prev, reg, reduce, timed } = ctx;
  const before = prev?.out.length ?? 0;
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-lg"
      style={{ width: LEFT_W, height }}
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
                {m.label ?? `${m.name}()`}
              </motion.span>
            );
          })}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {heap.attrs.map((row) => (
          <RowView key={row.id} row={row} ctx={ctx} stacked={heap.zone !== "class" && !ctx.wide} />
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
          <div className={`grid items-start gap-2 ${ctx.wide ? "grid-cols-1" : "grid-cols-2"}`}>
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
/* Overview scenes (no code)                                                   */
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
    if (reduce || !running || elapsed.current > 14) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += (now - last) / 1000;
      last = now;
      setT(elapsed.current);
      if (elapsed.current > 14) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [resetKey, reduce, running]);
  return t;
}

// One color per idea, shared with the code slides: public is green, protected
// amber, private violet, and the methods that guard the data are blue.
const TONE = {
  public: {
    box: "border-mint/50",
    pill: "border-mint/40 bg-mint/10 text-mint",
    text: "text-mint",
    bg: "bg-mint",
    chip: "val" as Kind,
  },
  protected: {
    box: "border-amber/50",
    pill: "border-amber/40 bg-amber/10 text-amber",
    text: "text-amber",
    bg: "bg-amber",
    chip: "cls" as Kind,
  },
  private: {
    box: "border-violet/50",
    pill: "border-violet/40 bg-violet/10 text-violet",
    text: "text-violet",
    bg: "bg-violet",
    chip: "fn" as Kind,
  },
  gate: {
    box: "border-sky-400/50",
    pill: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    text: "text-sky-300",
    bg: "bg-sky-400",
    chip: "ref" as Kind,
  },
  bad: {
    box: "border-rose-400/50",
    pill: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    text: "text-rose-300",
    bg: "bg-rose-400",
    chip: "no" as Kind,
  },
};
type Tone = keyof typeof TONE;

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-px font-mono text-[9px] leading-[14px] tracking-wider ${TONE[tone].pill}`}
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

// Every overview scene sits on its own dark panel, so lines, labels and text
// stay readable on any page theme.
function Backdrop({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
      style={{ width: DESIGN_W, height: BODY_H }}
    >
      {children}
    </motion.div>
  );
}

/* Step 1: data and rules live together; outside code asks through the methods */

function IdeaScene({ t }: { t: number }) {
  const r1 = t >= 0.6 && t < 3.4;
  const r2 = t >= 3.6 && t < 7.0;
  const atGate = r1 ? t >= 1.4 : t >= 4.4;
  const declined = t >= 2.3 && t < 3.4;
  const accepted = t >= 5.3 && t < 7.0;
  const balance = t >= 5.5 ? "$800" : "$1000";

  return (
    <Backdrop>
      {/* Outside code, with a short history of what it asked for */}
      <div
        className="absolute rounded-xl border border-white/20 bg-slate-900 p-3"
        style={{ left: 24, top: 110, width: 190, height: 230 }}
      >
        <p className="text-[14px] font-medium text-white">Outside code</p>
        <p className="text-[11px] leading-4 text-slate-400">wants to change the balance</p>
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1.5 text-[11px]">
          {t >= 2.3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
              <span className="text-slate-300">Take out $5,000</span>
              <span className="flex items-center gap-1 text-rose-300">
                <XCircle className="size-3" /> declined
              </span>
            </motion.div>
          )}
          {t >= 5.3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
              <span className="text-slate-300">Take out $200</span>
              <span className="flex items-center gap-1 text-mint">
                <CheckCircle2 className="size-3" /> accepted
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* The object: methods in front, data behind */}
      <div className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 290, top: 24, width: 486, height: 402 }}>
        <p className="absolute text-[14px] font-medium text-white" style={{ left: 16, top: 12 }}>
          BankAccount object
        </p>

        <div className={`absolute rounded-xl border bg-slate-950 ${TONE.gate.box}`} style={{ left: 16, top: 52, width: 454, height: 128 }}>
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Pill tone="gate">methods</Pill>
            <span className="text-[11px] text-slate-400">the gate: the rules run first</span>
          </div>
          <div className="absolute right-3 top-10 flex gap-1.5">
            <Chip kind="ref">deposit</Chip>
            <Chip kind="ref">withdraw</Chip>
          </div>
          <p className="absolute bottom-3 left-3 text-[11px] text-slate-500">checks the amount, then decides</p>
          <div className="absolute bottom-3 right-3">
            {declined && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${TONE.bad.pill}`}
              >
                <XCircle className="size-3.5" /> declined: more than the balance
              </motion.span>
            )}
            {accepted && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${TONE.public.pill}`}
              >
                <CheckCircle2 className="size-3.5" /> accepted
              </motion.span>
            )}
          </div>
        </div>

        <div className="absolute flex flex-col items-center text-slate-500" style={{ left: 16, top: 184, width: 454, height: 36 }}>
          <ArrowDown className="size-4" />
          <span className="text-[10px] leading-3">only if the rules pass</span>
        </div>

        <div className={`absolute rounded-xl border bg-slate-950 ${TONE.private.box}`} style={{ left: 16, top: 224, width: 454, height: 158 }}>
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <Pill tone="private">data</Pill>
            <span className="text-[11px] text-slate-400">kept inside the object</span>
          </div>
          <div className="absolute inset-x-0 top-[68px] flex items-center justify-center gap-3">
            <Lock className="size-5 text-violet" />
            <span className="font-mono text-[14px] text-cyan-200">balance</span>
            <span className="font-mono text-slate-500">=</span>
            <Chip kind="fn">{balance}</Chip>
          </div>
        </div>
      </div>

      {/* The request that is travelling to the gate */}
      {(r1 || r2) && (
        <motion.div
          key={r1 ? "r1" : "r2"}
          initial={{ x: 40, y: 168, opacity: 0 }}
          animate={{ x: atGate ? 318 : 40, y: atGate ? 118 : 168, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute left-0 top-0 z-20 flex h-7 items-center rounded-lg border border-white/30 bg-slate-800 px-3 text-[12px] text-white shadow-lg"
        >
          {r1 ? "Take out $5,000" : "Take out $200"}
        </motion.div>
      )}
    </Backdrop>
  );
}

/* Step 2: three access levels, all signalled by names */

const LEVELS: {
  tone: Tone;
  label: string;
  title: string;
  example: string;
  sub: string;
  result: string;
  reach: string[];
  len: number;
}[] = [
    {
      tone: "public",
      label: "public",
      title: "Public",
      example: "name",
      sub: "No underscore",
      result: "Allowed, as normal",
      reach: ["Part of the class's interface", "Use it freely"],
      len: 70,
    },
    {
      tone: "protected",
      label: "protected",
      title: "Protected",
      example: "_name",
      sub: "One underscore",
      result: "Allowed, but a signal to stay away",
      reach: ["Meant for the class and subclasses", "A convention, not a lock"],
      len: 70,
    },
    {
      tone: "private",
      label: "private",
      title: "Private",
      example: "__name",
      sub: "Two underscores",
      result: "The plain name is not found",
      reach: ["Python renames it (mangling)", "Guards against accidents"],
      len: 52,
    },
  ];

function LevelsScene({ t }: { t: number }) {
  return (
    <Backdrop>
      {LEVELS.map((lv, i) => {
        const t0 = 0.6 + i * 1.8;
        const go = t >= t0;
        const done = t >= t0 + 0.9;
        const tone = TONE[lv.tone];
        const Icon = i === 0 ? CheckCircle2 : i === 1 ? AlertTriangle : XCircle;
        return (
          <motion.div
            key={lv.tone}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.12 }}
            className={`absolute overflow-hidden rounded-2xl border bg-slate-900 p-3 ${tone.box}`}
            style={{ left: 12 + i * 264, top: 12, width: 248, height: 426 }}
          >
            <Pill tone={lv.tone}>{lv.label}</Pill>
            <p className="mt-1.5 text-[16px] font-medium leading-5 text-white">{lv.title}</p>
            <p className="text-[12px] leading-4 text-slate-400">{lv.sub}</p>
            <div className="mt-3 flex items-center gap-2">
              <Chip kind={tone.chip}>{lv.example}</Chip>
              <span className="text-[11px] text-slate-500">attribute name</span>
            </div>

            {/* A visitor from outside tries to reach the attribute */}
            <div className="relative mt-3" style={{ height: 120 }}>
              <span className="absolute left-0 top-[44px] rounded-md border border-white/20 bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                outside
              </span>
              <motion.div
                className={`absolute top-[56px] h-[3px] rounded-full ${tone.bg}`}
                style={{ left: 58 }}
                initial={{ width: 0 }}
                animate={{ width: go ? lv.len : 0 }}
                transition={{ duration: 0.6 }}
              />
              <div
                className={`absolute flex items-center justify-center rounded-lg border bg-slate-950 ${tone.box} ${i === 1 ? "border-dashed" : ""
                  } ${i === 2 ? "border-l-[5px] border-l-violet" : ""}`}
                style={{ left: 128, top: 24, width: 92, height: 64 }}
              >
                <Chip kind={tone.chip}>{lv.example}</Chip>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.6 }}
                className={`absolute ${tone.text}`}
                style={{ left: 196, top: 4 }}
              >
                <Icon className="size-5" />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: done ? 1 : 0 }}
              className={`mt-2 flex items-center gap-1.5 text-[12px] leading-4 ${tone.text}`}
              style={{ minHeight: 34 }}
            >
              {lv.result}
            </motion.p>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3">
              {lv.reach.map((r) => (
                <div key={r} className="flex items-start gap-2 text-[12px] leading-4 text-slate-300">
                  <Check className={`mt-0.5 size-3.5 shrink-0 ${tone.text}`} />
                  {r}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </Backdrop>
  );
}

/* Step 3: name mangling, a rename and not a lock */

function ManglingScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      <p className="absolute inset-x-0 text-center text-[14px] text-white" style={{ top: 28 }}>
        Inside the class, Python renames an attribute that starts with two underscores
      </p>

      <div className="absolute inset-x-0 flex items-center justify-center gap-6" style={{ top: 84 }}>
        <motion.div animate={fade(t >= 0.4)} className="rounded-xl border border-violet/50 bg-slate-900 px-5 py-3 font-mono text-[18px] text-violet">
          __pin
        </motion.div>
        <motion.div animate={{ opacity: t >= 1.2 ? 1 : 0 }} className="flex flex-col items-center text-slate-400">
          <span className="text-[10px] tracking-wider">renamed</span>
          <ArrowRight className="size-6" />
        </motion.div>
        <motion.div
          animate={fade(t >= 2.0)}
          className="rounded-xl border border-violet/50 bg-slate-900 px-5 py-3 font-mono text-[18px] text-violet shadow-[0_0_24px_rgba(167,139,250,0.2)]"
        >
          _BankAccount__pin
        </motion.div>
      </div>

      <motion.div
        animate={fade(t >= 3.2)}
        className={`absolute rounded-xl border bg-slate-900 p-4 ${TONE.bad.box}`}
        style={{ left: 40, top: 190, width: 340, height: 130 }}
      >
        <p className="text-[12px] text-slate-400">Looking for the plain name</p>
        <p className="mt-1 font-mono text-[15px] text-white">__pin</p>
        <p className={`mt-3 flex items-center gap-2 text-[13px] ${TONE.bad.text}`}>
          <XCircle className="size-4" /> Not found, that name no longer exists
        </p>
      </motion.div>

      <motion.div
        animate={fade(t >= 4.4)}
        className={`absolute rounded-xl border bg-slate-900 p-4 ${TONE.public.box}`}
        style={{ left: 420, top: 190, width: 340, height: 130 }}
      >
        <p className="text-[12px] text-slate-400">Looking for the renamed attribute</p>
        <p className="mt-1 font-mono text-[15px] text-white">_BankAccount__pin</p>
        <p className={`mt-3 flex items-center gap-2 text-[13px] ${TONE.public.text}`}>
          <CheckCircle2 className="size-4" /> Found, it holds 1234
        </p>
      </motion.div>

      <motion.div
        animate={fade(t >= 5.6)}
        className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
        style={{ left: 90, top: 356, width: 620, height: 60 }}
      >
        <Shield className="size-6 shrink-0 text-amber" />
        <div>
          <p className="text-[14px] font-medium text-white">A signal, not a security feature</p>
          <p className="text-[12px] text-slate-400">Anyone who knows the new name can still use it.</p>
        </div>
      </motion.div>
    </Backdrop>
  );
}

/* Step 4: a property reads and assigns like an attribute but runs a method */

type Move = { text: string; kind: Kind; from: [number, number]; to: [number, number]; start: number; dur: number };

const MOVES: Move[] = [
  { text: "read", kind: "ret", from: [196, 112], to: [296, 112], start: 0.8, dur: 0.7 },
  { text: "$1000", kind: "fn", from: [584, 206], to: [480, 112], start: 1.8, dur: 0.6 },
  { text: "$1000", kind: "fn", from: [296, 112], to: [186, 112], start: 2.5, dur: 0.6 },
  { text: "1500", kind: "ret", from: [196, 196], to: [296, 236], start: 3.6, dur: 0.7 },
  { text: "1500", kind: "val", from: [480, 236], to: [584, 214], start: 4.9, dur: 0.6 },
  { text: "-50", kind: "ret", from: [196, 280], to: [296, 252], start: 6.0, dur: 0.7 },
];

function Mover({ m, t }: { m: Move; t: number }) {
  if (t < m.start || t > m.start + m.dur + 0.3) return null;
  const arrived = t >= m.start + 0.05;
  return (
    <motion.div
      key={`${m.text}-${m.start}`}
      initial={{ x: m.from[0], y: m.from[1], opacity: 0 }}
      animate={{ x: arrived ? m.to[0] : m.from[0], y: arrived ? m.to[1] : m.from[1], opacity: t > m.start + m.dur ? 0 : 1 }}
      transition={{ duration: m.dur, ease: "easeInOut" }}
      className="absolute left-0 top-0 z-20"
    >
      <span className={`${chipBase} shadow-lg ${chipClass[m.kind]}`}>{m.text}</span>
    </motion.div>
  );
}

function PropertyScene({ t }: { t: number }) {
  const rows = [
    { label: "Read the balance", on: t >= 0.5 && t < 3.4, result: t >= 3.0 ? "$1000" : null, tone: "gate" as Tone },
    { label: "Set the balance to 1500", on: t >= 3.4 && t < 5.9, result: t >= 5.6 ? "accepted" : null, tone: "public" as Tone },
    { label: "Set the balance to -50", on: t >= 5.9, result: t >= 7.1 ? "rejected" : null, tone: "bad" as Tone },
  ];
  const getterOn = t >= 1.5 && t < 3.0;
  const setterOn = (t >= 4.3 && t < 5.9) || t >= 6.7;
  const passes = t >= 4.5 && t < 5.9;
  const fails = t >= 6.9;
  const internal = t >= 5.5 ? "$1500" : "$1000";

  return (
    <Backdrop>
      <div className="absolute rounded-xl border border-white/20 bg-slate-900 p-3" style={{ left: 20, top: 60, width: 176, height: 320 }}>
        <p className="text-[14px] font-medium text-white">Outside code</p>
        <p className="text-[11px] leading-4 text-slate-400">uses it like an attribute</p>
        <div className="mt-3 flex flex-col gap-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className={`rounded-lg border px-2 py-1.5 transition-colors duration-300 ${r.on ? `${TONE[r.tone].box} bg-slate-950` : "border-white/10"
                }`}
              style={{ height: 66 }}
            >
              <p className="text-[11px] leading-4 text-slate-200">{r.label}</p>
              <div className="mt-1 h-5">
                {r.result &&
                  (r.result === "$1000" ? (
                    <Chip kind="fn">{r.result}</Chip>
                  ) : (
                    <span className={`text-[11px] ${TONE[r.tone].text}`}>{r.result}</span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute rounded-2xl border bg-slate-900 p-3 ${TONE.gate.box}`} style={{ left: 296, top: 60, width: 190, height: 320 }}>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-white">balance</p>
          <Pill tone="gate">property</Pill>
        </div>
        <div
          className={`mt-3 rounded-lg border px-3 py-2 transition-colors duration-300 ${getterOn ? `${TONE.gate.box} bg-slate-950` : "border-white/10"}`}
          style={{ height: 70 }}
        >
          <p className="text-[12px] text-sky-300">getter</p>
          <p className="text-[11px] leading-4 text-slate-400">runs when the value is read</p>
        </div>
        <div
          className={`mt-3 rounded-lg border px-3 py-2 transition-colors duration-300 ${fails ? `${TONE.bad.box} bg-slate-950` : setterOn ? `${TONE.gate.box} bg-slate-950` : "border-white/10"
            }`}
          style={{ height: 150 }}
        >
          <p className="text-[12px] text-sky-300">setter</p>
          <p className="text-[11px] leading-4 text-slate-400">runs on every assignment</p>
          <div className="mt-2 rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-300">
            rule: not negative
          </div>
          <div className="mt-2 h-6">
            {passes && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-1 text-[11px] ${TONE.public.text}`}>
                <CheckCircle2 className="size-3.5" /> passes the rule
              </motion.span>
            )}
            {fails && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-1 text-[11px] ${TONE.bad.text}`}>
                <XCircle className="size-3.5" /> fails: ValueError
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className={`absolute rounded-2xl border bg-slate-900 p-3 ${TONE.private.box}`} style={{ left: 584, top: 150, width: 196, height: 150 }}>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-white">Internal data</p>
          <Pill tone="private">private</Pill>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Lock className="size-4 text-violet" />
          <span className="font-mono text-[12px] text-cyan-200">_balance</span>
        </div>
        <div className="mt-2 flex justify-center">
          <Chip kind="fn">{internal}</Chip>
        </div>
      </div>

      {MOVES.map((m) => (
        <Mover key={`${m.text}-${m.start}`} m={m} t={t} />
      ))}
    </Backdrop>
  );
}

/* Step 5: four things to remember */

const REMEMBER: { tone: Tone; icon: typeof Shield; title: string; body: string }[] = [
  { tone: "gate", icon: Shield, title: "Bundle", body: "Data and the methods that manage it live together in one class." },
  { tone: "protected", icon: AlertTriangle, title: "Signal", body: "One underscore and two underscores tell other developers how an attribute should be used." },
  { tone: "public", icon: CheckCircle2, title: "Protect", body: "Methods and properties check a value before the object's state changes." },
  { tone: "private", icon: Unlock, title: "Not a lock", body: "Conventions and name mangling are not security. The data is still reachable." },
];

function RememberScene({ t }: { t: number }) {
  return (
    <Backdrop>
      {REMEMBER.map((r, i) => {
        const on = t >= 0.4 + i * 0.9;
        const Icon = r.icon;
        return (
          <motion.div
            key={r.title}
            animate={{ opacity: on ? 1 : 0, y: on ? 0 : 14 }}
            transition={{ duration: 0.4 }}
            className={`absolute rounded-2xl border bg-slate-900 p-5 ${TONE[r.tone].box}`}
            style={{ left: 24 + (i % 2) * 388, top: 24 + Math.floor(i / 2) * 212, width: 364, height: 188 }}
          >
            <div className={`flex size-10 items-center justify-center rounded-xl border ${TONE[r.tone].pill}`}>
              <Icon className="size-5" />
            </div>
            <p className="mt-3 text-[17px] font-medium text-white">{r.title}</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-300">{r.body}</p>
          </motion.div>
        );
      })}
    </Backdrop>
  );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
  const t = useClock(step, reduce, running);
  return (
    <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
      <AnimatePresence mode="wait">
        {step === 0 && <IdeaScene key="idea" t={t} />}
        {step === 1 && <LevelsScene key="levels" t={t} />}
        {step === 2 && <ManglingScene key="mangling" t={t} />}
        {step === 3 && <PropertyScene key="property" t={t} />}
        {step === 4 && <RememberScene key="remember" t={t} />}
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
  title: "Keeping data and its rules together",
  steps: [
    {
      label: "The idea",
      ms: 8200,
      note: "Encapsulation keeps data and the rules for changing it together in one class. Outside code asks through methods, and the methods decide what is allowed.",
    },
    {
      label: "Access levels",
      ms: 7600,
      note: "Python signals access with names: plain is public, one underscore is for internal use, and two underscores are renamed. These are signals to other developers, not locks.",
    },
    {
      label: "Mangling",
      ms: 7400,
      note: "A double underscore triggers name mangling. Python stores __pin as _BankAccount__pin, so the old name fails, but the new one still works.",
    },
    {
      label: "Properties",
      ms: 9400,
      note: "A property lets outside code read and assign like an ordinary attribute while a getter or setter runs behind the scenes, so the class can validate every change.",
    },
    {
      label: "Remember",
      ms: 6000,
      note: "Encapsulation bundles data with its rules, signals intent with names, and protects state with methods and properties. Conventions are not security.",
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

export function EncapsulationCustomAnimation() {
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

  const ctx: Ctx = { step, view, prev, reg, reduce, timed, dense: !!codeSlide.dense, wide: !!codeSlide.wide };
  // Card heights are fixed for a whole slide: the console holds its prompt plus every printed line.
  const consoleH = 42 + (codeSlide.consoleRows ?? 3) * 20;
  const codeH = BODY_H - 8 - consoleH;
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
                    <CodeEditor lines={codeSlide.lines} ctx={ctx} height={codeH} />
                    <ConsolePanel ctx={ctx} height={consoleH} />
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