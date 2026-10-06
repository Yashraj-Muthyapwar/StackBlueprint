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
  Building2,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  Pause,
  Play,
  RotateCcw,
  User,
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
const CODE_H = 320;
const CONSOLE_H = 122;
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
type Swap = { text: string; kind: Kind };
type Row = { id: string; name: string; value: string; kind: Kind };
type Method = { id: string; name: string };
type Zone = "class" | "object" | "frame";
// The class, an object, or a temporary method-call frame living in memory.
type Heap = { id: string; title: string; zone: Zone; methods?: Method[]; attrs: Row[] };
type Badge = { line: number; text: string; label?: string; kind?: Kind; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n class name   v name being assigned   u value being read   a argument
 *   c call target  k separator             e closing paren      g printed value
 *   q literal (highlighted as code)
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
const M = (name: string): Method => ({ id: `cls_${name}`, name });
const CLS = (name: string, methods: Method[], attrs: Row[] = []): Heap => ({
  id: "cls",
  title: `class ${name}`,
  zone: "class",
  methods,
  attrs,
});
const OBJ = (id: "o1" | "o2", title: string, attrs: Row[]): Heap => ({ id, title, zone: "object", attrs });
const FRAME = (title: string, attrs: Row[]): Heap => ({ id: "fr", title, zone: "frame", attrs });

const EMP1 = N("m_emp1", "employee1", "<Employee #1>");
const EMP2 = N("m_emp2", "employee2", "<Employee #2>");
const STU1 = N("m_stu1", "student1", "<Course #1>");
const STU2 = N("m_stu2", "student2", "<Course #2>");

const slides: Slide[] = [
  /* 1 Instance attributes -------------------------------------------------- */
  {
    eyebrow: "Instance attributes",
    title: "Each object keeps its own copy of instance attributes",
    lines: [
      "class ⟦n:Employee⟧:",
      "    def __init__(self, name, salary):",
      "        self.name = ⟦u0:name⟧",
      "        self.salary = ⟦u1:salary⟧",
      "",
      '⟦v1:employee1⟧ = ⟦c1:Employee(⟧⟦a0:"Maya"⟧⟦k0:, ⟧⟦a1:70000⟧⟦e1:)⟧',
      '⟦v2:employee2⟧ = ⟦c2:Employee(⟧⟦a2:"Leo"⟧⟦k2:, ⟧⟦a3:82000⟧⟦e2:)⟧',
      "⟦v3:employee1.salary⟧ = ⟦q:75000⟧",
      "print(⟦g0:employee1.salary⟧)",
      "print(⟦g1:employee2.salary⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3],
        flights: [{ from: "n", to: "obj_cls", text: "class Employee", kind: "cls" }],
        heaps: [CLS("Employee", [M("__init__")])],
        note: "The class statement creates the Employee class and stores __init__ on it. No employee exists yet.",
      },
      {
        label: "Create",
        active: [5],
        hot: ["a0", "a1"],
        flights: [
          { from: "c1", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_emp1", text: "<Employee #1>", kind: "ref", at: 1.3 },
        ],
        heaps: [OBJ("o1", "Employee #1", [])],
        globals: [EMP1],
        note: "Calling Employee(...) builds a new, empty object, and the name employee1 will refer to it.",
      },
      {
        label: "Store",
        active: [2, 3],
        flights: [
          { from: "a0", to: "u0", text: '"Maya"', kind: "val", at: 0.2 },
          { from: "a1", to: "u1", text: "70000", kind: "val", at: 0.34 },
          { from: "u0", to: "o1_name", text: '"Maya"', kind: "val", at: 1.2 },
          { from: "u1", to: "o1_salary", text: "70000", kind: "val", at: 1.34 },
        ],
        swap: { u0: { text: '"Maya"', kind: "val" }, u1: { text: "70000", kind: "val" } },
        heaps: [OBJ("o1", "Employee #1", [R("o1_name", "name", '"Maya"'), R("o1_salary", "salary", "70000")])],
        note: "self.name = name stores the value on this one object. Every object gets its own copy of each instance attribute.",
      },
      {
        label: "Second object",
        active: [6],
        hot: ["a2", "a3"],
        drop: ["u0", "u1"],
        flights: [
          { from: "c2", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "a2", to: "o2_name", text: '"Leo"', kind: "val", at: 1.0 },
          { from: "a3", to: "o2_salary", text: "82000", kind: "val", at: 1.14 },
          { from: "obj_o2", to: "m_emp2", text: "<Employee #2>", kind: "ref", at: 2.0 },
        ],
        heaps: [OBJ("o2", "Employee #2", [R("o2_name", "name", '"Leo"'), R("o2_salary", "salary", "82000")])],
        globals: [EMP2],
        note: "The same steps build a second object. It follows the same class but holds its own values.",
      },
      {
        label: "Update",
        active: [7],
        flights: [{ from: "q", to: "o1_salary", text: "75000", kind: "val", at: 0.3 }],
        heaps: [OBJ("o1", "Employee #1", [R("o1_salary", "salary", "75000")])],
        note: "Assigning through employee1 changes the attribute stored on that one object. Nothing else is touched.",
      },
      {
        label: "Read",
        active: [8, 9],
        flights: [
          { from: "o1_salary", to: "g0", text: "75000", kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "75000", kind: "ret", at: 1.1 },
          { from: "o2_salary", to: "g1", text: "82000", kind: "val", at: 1.6 },
          { from: "g1", to: "cons1", text: "82000", kind: "ret", at: 2.5 },
        ],
        swap: { g0: { text: "75000", kind: "val" }, g1: { text: "82000", kind: "val" } },
        out: ["75000", "82000"],
        note: "employee2 still holds 82000. Instance attributes are separate for every object.",
      },
    ],
  },
  /* 2 Class attributes ----------------------------------------------------- */
  {
    eyebrow: "Class attributes",
    title: "A class attribute is stored once and shared by every object",
    lines: [
      "class ⟦n:Employee⟧:",
      '    ⟦v0:company⟧ = ⟦q0:"Stack Blueprint"⟧',
      "",
      "    def __init__(self, name):",
      "        self.name = name",
      "",
      '⟦v1:employee1⟧ = ⟦c1:Employee(⟧⟦a0:"Maya"⟧⟦e1:)⟧',
      '⟦v2:employee2⟧ = ⟦c2:Employee(⟧⟦a1:"Leo"⟧⟦e2:)⟧',
      "",
      "print(⟦g0:employee1.company⟧)",
      "print(⟦g1:employee2.company⟧)",
      "print(⟦g2:Employee.company⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 3, 4],
        flights: [
          { from: "n", to: "obj_cls", text: "class Employee", kind: "cls", at: 0.2 },
          { from: "q0", to: "cls_company", text: '"Stack Blueprint"', kind: "val", at: 0.9 },
        ],
        heaps: [CLS("Employee", [M("__init__")], [R("cls_company", "company", '"Stack Blueprint"')])],
        note: "company is assigned in the class body, so it is stored once, on the class itself.",
      },
      {
        label: "Create",
        active: [6, 7],
        hot: ["a0", "a1"],
        flights: [
          { from: "c1", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_name", text: '"Maya"', kind: "val", at: 0.9 },
          { from: "obj_o1", to: "m_emp1", text: "<Employee #1>", kind: "ref", at: 1.6 },
          { from: "c2", to: "obj_o2", text: "new object", kind: "ref", at: 2.3 },
          { from: "a1", to: "o2_name", text: '"Leo"', kind: "val", at: 3.0 },
          { from: "obj_o2", to: "m_emp2", text: "<Employee #2>", kind: "ref", at: 3.7 },
        ],
        heaps: [
          OBJ("o1", "Employee #1", [R("o1_name", "name", '"Maya"')]),
          OBJ("o2", "Employee #2", [R("o2_name", "name", '"Leo"')]),
        ],
        globals: [EMP1, EMP2],
        note: "Each object receives its own name. company is not copied into either object.",
      },
      {
        label: "Read: object 1",
        active: [9],
        flights: [
          { from: "obj_o1", to: "cls_company", text: "company?", kind: "ref", at: 0.2 },
          { from: "cls_company", to: "g0", text: '"Stack Blueprint"', kind: "val", at: 1.1 },
          { from: "g0", to: "cons", text: "Stack Blueprint", kind: "ret", at: 2.0 },
        ],
        swap: { g0: { text: '"Stack Blueprint"', kind: "val" } },
        out: ["Stack Blueprint"],
        note: "employee1 has no company of its own, so Python looks on the class and finds the shared value.",
      },
      {
        label: "Read: object 2",
        active: [10],
        flights: [
          { from: "obj_o2", to: "cls_company", text: "company?", kind: "ref", at: 0.2 },
          { from: "cls_company", to: "g1", text: '"Stack Blueprint"', kind: "val", at: 1.1 },
          { from: "g1", to: "cons", text: "Stack Blueprint", kind: "ret", at: 2.0 },
        ],
        swap: { g1: { text: '"Stack Blueprint"', kind: "val" } },
        out: ["Stack Blueprint"],
        note: "employee2 finds the same value on the class. There is only one copy, and both objects read it.",
      },
      {
        label: "Read: class",
        active: [11],
        flights: [
          { from: "cls_company", to: "g2", text: '"Stack Blueprint"', kind: "val", at: 0.2 },
          { from: "g2", to: "cons", text: "Stack Blueprint", kind: "ret", at: 1.1 },
        ],
        swap: { g2: { text: '"Stack Blueprint"', kind: "val" } },
        out: ["Stack Blueprint"],
        note: "Reading through the class name goes straight to the shared value and makes the ownership clear.",
      },
    ],
  },
  /* 3 Shadowing ------------------------------------------------------------ */
  {
    eyebrow: "Shadowing",
    title: "Assigning through an object creates its own attribute",
    lines: [
      "class ⟦n:Course⟧:",
      "    ⟦v0:duration_weeks⟧ = ⟦q0:8⟧",
      "",
      "⟦v1:student1⟧ = ⟦c1:Course()⟧",
      "⟦v2:student2⟧ = ⟦c2:Course()⟧",
      "",
      "Course.duration_weeks = ⟦q1:10⟧",
      "student1.duration_weeks = ⟦q2:12⟧",
      "",
      "print(⟦g0:student1.duration_weeks⟧)",
      "print(⟦g1:student2.duration_weeks⟧)",
      "print(⟦g2:Course.duration_weeks⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1],
        flights: [
          { from: "n", to: "obj_cls", text: "class Course", kind: "cls", at: 0.2 },
          { from: "q0", to: "cls_dur", text: "8", kind: "val", at: 0.9 },
        ],
        heaps: [CLS("Course", [], [R("cls_dur", "duration_weeks", "8")])],
        note: "duration_weeks lives on the class. Every student will read this one value.",
      },
      {
        label: "Create",
        active: [3, 4],
        flights: [
          { from: "c1", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_stu1", text: "<Course #1>", kind: "ref", at: 1.1 },
          { from: "c2", to: "obj_o2", text: "new object", kind: "ref", at: 1.7 },
          { from: "obj_o2", to: "m_stu2", text: "<Course #2>", kind: "ref", at: 2.6 },
        ],
        heaps: [OBJ("o1", "Course #1", []), OBJ("o2", "Course #2", [])],
        globals: [STU1, STU2],
        note: "Both objects start empty. Neither one holds a copy of duration_weeks.",
      },
      {
        label: "Class update",
        active: [6],
        flights: [{ from: "q1", to: "cls_dur", text: "10", kind: "val", at: 0.3 }],
        heaps: [CLS("Course", [], [R("cls_dur", "duration_weeks", "10")])],
        note: "Assigning through the class changes the shared value for every object.",
      },
      {
        label: "Shadow",
        active: [7],
        flights: [{ from: "q2", to: "o1_dur", text: "12", kind: "val", at: 0.3 }],
        heaps: [OBJ("o1", "Course #1", [R("o1_dur", "duration_weeks", "12")])],
        note: "Assigning through student1 leaves the class alone. It creates a new attribute on student1 that shadows the class value.",
      },
      {
        label: "Read: student1",
        active: [9],
        flights: [
          { from: "o1_dur", to: "g0", text: "12", kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "12", kind: "ret", at: 1.1 },
        ],
        swap: { g0: { text: "12", kind: "val" } },
        out: ["12"],
        note: "student1 finds its own duration_weeks first, so it prints 12.",
      },
      {
        label: "Read: the rest",
        active: [10, 11],
        flights: [
          { from: "obj_o2", to: "cls_dur", text: "duration_weeks?", kind: "ref", at: 0.2 },
          { from: "cls_dur", to: "g1", text: "10", kind: "val", at: 1.0 },
          { from: "g1", to: "cons", text: "10", kind: "ret", at: 1.9 },
          { from: "cls_dur", to: "g2", text: "10", kind: "val", at: 2.5 },
          { from: "g2", to: "cons1", text: "10", kind: "ret", at: 3.4 },
        ],
        swap: { g1: { text: "10", kind: "val" }, g2: { text: "10", kind: "val" } },
        out: ["10", "10"],
        note: "student2 has no attribute of its own, so it reads the class value, 10. The class itself is still 10.",
      },
    ],
  },
  /* 4 Putting it together -------------------------------------------------- */
  {
    eyebrow: "A shared tax rate",
    title: "Each product has its own price but shares one tax rate",
    lines: [
      "class ⟦n:Product⟧:",
      "    ⟦v0:tax_rate⟧ = ⟦q0:8⟧",
      "",
      "    def __init__(self, price):",
      "        self.price = price",
      "",
      "    def price_with_tax(self):",
      "        return ⟦u0:self.price⟧ * (100 + ⟦u1:self.tax_rate⟧) / 100",
      "",
      "⟦v1:laptop⟧ = ⟦c1:Product(⟧⟦a0:900⟧⟦e1:)⟧",
      "print(⟦c2:laptop.price_with_tax()⟧)",
      "Product.tax_rate = ⟦q1:9⟧",
      "print(⟦c3:laptop.price_with_tax()⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 3, 4, 6, 7],
        flights: [
          { from: "n", to: "obj_cls", text: "class Product", kind: "cls", at: 0.2 },
          { from: "q0", to: "cls_tax", text: "8", kind: "val", at: 0.9 },
        ],
        heaps: [CLS("Product", [M("__init__"), M("price_with_tax")], [R("cls_tax", "tax_rate", "8")])],
        note: "tax_rate is a class attribute: one value for every product. price_with_tax() will read both kinds of data.",
      },
      {
        label: "Create",
        active: [9],
        hot: ["a0"],
        flights: [
          { from: "c1", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_price", text: "900", kind: "val", at: 1.0 },
          { from: "obj_o1", to: "m_laptop", text: "<Product #1>", kind: "ref", at: 1.9 },
        ],
        heaps: [OBJ("o1", "Product #1", [R("o1_price", "price", "900")])],
        globals: [N("m_laptop", "laptop", "<Product #1>")],
        note: "price is stored on the laptop object. tax_rate is not copied into it.",
      },
      {
        label: "Call",
        active: [10, 7],
        flights: [
          { from: "o1_price", to: "u0", text: "900", kind: "val", at: 0.2 },
          { from: "obj_o1", to: "cls_tax", text: "tax_rate?", kind: "ref", at: 0.9 },
          { from: "cls_tax", to: "u1", text: "8", kind: "val", at: 1.7 },
          { from: "rv", to: "c2", text: "972.0", kind: "ret", at: 3.4 },
        ],
        swap: {
          u0: { text: "900", kind: "val" },
          u1: { text: "8", kind: "val" },
          c2: { text: "972.0", kind: "ret" },
        },
        badge: { line: 7, text: "972.0", label: "returns", kind: "ret", at: 2.9 },
        note: "self.price comes from the object. tax_rate is not on the object, so Python finds it on the class: 900 * 108 / 100.",
      },
      {
        label: "Print",
        active: [10],
        flights: [{ from: "c2", to: "cons", text: "972.0", kind: "ret", at: 0.2 }],
        out: ["972.0"],
        note: "print writes the result to the console.",
      },
      {
        label: "Change rate",
        active: [11],
        drop: ["u0", "u1"],
        flights: [{ from: "q1", to: "cls_tax", text: "9", kind: "val", at: 0.3 }],
        heaps: [CLS("Product", [M("__init__"), M("price_with_tax")], [R("cls_tax", "tax_rate", "9")])],
        note: "One assignment through the class changes the tax rate for every product.",
      },
      {
        label: "Call again",
        active: [12, 7],
        flights: [
          { from: "o1_price", to: "u0", text: "900", kind: "val", at: 0.2 },
          { from: "obj_o1", to: "cls_tax", text: "tax_rate?", kind: "ref", at: 0.9 },
          { from: "cls_tax", to: "u1", text: "9", kind: "val", at: 1.7 },
          { from: "rv", to: "c3", text: "981.0", kind: "ret", at: 3.4 },
        ],
        swap: {
          u0: { text: "900", kind: "val" },
          u1: { text: "9", kind: "val" },
          c3: { text: "981.0", kind: "ret" },
        },
        badge: { line: 7, text: "981.0", label: "returns", kind: "ret", at: 2.9 },
        note: "The same method reads the same price but the new rate, so the result changes: 900 * 109 / 100.",
      },
      {
        label: "Print",
        active: [12],
        flights: [{ from: "c3", to: "cons", text: "981.0", kind: "ret", at: 0.2 }],
        out: ["981.0"],
        note: "The new tax rate shows up in every price, with no change to the object.",
      },
    ],
  },
  /* 5 Local variables ------------------------------------------------------ */
  {
    eyebrow: "Local variables",
    title: "A local variable disappears when the method ends",
    lines: [
      "class ⟦n:Timer⟧:",
      "    def describe(self):",
      '        ⟦v0:unit⟧ = ⟦q0:"minutes"⟧',
      '        print(f"Measured in {⟦u0:unit⟧}")',
      "",
      "⟦v1:timer⟧ = ⟦c1:Timer()⟧",
      "⟦c2:timer.describe()⟧",
      '⟦g0:print(hasattr(timer, "unit"))⟧',
    ],
    heaps: [CLS("Timer", [M("describe")])],
    steps: [
      {
        label: "Create",
        active: [5],
        flights: [
          { from: "c1", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_timer", text: "<Timer #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "Timer #1", [])],
        globals: [N("m_timer", "timer", "<Timer #1>")],
        note: "Timer has no attributes at all, so the new timer object is empty.",
      },
      {
        label: "Call",
        active: [6, 1],
        flights: [{ from: "obj_o1", to: "fr_self", text: "<Timer #1>", kind: "ref", at: 0.5 }],
        heaps: [FRAME("describe() call", [R("fr_self", "self", "<Timer #1>", "ref")])],
        note: "Calling timer.describe() creates a temporary frame for this one call. self refers to the timer object.",
      },
      {
        label: "Local",
        active: [2],
        flights: [{ from: "q0", to: "fr_unit", text: '"minutes"', kind: "val", at: 0.3 }],
        heaps: [FRAME("describe() call", [R("fr_unit", "unit", '"minutes"')])],
        note: "unit is a local variable. It lives in the call frame, not on the timer object.",
      },
      {
        label: "Print",
        active: [3],
        flights: [
          { from: "fr_unit", to: "u0", text: "minutes", kind: "val", at: 0.2 },
          { from: "u0", to: "cons", text: "Measured in minutes", kind: "ret", at: 1.2 },
        ],
        swap: { u0: { text: "minutes", kind: "val" } },
        out: ["Measured in minutes"],
        note: "The method reads its local variable while the call is running and prints it.",
      },
      {
        label: "Finish",
        active: [6],
        drop: ["u0"],
        remove: ["fr"],
        note: "When describe() ends, its frame is destroyed and unit disappears with it.",
      },
      {
        label: "Check",
        active: [7],
        flights: [
          { from: "obj_o1", to: "g0", text: "unit?", kind: "ref", at: 0.2 },
          { from: "g0", to: "cons", text: "False", kind: "ret", at: 1.2 },
        ],
        swap: { g0: { text: "False", kind: "no" } },
        out: ["False"],
        note: "The timer never stored unit, so hasattr is False. Use self.unit when data should stay on the object.",
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
const BUILTIN_NAMES = new Set(["print", "hasattr"]);

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

// A value chip that replaces a name or an expression in the code.
function Slot({
  id,
  reg,
  text,
  kind,
  fly,
  land,
}: {
  id: string;
  reg: Reg;
  text: string;
  kind: Kind;
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

// Four fixed rows: the prompt plus up to three printed lines.
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

// Colors match across the slides: the class is blue, object 1 amber, object 2 green.
const HEAP_LOOK: Record<string, { box: string; chip: Kind }> = {
  cls: { box: "border-dashed border-sky-400/50 bg-sky-400/5", chip: "ref" },
  o1: { box: "border-amber/30 bg-amber/5", chip: "cls" },
  o2: { box: "border-mint/30 bg-mint/5", chip: "val" },
  fr: { box: "border-dashed border-violet/40 bg-violet/5", chip: "fn" },
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
                className={`${chipBase} ${chipClass.fn}`}
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
        <ZoneBox label="objects" height={ZONE_OBJECTS_H}>
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
function useClock(resetKey: number, reduce: boolean) {
  const [t, setT] = useState(reduce ? 99 : 0);
  useEffect(() => {
    if (reduce) {
      setT(99);
      return;
    }
    setT(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      const sec = (performance.now() - start) / 1000;
      setT(sec);
      if (sec > 9) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [resetKey, reduce]);
  return t;
}

// One color per kind of variable, used by every card in the overview.
const CAT = {
  instance: {
    box: "border-mint/40",
    pill: "border-mint/40 bg-mint/10 text-mint",
    dash: "border-mint/30",
    glow: "shadow-[0_0_24px_rgba(64,224,180,0.12)]",
  },
  class: {
    box: "border-sky-400/50",
    pill: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    dash: "border-sky-400/40",
    glow: "shadow-[0_0_24px_rgba(56,189,248,0.12)]",
  },
  local: {
    box: "border-violet/40",
    pill: "border-violet/40 bg-violet/10 text-violet",
    dash: "border-violet/40",
    glow: "shadow-[0_0_24px_rgba(167,139,250,0.12)]",
  },
};
type Cat = keyof typeof CAT;

function Pill({ cat, className, children }: { cat: Cat; className?: string; children: ReactNode }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2 py-px font-mono text-[9px] tracking-wider ${className ?? CAT[cat].pill
        }`}
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

function ValueRow({ label, ghost, children }: { label: string; ghost?: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex h-7 items-center gap-2 overflow-hidden rounded-md border px-2 font-mono text-[11px] ${ghost ? "border-dashed border-sky-400/40" : "border-white/10 bg-slate-900"
        }`}
    >
      <span className={`shrink-0 ${ghost ? "text-slate-500" : "text-cyan-200"}`}>{label}</span>
      <span className="text-slate-500">=</span>
      {children}
    </div>
  );
}

function OvCard({
  x,
  y,
  w,
  h,
  cat,
  opacity,
  delay,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  cat: Cat;
  opacity: number;
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: y + 12 }}
      animate={{ opacity, y }}
      transition={{ duration: 0.35, delay }}
      className={`absolute left-0 top-0 overflow-hidden rounded-xl border bg-slate-950 p-2.5 ${CAT[cat].box} ${CAT[cat].glow}`}
      style={{ left: x, width: w, height: h }}
    >
      {children}
    </motion.div>
  );
}

function ObjectCard({
  x,
  title,
  name,
  salary,
  pill,
  pillClass,
  ghost,
  ghostValue,
  opacity,
  delay,
}: {
  x: number;
  title: string;
  name: string;
  salary: string;
  pill: string;
  pillClass?: string;
  ghost: boolean;
  ghostValue: string;
  opacity: number;
  delay: number;
}) {
  return (
    <OvCard x={x} y={176} w={240} h={156} cat="instance" opacity={opacity} delay={delay}>
      <div className="mb-2 flex h-5 items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-xs text-mint">
          <User className="size-3.5" />
          {title}
        </span>
        <Pill cat="instance" className={pillClass}>
          {pill}
        </Pill>
      </div>
      <div className="flex flex-col gap-1">
        <ValueRow label="name">
          <Chip kind="val">{name}</Chip>
        </ValueRow>
        <ValueRow label="salary">
          <Chip kind="val">{salary}</Chip>
        </ValueRow>
        <div className="h-7">
          {ghost && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ValueRow label="company" ghost>
                <Chip kind="ref">{ghostValue}</Chip>
              </ValueRow>
            </motion.div>
          )}
        </div>
      </div>
    </OvCard>
  );
}

const LEGEND: { cat: Cat; pill: string; title: string; line1: string; line2: string }[] = [
  { cat: "instance", pill: "instance", title: "Instance attribute", line1: "Owned by one object", line2: "Lives as long as that object" },
  { cat: "class", pill: "class", title: "Class attribute", line1: "Shared by every object", line2: "Stored once, on the class" },
  { cat: "local", pill: "local", title: "Local variable", line1: "Used by one method call", line2: "Gone when the call ends" },
];

// Steps: 0 overview, 1 instance, 2 class, 3 local. The same cards stay on screen;
// each step lights one kind and dims the others.
function DiagramScene({ at, t, reduce }: { at: number; t: number; reduce: boolean }) {
  const [entered, setEntered] = useState(reduce);
  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 1800);
    return () => window.clearTimeout(id);
  }, []);
  const d = (n: number) => (entered ? 0 : n);

  const instOpacity = at === 3 ? 0.3 : 1;
  const classOpacity = at === 1 || at === 3 ? 0.3 : 1;
  const localOpacity = at === 1 || at === 2 ? 0.3 : 1;
  const lineOpacity = at === 2 ? 1 : at === 0 ? 0.5 : 0.15;
  const legendOpacity = (i: number) => (at === 0 ? 1 : at === i + 1 ? 1 : 0.3);

  const salaryChanged = at === 1 && t >= 1.6;
  const salary1 = at > 1 || salaryChanged ? "75000" : "70000";
  const companyChanged = at > 2 || (at === 2 && t >= 2.4);
  const company = companyChanged ? '"Blueprint Inc"' : '"Stack Blueprint"';
  const ghostOn = at === 2 && t >= 0.8;
  const ghostValue = at === 2 && t >= 3.0 ? '"Blueprint Inc"' : '"Stack Blueprint"';

  const frameOn = at === 0 || (at === 3 && t >= 0.2 && t < 3.2);
  const ended = at === 3 && t >= 3.4;
  const total = at === 3 && t >= 1.4 ? "120" : "0";
  const pct = at === 0 ? 55 : Math.max(0, Math.min(100, ((t - 0.2) / 2.8) * 100));

  const changedPill = "border-amber/50 bg-amber/10 text-amber";
  const mutedPill = "border-white/15 bg-white/5 text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
      style={{ width: DESIGN_W, height: BODY_H }}
    >
      {/* Links from the class to the objects that read it */}
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={DESIGN_W}
        height={BODY_H}
        viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}
      >
        <motion.g animate={{ opacity: lineOpacity }} transition={{ duration: 0.3 }}>
          <line x1={170} y1={112} x2={130} y2={176} stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
          <line x1={350} y1={112} x2={390} y2={176} stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
        </motion.g>
        {at === 2 &&
          t >= 0.3 &&
          !reduce &&
          [
            [170, 112, 130, 176],
            [350, 112, 390, 176],
          ].map(([x1, y1, x2, y2]) => (
            <motion.circle
              key={`${x1}-${y1}`}
              r={4}
              fill="#38bdf8"
              initial={{ cx: x1, cy: y1, opacity: 0 }}
              animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.3, ease: "linear" }}
            />
          ))}
      </svg>

      {/* Class attribute: stored once */}
      <OvCard x={110} y={0} w={300} h={112} cat="class" opacity={classOpacity} delay={d(0)}>
        <div className="mb-2 flex h-5 items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-xs text-sky-300">
            <Building2 className="size-3.5" />
            Employee
          </span>
          <Pill cat="class">class</Pill>
        </div>
        <ValueRow label="company">
          <Chip kind="ref">{company}</Chip>
        </ValueRow>
        <p className="mt-1.5 font-mono text-[10px] text-slate-500">stored once, shared by every object</p>
      </OvCard>

      {/* Instance attributes: one copy per object */}
      <ObjectCard
        x={10}
        title="employee1"
        name='"Maya"'
        salary={salary1}
        pill={at === 1 && t >= 1.6 ? "changed" : "instance"}
        pillClass={at === 1 && t >= 1.6 ? changedPill : undefined}
        ghost={ghostOn}
        ghostValue={ghostValue}
        opacity={instOpacity}
        delay={d(0.3)}
      />
      <ObjectCard
        x={270}
        title="employee2"
        name='"Leo"'
        salary="82000"
        pill={at === 1 && t >= 1.6 ? "unchanged" : "instance"}
        pillClass={at === 1 && t >= 1.6 ? mutedPill : undefined}
        ghost={ghostOn}
        ghostValue={ghostValue}
        opacity={instOpacity}
        delay={d(0.5)}
      />

      {/* Local variable: lives only during one method call */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: localOpacity }}
        transition={{ duration: 0.35, delay: d(0.7) }}
        className="absolute"
        style={{ left: 560, top: 0, width: 240, height: 332 }}
      >
        <div className="mb-2 flex h-5 items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-xs text-violet">
            <Hourglass className="size-3.5" />
            method call
          </span>
          <Pill cat="local">local</Pill>
        </div>
        <div style={{ height: 184 }}>
          <AnimatePresence mode="wait">
            {frameOn ? (
              <motion.div
                key="frame"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`h-full overflow-hidden rounded-xl border border-dashed bg-slate-950 p-2.5 ${CAT.local.dash} ${CAT.local.glow}`}
              >
                <p className="mb-2 font-mono text-[10px] tracking-wider text-violet">one call is running</p>
                <ValueRow label="total">
                  <Chip kind="fn">{total}</Chip>
                </ValueRow>
                <div className="mt-4">
                  <div className="mb-1 font-mono text-[9px] text-slate-500">lifetime of the call</div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-violet"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.12, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/15 px-4 text-center font-mono text-[11px] leading-5 text-slate-500"
              >
                {ended ? "the call ended, so total is gone" : "no method running"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-3 text-center font-mono text-[10px] leading-4 text-slate-500">
          never stored on an object or on the class
        </p>
      </motion.div>

      {/* What each kind means */}
      {LEGEND.map((l, i) => (
        <motion.div
          key={l.cat}
          initial={{ opacity: 0 }}
          animate={{ opacity: legendOpacity(i) }}
          transition={{ duration: 0.35, delay: d(0.9 + i * 0.1) }}
          className={`absolute overflow-hidden rounded-xl border bg-slate-950 p-3 ${CAT[l.cat].box}`}
          style={{ left: i * 272, top: 356, width: 256, height: 94 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-100">{l.title}</span>
            <Pill cat={l.cat}>{l.pill}</Pill>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-slate-300">{l.line1}</p>
          <p className="text-[12px] leading-5 text-slate-500">{l.line2}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Step 4: sort example names into the three kinds, one at a time.
const SORT_ITEMS: { label: string; why: string; bucket: number; at: number }[] = [
  { label: "name", why: "differs per object", bucket: 0, at: 0.6 },
  { label: "tax_rate", why: "the same for all", bucket: 1, at: 1.6 },
  { label: "total", why: "a temporary result", bucket: 2, at: 2.6 },
  { label: "balance", why: "each account has its own", bucket: 0, at: 3.6 },
  { label: "species", why: "a shared default", bucket: 1, at: 4.6 },
  { label: "unit", why: "only needed in this call", bucket: 2, at: 5.6 },
];
const SORT_BUCKETS: { cat: Cat; title: string; question: string }[] = [
  { cat: "instance", title: "Instance attribute", question: "Different for each object?" },
  { cat: "class", title: "Class attribute", question: "The same for every object?" },
  { cat: "local", title: "Local variable", question: "Only needed during one call?" },
];
const SORT_CHIP: Record<Cat, string> = {
  instance: "border-mint/50 bg-mint/15 text-mint",
  class: "border-sky-400/50 bg-sky-400/15 text-sky-300",
  local: "border-violet/50 bg-violet/15 text-violet",
};

function ChooseScene({ t }: { t: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="relative"
      style={{ width: DESIGN_W, height: BODY_H }}
    >
      {SORT_BUCKETS.map((b, i) => {
        const items = SORT_ITEMS.filter((it) => it.bucket === i);
        return (
          <div
            key={b.cat}
            className={`absolute overflow-hidden rounded-2xl border border-dashed bg-slate-950 ${CAT[b.cat].dash}`}
            style={{ left: i * 272, top: 0, width: 256, height: BODY_H }}
          >
            <div className="px-4 pt-4">
              <Pill cat={b.cat}>{b.cat}</Pill>
              <p className="mt-2 text-[15px] font-medium text-slate-100">{b.title}</p>
              <p className="mt-1 text-[12px] leading-4 text-slate-400">{b.question}</p>
            </div>
            {items.map((it, k) =>
              t >= it.at ? (
                <motion.div
                  key={it.label}
                  initial={{ y: -230, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 160, damping: 16 }}
                  className="absolute left-4 right-4"
                  style={{ top: 150 + k * 96 }}
                >
                  <span
                    className={`inline-flex h-9 items-center rounded-lg border px-4 font-mono text-sm ${SORT_CHIP[b.cat]}`}
                  >
                    {it.label}
                  </span>
                  <p className="mt-1.5 text-[12px] leading-4 text-slate-400">{it.why}</p>
                </motion.div>
              ) : null,
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function OverviewScene({ step, reduce }: { step: number; reduce: boolean }) {
  const t = useClock(step, reduce);
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
  title: "Three places to keep data",
  steps: [
    {
      label: "Three places",
      ms: 4600,
      note: "A class can keep data in three different places. They differ in who owns the value and in how long it lives.",
    },
    {
      label: "Instance",
      ms: 5400,
      note: "An instance attribute belongs to one object. Changing employee1's salary does not touch employee2, because each object holds its own copy.",
    },
    {
      label: "Class",
      ms: 6600,
      note: "A class attribute is stored once, on the class. Every object reads the same value, so changing it on the class changes it for all of them.",
    },
    {
      label: "Local",
      ms: 5800,
      note: "A local variable exists only while one method call runs. When the call ends it is gone, and no object or class ever stored it.",
    },
    {
      label: "Choose",
      ms: 8000,
      note: "To choose: different for each object means instance, shared by all means class, and temporary means local.",
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

export function InstanceAndClassAttributesCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
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
    setIdx((target + ENTRIES.length) % ENTRIES.length);
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
                <OverviewScene step={at} reduce={reduce} />
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
            onClick={() => setPlaying((value) => !value)}
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