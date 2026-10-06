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
  ArrowUp,
  BatteryCharging,
  Briefcase,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Laptop,
  Mic,
  Pause,
  PenTool,
  Play,
  Presentation,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
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
const ZONE_NAMES_H = 76;
const ZONE_CLASS_H = 148;
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
// A class card is colored by its role in the family: the root parent, a child, a second parent, or the class that combines them.
type Role = "parent" | "child" | "other" | "own";
type Heap = { id: string; title: string; zone: Zone; role?: Role; methods?: Method[]; attrs: Row[] };
type Badge = { line: number; text: string; label?: string; kind?: Kind; at?: number };

/*
 * Code lines use markers so the animation can find exact tokens: ⟦id:text⟧.
 * The first letter of the id sets the style:
 *   n class name   v name being assigned   u value being read   a argument
 *   c call target  k separator             e closing paren      g printed value
 *   s self         p parameter             q literal (highlighted as code)
 *   (class names n0, n1, ... are flight targets for the class cards in memory)
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
const M = (id: string, name: string, kind: Kind = "fn", label?: string): Method => ({ id, name, kind, label });
const K = (id: string, title: string, role: Role, methods: Method[]): Heap => ({
  id,
  title,
  zone: "class",
  role,
  methods,
  attrs: [],
});
const OBJ = (id: "o1" | "o2", title: string, attrs: Row[]): Heap => ({ id, title, zone: "object", attrs });

// Classes are colored by their role in the family: the root parent is blue, a
// child is green, a second parent is violet. Methods take the color of the class
// that defines them, so you can see which class a method came from.
const PARENT = "ref" as Kind;
const CHILD = "val" as Kind;
const OTHER = "fn" as Kind;

const slides: Slide[] = [
  /* 1 Parent and child ----------------------------------------------------- */
  {
    eyebrow: "Parent and child",
    title: "A child class reuses what its parent already has",
    dense: true,
    lines: [
      "class ⟦n0:Employee⟧:",
      "    def __init__(self, name):",
      "        self.name = ⟦u0:name⟧",
      "",
      "    def introduce(⟦s:self⟧):",
      '        print(f"Hi, I\'m {⟦u1:self.name⟧}.")',
      "",
      "class ⟦n1:Developer⟧(Employee):",
      "    def write_code(⟦s2:self⟧):",
      '        print(f"{⟦u2:self.name⟧} is writing code.")',
      "",
      '⟦v:developer⟧ = ⟦cc:Developer(⟧⟦a0:"Leo"⟧⟦e0:)⟧',
      "⟦c1:developer.introduce()⟧",
      "⟦c2:developer.write_code()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 7, 8, 9],
        flights: [
          { from: "n0", to: "obj_k_emp", text: "class Employee", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_dev", text: "class Developer", kind: CHILD, at: 0.5 },
        ],
        heaps: [
          K("k_emp", "class Employee", "parent", [M("emp___init__", "__init__", PARENT), M("emp_introduce", "introduce", PARENT)]),
          K("k_dev", "class Developer(Employee)", "child", [M("dev_write_code", "write_code", CHILD)]),
        ],
        note: "Developer lists Employee in parentheses, so it inherits everything Employee has, and then adds write_code().",
      },
      {
        label: "Create",
        active: [11],
        hot: ["a0"],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_developer", text: "<Developer #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "Developer #1", [])],
        globals: [N("m_developer", "developer", "<Developer #1>")],
        note: "Python builds a Developer object. It is empty until an __init__ method runs.",
      },
      {
        label: "Init",
        active: [1, 2],
        flights: [
          { from: "obj_k_dev", to: "emp___init__", text: "__init__?", kind: "ref", at: 0.2 },
          { from: "a0", to: "u0", text: '"Leo"', kind: "val", at: 1.1 },
          { from: "u0", to: "o1_name", text: '"Leo"', kind: "val", at: 2.0 },
        ],
        swap: { u0: { text: '"Leo"', kind: "val" } },
        heaps: [OBJ("o1", "Developer #1", [R("o1_name", "name", '"Leo"')])],
        note: "Developer has no __init__ of its own, so Python finds Employee's and runs it. That stores the name.",
      },
      {
        label: "Inherited call",
        active: [12, 4],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "obj_k_dev", text: "introduce?", kind: "ref", at: 0.2 },
          { from: "obj_k_dev", to: "emp_introduce", text: "try parent", kind: "ref", at: 1.0 },
          { from: "c1", to: "s", text: "developer", kind: "ref", at: 1.9 },
        ],
        swap: { s: { text: "developer", kind: "ref", cap: "self" } },
        note: "introduce() is not defined on Developer, so Python looks in Employee and finds it there. self is the developer object.",
      },
      {
        label: "Print",
        active: [5],
        flights: [
          { from: "o1_name", to: "u1", text: "Leo", kind: "val", at: 0.2 },
          { from: "u1", to: "cons", text: "Hi, I'm Leo.", kind: "ret", at: 1.3 },
        ],
        swap: { u1: { text: "Leo", kind: "val" } },
        out: ["Hi, I'm Leo."],
        note: "self.name reads the name that Employee's __init__ stored on this object.",
      },
      {
        label: "Own method",
        active: [13, 8, 9],
        hot: ["c2"],
        drop: ["s", "u1"],
        flights: [
          { from: "c2", to: "dev_write_code", text: "write_code", kind: "val", at: 0.2 },
          { from: "c2", to: "s2", text: "developer", kind: "ref", at: 0.6 },
          { from: "o1_name", to: "u2", text: "Leo", kind: "val", at: 1.2 },
          { from: "u2", to: "cons", text: "Leo is writing code.", kind: "ret", at: 2.1 },
        ],
        swap: { s2: { text: "developer", kind: "ref", cap: "self" }, u2: { text: "Leo", kind: "val" } },
        out: ["Leo is writing code."],
        note: "write_code() is defined on Developer itself, so Python finds it right away, with no search up the family.",
      },
    ],
  },
  /* 2 Constructors and super() --------------------------------------------- */
  {
    eyebrow: "Constructors and super()",
    title: "super() hands shared setup up to the parent",
    lines: [
      "class ⟦n0:Employee⟧:",
      "    def __init__(self, ⟦p2:name⟧):",
      "        self.name = ⟦u1:name⟧",
      "",
      "class ⟦n1:Developer⟧(Employee):",
      "    def __init__(self, ⟦p0:name⟧, ⟦p1:language⟧):",
      "        ⟦c1:super().__init__⟧(⟦u0:name⟧)",
      "        self.language = ⟦u2:language⟧",
      "",
      '⟦v:developer⟧ = ⟦cc:Developer(⟧⟦a0:"Leo"⟧⟦k0:, ⟧⟦a1:"Python"⟧⟦e0:)⟧',
      "print(⟦g0:developer.name⟧)",
      "print(⟦g1:developer.language⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 6, 7],
        flights: [
          { from: "n0", to: "obj_k_emp", text: "class Employee", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_dev", text: "class Developer", kind: CHILD, at: 0.5 },
        ],
        heaps: [
          K("k_emp", "class Employee", "parent", [M("emp___init__", "__init__", PARENT)]),
          K("k_dev", "class Developer(Employee)", "child", [M("dev___init__", "__init__", CHILD)]),
        ],
        note: "Developer defines its own __init__, so it can take two values. Employee's __init__ still handles the shared name.",
      },
      {
        label: "Create",
        active: [9, 5],
        hot: ["a0", "a1"],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "p0", text: '"Leo"', kind: "val", at: 0.5 },
          { from: "a1", to: "p1", text: '"Python"', kind: "val", at: 0.64 },
          { from: "obj_o1", to: "m_developer", text: "<Developer #1>", kind: "ref", at: 1.6 },
        ],
        swap: {
          p0: { text: '"Leo"', kind: "val", cap: "name" },
          p1: { text: '"Python"', kind: "val", cap: "language" },
        },
        heaps: [OBJ("o1", "Developer #1", [])],
        globals: [N("m_developer", "developer", "<Developer #1>")],
        note: "Python uses Developer's __init__ and passes both values in. The object is still empty.",
      },
      {
        label: "super()",
        active: [6, 1],
        flights: [
          { from: "c1", to: "emp___init__", text: "parent's __init__", kind: "ref", at: 0.2 },
          { from: "p0", to: "u0", text: '"Leo"', kind: "val", at: 0.9 },
          { from: "u0", to: "p2", text: '"Leo"', kind: "val", at: 1.8 },
        ],
        swap: { u0: { text: '"Leo"', kind: "val" }, p2: { text: '"Leo"', kind: "val", cap: "name" } },
        note: "super().__init__(name) calls Employee's __init__ and hands it the name. Only the shared value goes up.",
      },
      {
        label: "Parent sets",
        active: [2],
        flights: [
          { from: "p2", to: "u1", text: '"Leo"', kind: "val", at: 0.2 },
          { from: "u1", to: "o1_name", text: '"Leo"', kind: "val", at: 1.2 },
        ],
        swap: { u1: { text: '"Leo"', kind: "val" } },
        heaps: [OBJ("o1", "Developer #1", [R("o1_name", "name", '"Leo"')])],
        note: "Employee's __init__ stores the shared name on the object. This is the part of the setup the parent owns.",
      },
      {
        label: "Child adds",
        active: [7],
        flights: [
          { from: "p1", to: "u2", text: '"Python"', kind: "val", at: 0.2 },
          { from: "u2", to: "o1_lang", text: '"Python"', kind: "val", at: 1.2 },
        ],
        swap: { u2: { text: '"Python"', kind: "val" } },
        heaps: [OBJ("o1", "Developer #1", [R("o1_lang", "language", '"Python"')])],
        note: "Back in Developer's __init__, the child adds data that only developers have: language.",
      },
      {
        label: "Read",
        active: [10, 11],
        flights: [
          { from: "o1_name", to: "g0", text: '"Leo"', kind: "val", at: 0.2 },
          { from: "g0", to: "cons", text: "Leo", kind: "ret", at: 1.1 },
          { from: "o1_lang", to: "g1", text: '"Python"', kind: "val", at: 1.7 },
          { from: "g1", to: "cons1", text: "Python", kind: "ret", at: 2.6 },
        ],
        swap: { g0: { text: '"Leo"', kind: "val" }, g1: { text: '"Python"', kind: "val" } },
        out: ["Leo", "Python"],
        note: "One object now holds both: name from the parent's setup, language from the child's.",
      },
    ],
  },
  /* 3 Method overriding ---------------------------------------------------- */
  {
    eyebrow: "Method overriding",
    title: "A child can replace an inherited method",
    lines: [
      "class ⟦n0:Employee⟧:",
      "    def work(self):",
      '        print(⟦q0:"Employee is working."⟧)',
      "",
      "class ⟦n1:Developer⟧(Employee):",
      "    def work(self):",
      '        print(⟦q1:"Developer is writing code."⟧)',
      "",
      "⟦v0:employee⟧ = ⟦cc0:Employee()⟧",
      "⟦v1:developer⟧ = ⟦cc1:Developer()⟧",
      "⟦c0:employee.work()⟧",
      "⟦c1:developer.work()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 6],
        flights: [
          { from: "n0", to: "obj_k_emp", text: "class Employee", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_dev", text: "class Developer", kind: CHILD, at: 0.5 },
        ],
        heaps: [
          K("k_emp", "class Employee", "parent", [M("emp_work", "work", PARENT)]),
          K("k_dev", "class Developer(Employee)", "child", [M("dev_work", "work", CHILD)]),
        ],
        note: "Both classes define work(). For developer objects, Developer's version will replace the inherited one.",
      },
      {
        label: "Create",
        active: [8, 9],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_employee", text: "<Employee #1>", kind: "ref", at: 1.1 },
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 1.7 },
          { from: "obj_o2", to: "m_developer", text: "<Developer #1>", kind: "ref", at: 2.6 },
        ],
        heaps: [OBJ("o1", "Employee #1", []), OBJ("o2", "Developer #1", [])],
        globals: [N("m_employee", "employee", "<Employee #1>"), N("m_developer", "developer", "<Developer #1>")],
        note: "One plain Employee object and one Developer object. Neither needs any data for this example.",
      },
      {
        label: "Employee",
        active: [10, 1, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "emp_work", text: "work", kind: "ref", at: 0.3 },
          { from: "q0", to: "cons", text: "Employee is working.", kind: "ret", at: 1.4 },
        ],
        out: ["Employee is working."],
        note: "An Employee object finds work() in Employee, the only class involved, and runs it.",
      },
      {
        label: "Developer",
        active: [11, 5, 6],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "dev_work", text: "work", kind: "val", at: 0.3 },
          { from: "c1", to: "emp_work", text: "skipped", kind: "no", at: 0.9 },
          { from: "q1", to: "cons", text: "Developer is writing code.", kind: "ret", at: 1.8 },
        ],
        out: ["Developer is writing code."],
        note: "Python checks Developer first and finds its own work(), so the inherited one is skipped. A child can still call super().work().",
      },
    ],
  },
  /* 4 Multiple inheritance ------------------------------------------------- */
  {
    eyebrow: "Multiple inheritance",
    title: "A child can inherit from more than one parent",
    dense: true,
    lines: [
      "class ⟦n0:Writer⟧:",
      "    def write(self):",
      '        print(⟦q0:"Writing content."⟧)',
      "",
      "class ⟦n1:Speaker⟧:",
      "    def speak(self):",
      '        print(⟦q1:"Speaking to an audience."⟧)',
      "",
      "class ⟦n2:Presenter⟧(Writer, Speaker):",
      "    pass",
      "",
      "⟦v:presenter⟧ = ⟦cc:Presenter()⟧",
      "⟦c0:presenter.write()⟧",
      "⟦c1:presenter.speak()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 6, 8, 9],
        flights: [
          { from: "n0", to: "obj_k_wri", text: "class Writer", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_spk", text: "class Speaker", kind: OTHER, at: 0.5 },
          { from: "n2", to: "obj_k_pre", text: "class Presenter", kind: CHILD, at: 0.8 },
        ],
        heaps: [
          K("k_wri", "class Writer", "parent", [M("wri_write", "write", PARENT)]),
          K("k_spk", "class Speaker", "other", [M("spk_speak", "speak", OTHER)]),
          K("k_pre", "class Presenter(Writer, Speaker)", "child", []),
        ],
        note: "Presenter lists two parents, so it can use write() from Writer and speak() from Speaker without defining either.",
      },
      {
        label: "Create",
        active: [11],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_presenter", text: "<Presenter #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "Presenter #1", [])],
        globals: [N("m_presenter", "presenter", "<Presenter #1>")],
        note: "A Presenter object. Its methods all come from the classes it inherits from.",
      },
      {
        label: "write()",
        active: [12, 1, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "obj_k_pre", text: "write?", kind: "ref", at: 0.2 },
          { from: "obj_k_pre", to: "wri_write", text: "found", kind: "val", at: 1.0 },
          { from: "q0", to: "cons", text: "Writing content.", kind: "ret", at: 2.0 },
        ],
        out: ["Writing content."],
        note: "Python searches Presenter first, then its parents from left to right. write() is found in Writer.",
      },
      {
        label: "speak()",
        active: [13, 5, 6],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "obj_k_pre", text: "speak?", kind: "ref", at: 0.2 },
          { from: "obj_k_pre", to: "obj_k_wri", text: "not here", kind: "no", at: 1.0 },
          { from: "obj_k_wri", to: "spk_speak", text: "found", kind: "val", at: 1.8 },
          { from: "q1", to: "cons", text: "Speaking to an audience.", kind: "ret", at: 2.8 },
        ],
        out: ["Speaking to an audience."],
        note: "Presenter has no speak(), and neither does Writer, the first parent. Python moves on to Speaker and finds it.",
      },
    ],
  },
  /* 5 Multilevel inheritance ----------------------------------------------- */
  {
    eyebrow: "Multilevel inheritance",
    title: "Each level builds on the one above it",
    dense: true,
    lines: [
      "class ⟦n0:Vehicle⟧:",
      "    def move(self):",
      '        print(⟦q0:"Vehicle is moving."⟧)',
      "",
      "class ⟦n1:Car⟧(Vehicle):",
      "    def drive(self):",
      '        print(⟦q1:"Car is driving."⟧)',
      "",
      "class ⟦n2:ElectricCar⟧(Car):",
      "    pass",
      "",
      "⟦v:electric_car⟧ = ⟦cc:ElectricCar()⟧",
      "⟦c0:electric_car.move()⟧",
      "⟦c1:electric_car.drive()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 6, 8, 9],
        flights: [
          { from: "n0", to: "obj_k_veh", text: "class Vehicle", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_car", text: "class Car", kind: CHILD, at: 0.5 },
          { from: "n2", to: "obj_k_ecar", text: "class ElectricCar", kind: OTHER, at: 0.8 },
        ],
        heaps: [
          K("k_veh", "class Vehicle", "parent", [M("veh_move", "move", PARENT)]),
          K("k_car", "class Car(Vehicle)", "child", [M("car_drive", "drive", CHILD)]),
          K("k_ecar", "class ElectricCar(Car)", "other", []),
        ],
        note: "ElectricCar inherits from Car, and Car inherits from Vehicle. A chain of three, each adding to the one above.",
      },
      {
        label: "Create",
        active: [11],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_electric", text: "<ElectricCar #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "ElectricCar #1", [])],
        globals: [N("m_electric", "electric_car", "<ElectricCar #1>")],
        note: "An ElectricCar object. ElectricCar itself defines nothing, yet the object can use methods from two levels up.",
      },
      {
        label: "move()",
        active: [12, 1, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "obj_k_ecar", text: "move?", kind: "ref", at: 0.2 },
          { from: "obj_k_ecar", to: "obj_k_car", text: "not here", kind: "no", at: 1.0 },
          { from: "obj_k_car", to: "veh_move", text: "found", kind: "val", at: 1.8 },
          { from: "q0", to: "cons", text: "Vehicle is moving.", kind: "ret", at: 2.8 },
        ],
        out: ["Vehicle is moving."],
        note: "move() is not on ElectricCar or on Car. Python climbs the chain until it reaches Vehicle.",
      },
      {
        label: "drive()",
        active: [13, 5, 6],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "obj_k_ecar", text: "drive?", kind: "ref", at: 0.2 },
          { from: "obj_k_ecar", to: "car_drive", text: "found", kind: "val", at: 1.0 },
          { from: "q1", to: "cons", text: "Car is driving.", kind: "ret", at: 2.0 },
        ],
        out: ["Car is driving."],
        note: "drive() is found one level up, on Car, so the search stops there and never reaches Vehicle.",
      },
    ],
  },
  /* 6 Hierarchical inheritance --------------------------------------------- */
  {
    eyebrow: "Hierarchical inheritance",
    title: "Several children can share one parent",
    dense: true,
    lines: [
      "class ⟦n0:Employee⟧:",
      "    def introduce(self):",
      '        print(⟦q0:"I am an employee."⟧)',
      "",
      "class ⟦n1:Developer⟧(Employee):",
      "    pass",
      "",
      "class ⟦n2:Designer⟧(Employee):",
      "    pass",
      "",
      "⟦v0:developer⟧ = ⟦cc0:Developer()⟧",
      "⟦v1:designer⟧ = ⟦cc1:Designer()⟧",
      "⟦c0:developer.introduce()⟧",
      "⟦c1:designer.introduce()⟧",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 4, 5, 7, 8],
        flights: [
          { from: "n0", to: "obj_k_emp", text: "class Employee", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_dev", text: "class Developer", kind: CHILD, at: 0.5 },
          { from: "n2", to: "obj_k_des", text: "class Designer", kind: OTHER, at: 0.8 },
        ],
        heaps: [
          K("k_emp", "class Employee", "parent", [M("emp_introduce", "introduce", PARENT)]),
          K("k_dev", "class Developer(Employee)", "child", []),
          K("k_des", "class Designer(Employee)", "other", []),
        ],
        note: "Developer and Designer both inherit from Employee. The parent's code is written once and shared by every child.",
      },
      {
        label: "Create",
        active: [10, 11],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_developer", text: "<Developer #1>", kind: "ref", at: 1.1 },
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 1.7 },
          { from: "obj_o2", to: "m_designer", text: "<Designer #1>", kind: "ref", at: 2.6 },
        ],
        heaps: [OBJ("o1", "Developer #1", []), OBJ("o2", "Designer #1", [])],
        globals: [N("m_developer", "developer", "<Developer #1>"), N("m_designer", "designer", "<Designer #1>")],
        note: "One object of each child class. Both share the one introduce() that Employee defines, and neither needs any data here.",
      },
      {
        label: "Developer",
        active: [12, 1, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "obj_k_dev", text: "introduce?", kind: "ref", at: 0.2 },
          { from: "obj_k_dev", to: "emp_introduce", text: "found in parent", kind: "val", at: 1.0 },
          { from: "q0", to: "cons", text: "I am an employee.", kind: "ret", at: 2.0 },
        ],
        out: ["I am an employee."],
        note: "Developer has no introduce(), so Python looks in its parent, finds Employee's version, and uses it.",
      },
      {
        label: "Designer",
        active: [13, 1, 2],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "obj_k_des", text: "introduce?", kind: "ref", at: 0.2 },
          { from: "obj_k_des", to: "emp_introduce", text: "found in parent", kind: "val", at: 1.0 },
          { from: "q0", to: "cons", text: "I am an employee.", kind: "ret", at: 2.0 },
        ],
        out: ["I am an employee."],
        note: "Designer reuses the very same method. That is the point of hierarchical inheritance: one foundation, several specializations.",
      },
    ],
  },
  /* 7 Hybrid and the diamond (MRO) ----------------------------------------- */
  {
    eyebrow: "Hybrid and MRO",
    title: "The diamond: Python follows one fixed search order",
    dense: true,
    lines: [
      "class ⟦n0:A⟧:",
      '    def show(self): print(⟦q0:"A"⟧)',
      "",
      "class ⟦n1:B⟧(A):",
      '    def show(self): print(⟦q1:"B"⟧)',
      "",
      "class ⟦n2:C⟧(A):",
      '    def show(self): print(⟦q2:"C"⟧)',
      "",
      "class ⟦n3:D⟧(B, C):",
      "    pass",
      "",
      "⟦v:item⟧ = ⟦cc:D()⟧",
      "⟦c0:item.show()⟧",
      "print(⟦g0:[c.__name__ for c in D.mro()]⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 3, 4, 6, 7, 9, 10],
        flights: [
          { from: "n0", to: "obj_k_a", text: "class A", kind: PARENT, at: 0.2 },
          { from: "n1", to: "obj_k_b", text: "class B", kind: CHILD, at: 0.45 },
          { from: "n2", to: "obj_k_c", text: "class C", kind: OTHER, at: 0.7 },
          { from: "n3", to: "obj_k_d", text: "class D", kind: "cls", at: 0.95 },
        ],
        heaps: [
          K("k_a", "class A", "parent", [M("a_show", "show", PARENT)]),
          K("k_b", "class B(A)", "child", [M("b_show", "show", CHILD)]),
          K("k_c", "class C(A)", "other", [M("c_show", "show", OTHER)]),
          K("k_d", "class D(B, C)", "own", []),
        ],
        note: "D inherits from B and C, and both of them inherit from A. This diamond shape is the classic multiple-inheritance puzzle.",
      },
      {
        label: "Create",
        active: [12],
        flights: [
          { from: "cc", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_item", text: "<D #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "D #1", [])],
        globals: [N("m_item", "item", "<D #1>")],
        note: "A D object. Three classes above it define show(), so Python must decide which one runs.",
      },
      {
        label: "show()",
        active: [13, 4],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "obj_k_d", text: "show?", kind: "ref", at: 0.2 },
          { from: "obj_k_d", to: "b_show", text: "found first", kind: "val", at: 1.0 },
          { from: "c0", to: "c_show", text: "not reached", kind: "no", at: 1.9 },
          { from: "c0", to: "a_show", text: "not reached", kind: "no", at: 2.1 },
          { from: "q1", to: "cons", text: "B", kind: "ret", at: 2.9 },
        ],
        out: ["B"],
        note: "The search order is D, then B, then C, then A. B comes first and has show(), so B's version runs and the rest are never reached.",
      },
      {
        label: "MRO",
        active: [14],
        flights: [
          { from: "obj_k_d", to: "g0", text: "D", kind: "cls", at: 0.2 },
          { from: "obj_k_b", to: "g0", text: "B", kind: CHILD, at: 0.45 },
          { from: "obj_k_c", to: "g0", text: "C", kind: OTHER, at: 0.7 },
          { from: "obj_k_a", to: "g0", text: "A", kind: PARENT, at: 0.95 },
          { from: "g0", to: "cons", text: "['D', 'B', 'C', 'A', 'object']", kind: "ret", at: 2.2 },
        ],
        swap: { g0: { text: "['D', 'B', 'C', 'A', 'object']", kind: "ret" } },
        out: ["['D', 'B', 'C', 'A', 'object']"],
        note: "D.mro() prints that exact search order. super() follows the same order in multiple-inheritance code.",
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

const KEYWORDS = new Set(["def", "class", "return", "if", "raise", "pass", "for", "in"]);
const DECORATORS = new Set(["classmethod", "staticmethod", "property"]);
const BUILTIN_NAMES = new Set(["print", "super"]);

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

// Objects and call frames are neutral. Class cards take the color of their role
// in the family, matching the overview: parent blue, child green, second parent
// violet, and the class that combines them amber.
const HEAP_LOOK: Record<string, { box: string; chip: Kind }> = {
  o1: { box: "border-white/25 bg-white/5", chip: "ret" },
  o2: { box: "border-white/25 bg-white/5", chip: "ret" },
  fr: { box: "border-dashed border-white/25 bg-white/5", chip: "ret" },
};
const ROLE_LOOK: Record<Role, { box: string; chip: Kind }> = {
  parent: { box: "border-dashed border-sky-400/50 bg-sky-400/5", chip: "ref" },
  child: { box: "border-dashed border-mint/50 bg-mint/5", chip: "val" },
  other: { box: "border-dashed border-violet/50 bg-violet/5", chip: "fn" },
  own: { box: "border-dashed border-amber/50 bg-amber/5", chip: "cls" },
};

// One class on one row: its name (with its parents) and the methods it defines.
function ClassCard({ heap, ctx }: { heap: Heap; ctx: Ctx }) {
  const { prev, reg, reduce, timed } = ctx;
  const before = prev?.heaps.find((h) => h.id === heap.id);
  const fresh = !reduce && !before;
  const look = ROLE_LOOK[heap.role ?? "own"];
  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: fresh ? landOf(timed, `obj_${heap.id}`) : 0, duration: 0.3 }}
      className={`min-w-0 overflow-hidden rounded-lg border p-1.5 ${look.box}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span ref={reg(`obj_${heap.id}`)} className={`${chipBase} shrink-0 ${chipClass[look.chip]}`}>
          {heap.title}
        </span>
        {(heap.methods ?? []).map((m) => {
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
    </motion.div>
  );
}

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
  const classes = view.heaps.filter((h) => h.zone === "class");
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
        <ZoneBox label="classes" height={ZONE_CLASS_H}>
          {classes.length === 0 ? (
            <Placeholder>no classes yet</Placeholder>
          ) : (
            <div className={classes.length >= 4 ? "grid grid-cols-2 items-start gap-1" : "flex flex-col gap-1"}>
              {classes.map((h) => (
                <ClassCard key={h.id} heap={h} ctx={ctx} />
              ))}
            </div>
          )}
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
    if (reduce || !running || elapsed.current > 20) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsed.current += (now - last) / 1000;
      last = now;
      setT(elapsed.current);
      if (elapsed.current > 20) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [resetKey, reduce, running]);
  return t;
}

// Roles in a family of classes, shared with the code slides: the root parent is
// blue, a child green, a second parent violet, the class that combines them
// amber. A chip is colored by the class it comes from.
const TONE = {
  parent: {
    box: "border-sky-400/60",
    pill: "border-sky-400/40 bg-sky-400/10 text-sky-300",
    text: "text-sky-300",
    hex: "#38bdf8",
    chip: "ref" as Kind,
  },
  child: {
    box: "border-mint/60",
    pill: "border-mint/40 bg-mint/10 text-mint",
    text: "text-mint",
    hex: "#40e0b4",
    chip: "val" as Kind,
  },
  other: {
    box: "border-violet/60",
    pill: "border-violet/40 bg-violet/10 text-violet",
    text: "text-violet",
    hex: "#a78bfa",
    chip: "fn" as Kind,
  },
  own: {
    box: "border-amber/60",
    pill: "border-amber/40 bg-amber/10 text-amber",
    text: "text-amber",
    hex: "#fbbf24",
    chip: "cls" as Kind,
  },
  bad: {
    box: "border-rose-400/60",
    pill: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    text: "text-rose-300",
    hex: "#fb7185",
    chip: "no" as Kind,
  },
};
type Tone = keyof typeof TONE;
type Pt = [number, number];

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2 py-px font-mono text-[10px] leading-[14px] tracking-wider ${TONE[tone].pill}`}
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

const chipWidth = (text: string) => Math.round(text.length * 6.6 + 14);

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

// A chip that travels from one point to another while the scene clock is inside
// its window. Points are the chip's top-left corner.
function Fly({ t, start, dur, from, to, kind, text }: { t: number; start: number; dur: number; from: Pt; to: Pt; kind: Kind; text: string }) {
  if (t < start || t > start + dur + 0.12) return null;
  const arrived = t >= start + 0.05;
  return (
    <motion.div
      key={`${text}-${start}`}
      initial={{ x: from[0], y: from[1], opacity: 0, scale: 0.9 }}
      animate={{ x: arrived ? to[0] : from[0], y: arrived ? to[1] : from[1], opacity: t > start + dur ? 0 : 1, scale: 1 }}
      transition={{ duration: dur, ease: "easeInOut" }}
      className="absolute left-0 top-0 z-20"
    >
      <span className={`${chipBase} shadow-[0_0_14px_rgba(255,255,255,0.18)] ${chipClass[kind]}`}>{text}</span>
    </motion.div>
  );
}

// The same, along a path of several points (given as the chip's centre).
function FlyPath({ t, start, dur, pts, kind, text }: { t: number; start: number; dur: number; pts: Pt[]; kind: Kind; text: string }) {
  if (t < start || t > start + dur + 0.12) return null;
  const w = chipWidth(text);
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  const times = [0, ...lens.map((l) => (acc += l) / total)];
  return (
    <motion.div
      key={`${text}-${start}`}
      initial={{ x: pts[0][0] - w / 2, y: pts[0][1] - 10, opacity: 0 }}
      animate={{ x: pts.map((p) => p[0] - w / 2), y: pts.map((p) => p[1] - 10), opacity: [0, 1, 1, 0] }}
      transition={{
        x: { duration: dur, ease: "linear", times },
        y: { duration: dur, ease: "linear", times },
        opacity: { duration: dur, times: [0, 0.12, 0.86, 1] },
      }}
      className="absolute left-0 top-0 z-20"
    >
      <span className={`${chipBase} shadow-[0_0_14px_rgba(255,255,255,0.18)] ${chipClass[kind]}`}>{text}</span>
    </motion.div>
  );
}

// An arrow head at the end of a straight or elbow line, drawn in SVG.
function Head({ at, deg, color }: { at: Pt; deg: number; color: string }) {
  return <polygon points="0,0 -11,-6 -11,6" fill={color} transform={`translate(${at[0]} ${at[1]}) rotate(${deg})`} />;
}


/* -------------------------------------------------------------------------- */
/* Step 1: a child gets everything its parent has, then adds its own           */
/* -------------------------------------------------------------------------- */

const ABILITIES = [
  { text: "name", x: 0 },
  { text: "salary", x: 49 },
  { text: "work()", x: 111 },
];
const P_ORIGIN: Pt = [170, 94]; // top-left of the first parent chip
const C_ORIGIN: Pt = [92, 318]; // top-left of the first inherited slot in the child

function IdeaScene({ t }: { t: number }) {
  const fade = (on: boolean, dy = 12) => ({ opacity: on ? 1 : 0, y: on ? 0 : dy });
  const rows: { text: string; from: string; own: boolean }[] = [
    { text: "name", from: "from Employee", own: false },
    { text: "salary", from: "from Employee", own: false },
    { text: "work()", from: "from Employee", own: false },
    { text: "write_code()", from: "its own", own: true },
  ];
  return (
    <Backdrop>
      <motion.div className="absolute inset-0" animate={{ x: t >= 4.6 ? 0 : 130 }} transition={{ duration: 0.6, ease: "easeInOut" }}>
        {/* The parent */}
        <motion.div
          animate={fade(t >= 0.2, -14)}
          className={`absolute rounded-2xl border bg-slate-900 ${TONE.parent.box}`}
          style={{ left: 150, top: 20, width: 340, height: 118 }}
        >
          <div className="absolute flex items-center gap-2.5" style={{ left: 18, top: 14 }}>
            <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
              <Users className="size-[18px] text-sky-300" />
            </span>
            <span className="text-[18px] font-medium text-white">Employee</span>
          </div>
          <span className="absolute" style={{ right: 16, top: 18 }}>
            <Pill tone="parent">parent</Pill>
          </span>
        </motion.div>
        {ABILITIES.map((a) => (
          <motion.div
            key={a.text}
            animate={{ opacity: t >= 0.5 ? 1 : 0 }}
            className="absolute"
            style={{ left: P_ORIGIN[0] + a.x, top: P_ORIGIN[1] }}
          >
            <Chip kind="ref">{a.text}</Chip>
          </motion.div>
        ))}

        {/* The link: abilities are passed down it */}
        <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
          <motion.line
            x1={320}
            y1={142}
            x2={320}
            y2={222}
            stroke="rgba(148,163,184,0.55)"
            strokeWidth={3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: t >= 1.0 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          {t >= 1.4 && <Head at={[320, 230]} deg={90} color="rgba(148,163,184,0.85)" />}
        </svg>
        <motion.span
          animate={{ opacity: t >= 1.4 ? 1 : 0 }}
          className="absolute rounded-full border border-white/20 bg-slate-900 px-2.5 py-0.5 text-[11px] text-slate-300"
          style={{ left: 336, top: 172 }}
        >
          passes down
        </motion.span>

        {/* The child */}
        <motion.div
          animate={fade(t >= 1.2, 14)}
          className={`absolute rounded-2xl border bg-slate-900 ${TONE.child.box}`}
          style={{ left: 60, top: 236, width: 440, height: 190 }}
        >
          <div className="absolute flex items-center gap-2.5" style={{ left: 18, top: 12 }}>
            <span className="flex size-8 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
              <Laptop className="size-[18px] text-mint" />
            </span>
            <span className="text-[18px] font-medium text-white">Developer</span>
            <span className="text-[12px] text-slate-400">a kind of Employee</span>
          </div>
          <span className="absolute" style={{ right: 16, top: 16 }}>
            <Pill tone="child">child</Pill>
          </span>
          <div className="absolute rounded-xl border border-dashed border-white/20" style={{ left: 16, top: 52, width: 408, height: 62 }}>
            <span className="absolute text-[11px] tracking-wide text-slate-500" style={{ left: 12, top: 6 }}>
              inherited from Employee
            </span>
          </div>
          <div className="absolute rounded-xl border border-dashed border-mint/40" style={{ left: 16, top: 122, width: 408, height: 62 }}>
            <span className="absolute text-[11px] tracking-wide text-mint" style={{ left: 12, top: 6 }}>
              added by Developer
            </span>
          </div>
        </motion.div>

        {/* Abilities travelling from the parent into the child */}
        {ABILITIES.map((a, i) => (
          <Fly
            key={a.text}
            t={t}
            start={2.0 + i * 0.35}
            dur={0.8}
            from={[P_ORIGIN[0] + a.x, P_ORIGIN[1]]}
            to={[C_ORIGIN[0] + a.x, C_ORIGIN[1]]}
            kind="ref"
            text={a.text}
          />
        ))}
        {ABILITIES.map((a, i) =>
          t >= 2.0 + i * 0.35 + 0.8 ? (
            <div key={a.text} className="absolute" style={{ left: C_ORIGIN[0] + a.x, top: C_ORIGIN[1] }}>
              <Chip kind="ref">{a.text}</Chip>
            </div>
          ) : null,
        )}
        {t >= 4.0 && (
          <div className="absolute" style={{ left: 92, top: 388 }}>
            <Chip kind="val">write_code()</Chip>
          </div>
        )}

      </motion.div>

      {/* What a Developer object can do, with where each ability came from */}
      <motion.div
        animate={fade(t >= 4.8, 0)}
        className="absolute rounded-2xl border border-white/20 bg-slate-900"
        style={{ left: 528, top: 24, width: 248, height: 402 }}
      >
        <p className="absolute text-[15px] font-medium text-white" style={{ left: 18, top: 16 }}>
          A Developer can do
        </p>
        {rows.map((r, i) => (
          <motion.div
            key={r.text}
            animate={fade(t >= 5.2 + i * 0.4, 8)}
            className="absolute flex items-center gap-3"
            style={{ left: 18, top: 62 + i * 62, width: 212, height: 50 }}
          >
            <CheckCircle2 className={`size-5 shrink-0 ${r.own ? "text-mint" : "text-sky-300"}`} />
            <div className="flex flex-col gap-1">
              <span>
                <Chip kind={r.own ? "val" : "ref"}>{r.text}</Chip>
              </span>
              <span className={`text-[11px] ${r.own ? "text-mint" : "text-sky-300"}`}>{r.from}</span>
            </div>
          </motion.div>
        ))}
        <motion.p
          animate={{ opacity: t >= 7.0 ? 1 : 0 }}
          className="absolute text-[13px] leading-5 text-slate-300"
          style={{ left: 18, right: 18, top: 322 }}
        >
          Everything its parent has, plus whatever it adds.
        </motion.p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2: the five shapes, one large picture at a time                        */
/* -------------------------------------------------------------------------- */

type PChip = { text: string; tone: Tone; at: number };
type PNode = { cx: number; cy: number; name: string; icon: typeof Users; tone: Tone; at: number; chips: PChip[] };
type PEdge = { pts: Pt[]; carry: string; tone: Tone; t0: number };
type Pattern = { name: string; sub: string; tone: Tone; dur: number; nodes: PNode[]; edges: PEdge[] };

const NODE_W = 216;
const NODE_H = 100;

const PATTERNS: Pattern[] = [
  {
    name: "Single",
    sub: "One parent, one child",
    tone: "parent",
    dur: 3.0,
    nodes: [
      { cx: 276, cy: 62, name: "Employee", icon: Users, tone: "parent", at: 0, chips: [{ text: "introduce()", tone: "parent", at: 0.3 }] },
      {
        cx: 276,
        cy: 300,
        name: "Developer",
        icon: Laptop,
        tone: "child",
        at: 0.3,
        chips: [
          { text: "introduce()", tone: "parent", at: 1.5 },
          { text: "write_code()", tone: "child", at: 0.7 },
        ],
      },
    ],
    edges: [{ pts: [[276, 112], [276, 250]], carry: "introduce()", tone: "parent", t0: 0.5 }],
  },
  {
    name: "Multiple",
    sub: "One child, two parents",
    tone: "other",
    dur: 3.0,
    nodes: [
      { cx: 120, cy: 62, name: "Writer", icon: FileText, tone: "parent", at: 0, chips: [{ text: "write()", tone: "parent", at: 0.3 }] },
      { cx: 432, cy: 62, name: "Speaker", icon: Mic, tone: "other", at: 0.1, chips: [{ text: "speak()", tone: "other", at: 0.4 }] },
      {
        cx: 276,
        cy: 300,
        name: "Presenter",
        icon: Presentation,
        tone: "child",
        at: 0.4,
        chips: [
          { text: "write()", tone: "parent", at: 1.6 },
          { text: "speak()", tone: "other", at: 1.7 },
        ],
      },
    ],
    edges: [
      { pts: [[120, 112], [120, 181], [276, 181], [276, 250]], carry: "write()", tone: "parent", t0: 0.6 },
      { pts: [[432, 112], [432, 181], [276, 181], [276, 250]], carry: "speak()", tone: "other", t0: 0.7 },
    ],
  },
  {
    name: "Multilevel",
    sub: "A chain of classes",
    tone: "child",
    dur: 3.8,
    nodes: [
      { cx: 276, cy: 58, name: "Vehicle", icon: Briefcase, tone: "parent", at: 0, chips: [{ text: "move()", tone: "parent", at: 0.3 }] },
      {
        cx: 276,
        cy: 209,
        name: "Car",
        icon: Car,
        tone: "child",
        at: 0.3,
        chips: [
          { text: "move()", tone: "parent", at: 1.4 },
          { text: "drive()", tone: "child", at: 0.6 },
        ],
      },
      {
        cx: 276,
        cy: 360,
        name: "ElectricCar",
        icon: BatteryCharging,
        tone: "other",
        at: 0.6,
        chips: [
          { text: "move()", tone: "parent", at: 2.6 },
          { text: "drive()", tone: "child", at: 2.7 },
          { text: "charge()", tone: "other", at: 0.9 },
        ],
      },
    ],
    edges: [
      { pts: [[276, 108], [276, 159]], carry: "move()", tone: "parent", t0: 0.5 },
      { pts: [[276, 259], [276, 310]], carry: "drive()", tone: "child", t0: 1.7 },
    ],
  },
  {
    name: "Hierarchical",
    sub: "Many children, one parent",
    tone: "own",
    dur: 3.0,
    nodes: [
      { cx: 276, cy: 62, name: "Employee", icon: Users, tone: "parent", at: 0, chips: [{ text: "introduce()", tone: "parent", at: 0.3 }] },
      {
        cx: 120,
        cy: 300,
        name: "Developer",
        icon: Laptop,
        tone: "child",
        at: 0.3,
        chips: [
          { text: "introduce()", tone: "parent", at: 1.5 },
          { text: "write_code()", tone: "child", at: 0.7 },
        ],
      },
      {
        cx: 432,
        cy: 300,
        name: "Designer",
        icon: PenTool,
        tone: "other",
        at: 0.4,
        chips: [
          { text: "introduce()", tone: "parent", at: 1.6 },
          { text: "design()", tone: "other", at: 0.8 },
        ],
      },
    ],
    edges: [
      { pts: [[276, 112], [276, 181], [120, 181], [120, 250]], carry: "introduce()", tone: "parent", t0: 0.5 },
      { pts: [[276, 112], [276, 181], [432, 181], [432, 250]], carry: "introduce()", tone: "parent", t0: 0.6 },
    ],
  },
  {
    name: "Hybrid",
    sub: "A mix of the shapes",
    tone: "bad",
    dur: 4.2,
    nodes: [
      { cx: 276, cy: 58, name: "Employee", icon: Users, tone: "parent", at: 0, chips: [{ text: "introduce()", tone: "parent", at: 0.3 }] },
      {
        cx: 120,
        cy: 209,
        name: "Developer",
        icon: Laptop,
        tone: "child",
        at: 0.3,
        chips: [
          { text: "introduce()", tone: "parent", at: 1.4 },
          { text: "write_code()", tone: "child", at: 0.6 },
        ],
      },
      {
        cx: 432,
        cy: 209,
        name: "Designer",
        icon: PenTool,
        tone: "other",
        at: 0.4,
        chips: [
          { text: "introduce()", tone: "parent", at: 1.5 },
          { text: "design()", tone: "other", at: 0.7 },
        ],
      },
      {
        cx: 276,
        cy: 360,
        name: "TeamLead",
        icon: Sparkles,
        tone: "own",
        at: 0.7,
        chips: [
          { text: "introduce()", tone: "parent", at: 2.8 },
          { text: "write_code()", tone: "child", at: 2.8 },
          { text: "design()", tone: "other", at: 2.9 },
          { text: "manage()", tone: "own", at: 1.0 },
        ],
      },
    ],
    edges: [
      { pts: [[276, 108], [276, 140], [120, 140], [120, 159]], carry: "introduce()", tone: "parent", t0: 0.5 },
      { pts: [[276, 108], [276, 140], [432, 140], [432, 159]], carry: "introduce()", tone: "parent", t0: 0.6 },
      { pts: [[120, 259], [120, 285], [276, 285], [276, 310]], carry: "write_code()", tone: "child", t0: 1.9 },
      { pts: [[432, 259], [432, 285], [276, 285], [276, 310]], carry: "design()", tone: "other", t0: 2.0 },
    ],
  },
];

// Two-level shapes are shifted down so they sit in the middle of the stage.
const PAT_DY: Record<string, number> = { Single: 26, Multiple: 26, Hierarchical: 26 };
const PAT_GAP = 0.4;
const PAT_STARTS = PATTERNS.reduce<number[]>((acc, _p, i) => [...acc, i === 0 ? PAT_GAP : acc[i - 1] + PATTERNS[i - 1].dur], []);
const PAT_TOTAL = PAT_STARTS[PAT_STARTS.length - 1] + PATTERNS[PATTERNS.length - 1].dur;

function PatternNode({ n, local }: { n: PNode; local: number }) {
  const Icon = n.icon;
  const tone = TONE[n.tone];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: local >= n.at ? 1 : 0, scale: local >= n.at ? 1 : 0.92 }}
      transition={{ duration: 0.3 }}
      className={`absolute rounded-2xl border bg-slate-950 ${tone.box}`}
      style={{ left: n.cx - NODE_W / 2, top: n.cy - NODE_H / 2, width: NODE_W, height: NODE_H }}
    >
      <div className="absolute flex items-center gap-2.5" style={{ left: 12, top: 10 }}>
        <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
          <Icon className="size-[18px]" />
        </span>
        <span className="font-mono text-[15px] font-semibold text-white">{n.name}</span>
      </div>
      <div className="absolute flex flex-wrap gap-1.5" style={{ left: 12, top: 50, width: NODE_W - 24 }}>
        {n.chips.map((c) =>
          local >= c.at ? (
            <Chip key={`${c.text}-${c.tone}`} kind={TONE[c.tone].chip}>
              {c.text}
            </Chip>
          ) : null,
        )}
      </div>
    </motion.div>
  );
}

function PatternsScene({ t }: { t: number }) {
  let active = 0;
  PAT_STARTS.forEach((s, i) => {
    if (t >= s) active = i;
  });
  const done = t >= PAT_TOTAL;
  const local = t - PAT_STARTS[active];
  const p = PATTERNS[active];

  return (
    <Backdrop>
      {/* The five shapes, as a list that follows along */}
      {PATTERNS.map((pt, i) => {
        const on = t >= PAT_STARTS[i];
        const here = i === active && !done;
        return (
          <motion.div
            key={pt.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={`absolute flex items-center gap-3 rounded-xl border px-3 transition-colors duration-300 ${here ? `${TONE[pt.tone].box} bg-slate-900` : "border-white/10 bg-slate-950"
              }`}
            style={{ left: 16, top: 16 + i * 78, width: 200, height: 70, opacity: on ? 1 : 0.5 }}
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] ${on && !here ? "border-white/20 bg-white/5 text-slate-300" : TONE[pt.tone].pill
                }`}
            >
              {on && !here ? <CheckCircle2 className="size-4" /> : i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-medium leading-5 text-white">{pt.name}</p>
              <p className="text-[11px] leading-4 text-slate-400">{pt.sub}</p>
            </div>
          </motion.div>
        );
      })}

      <p className="absolute text-[11px] leading-4 text-slate-500" style={{ left: 18, top: 410, width: 196 }}>
        Chip colors show which class a method comes from.
      </p>

      {/* The stage */}
      <div className="absolute rounded-2xl border border-white/15 bg-slate-900" style={{ left: 232, top: 16, width: 552, height: 418 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0" style={{ transform: `translateY(${PAT_DY[p.name] ?? 0}px)` }}>
              <svg className="pointer-events-none absolute left-0 top-0" width={552} height={418} viewBox="0 0 552 418">
                {p.edges.map((e, k) => {
                  const d = e.pts.map((q, i) => `${i === 0 ? "M" : "L"} ${q[0]} ${q[1]}`).join(" ");
                  const last = e.pts[e.pts.length - 1];
                  const lit = local >= e.t0;
                  return (
                    <g key={k}>
                      <path d={d} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth={3} strokeLinejoin="round" />
                      <motion.path
                        d={d}
                        fill="none"
                        stroke={TONE[e.tone].hex}
                        strokeWidth={3}
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: lit ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                      {lit && <Head at={[last[0], last[1] + 1]} deg={90} color={TONE[e.tone].hex} />}
                    </g>
                  );
                })}
              </svg>
              {p.nodes.map((n) => (
                <PatternNode key={n.name} n={n} local={local} />
              ))}
              {p.edges.map((e, k) => (
                <FlyPath key={k} t={local} start={e.t0 + 0.2} dur={0.9} pts={e.pts} kind={TONE[e.tone].chip} text={e.carry} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3: how Python finds a method: climb the family, then the diamond       */
/* -------------------------------------------------------------------------- */

function ChainPart({ t }: { t: number }) {
  const atEmp = t >= 2.4;
  const notHere = t >= 1.5;
  const found = t >= 3.2;
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
      <span className="absolute" style={{ left: 24, top: 18 }}>
        <Pill tone="parent">1 · a simple chain</Pill>
      </span>

      <motion.div
        animate={fade(t >= 0.2)}
        className="absolute rounded-2xl border border-white/20 bg-slate-900"
        style={{ left: 40, top: 150, width: 232, height: 160 }}
      >
        <span className="absolute flex size-9 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10" style={{ left: 18, top: 18 }}>
          <Search className="size-5 text-sky-300" />
        </span>
        <p className="absolute text-[15px] font-medium text-white" style={{ left: 18, top: 66 }}>
          Calling introduce()
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 18, top: 88 }}>
          on a Developer object
        </p>
        {found && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute flex items-center gap-1.5 text-[13px] ${TONE.child.text}`} style={{ left: 18, top: 122 }}>
            <CheckCircle2 className="size-4" /> Found in Employee
          </motion.p>
        )}
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <motion.path
          d="M 272 300 L 316 300 L 316 318 L 358 318"
          fill="none"
          stroke="rgba(148,163,184,0.6)"
          strokeWidth={3}
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: t >= 0.8 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        {t >= 1.2 && <Head at={[364, 318]} deg={0} color="rgba(148,163,184,0.85)" />}
      </svg>

      {/* The family, parents on top */}
      {[
        { top: 36, h: 70, name: "object", chip: null as string | null, tone: "bad" as Tone, lit: false, dim: true, at: 0.5 },
        { top: 140, h: 96, name: "Employee", chip: "introduce()", tone: "parent" as Tone, lit: found, dim: false, at: 0.4 },
        { top: 270, h: 96, name: "Developer", chip: "write_code()", tone: "child" as Tone, lit: false, dim: false, at: 0.3 },
      ].map((b) => (
        <motion.div
          key={b.name}
          animate={{ ...fade(t >= b.at), opacity: t >= b.at ? (b.dim ? (found ? 0.35 : 0.6) : 1) : 0 }}
          className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${b.lit ? TONE.parent.box : "border-white/20"}`}
          style={{ left: 360, top: b.top, width: 340, height: b.h }}
        >
          <p className="absolute text-[17px] font-medium text-white" style={{ left: 18, top: 14 }}>
            {b.name}
          </p>
          {b.chip && (
            <span className="absolute" style={{ left: 18, top: 50 }}>
              <Chip kind={TONE[b.tone].chip}>{b.chip}</Chip>
            </span>
          )}
          {b.name === "Developer" && notHere && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ${TONE.bad.pill}`} style={{ right: 14, top: 14 }}>
              <XCircle className="size-3.5" /> not here
            </motion.span>
          )}
          {b.name === "Employee" && found && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ${TONE.child.pill}`} style={{ right: 14, top: 14 }}>
              <CheckCircle2 className="size-3.5" /> found
            </motion.span>
          )}
        </motion.div>
      ))}

      <ArrowUp className="absolute size-5 text-slate-400" style={{ left: 520, top: 241 }} />
      <ArrowUp className="absolute size-5 text-slate-400" style={{ left: 520, top: 111 }} />
      <span className="absolute text-[11px] text-slate-500" style={{ left: 548, top: 243 }}>
        not found? go up
      </span>

      {/* The search ring climbs from the child to the parent */}
      <motion.div
        initial={{ opacity: 0, y: 270 }}
        animate={{ opacity: t >= 0.9 ? 1 : 0, y: atEmp ? 140 : 270 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="pointer-events-none absolute left-0 top-0 z-10 rounded-2xl border-2 border-white/70 shadow-[0_0_22px_rgba(255,255,255,0.25)]"
        style={{ left: 354, width: 352, height: 108, marginTop: -6 }}
      />
    </motion.div>
  );
}

const DIAMOND: { label: string; cx: number; cy: number; tone: Tone; chip: string | null }[] = [
  { label: "D", cx: 330, cy: 340, tone: "own", chip: null },
  { label: "B", cx: 200, cy: 250, tone: "child", chip: "show()" },
  { label: "C", cx: 460, cy: 250, tone: "other", chip: "show()" },
  { label: "A", cx: 330, cy: 160, tone: "parent", chip: "show()" },
  { label: "object", cx: 330, cy: 70, tone: "bad", chip: null },
];
// child -> parent links, drawn from the child's top edge to the parent's bottom edge
const DIAMOND_LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
];

function DiamondPart({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const atB = t >= 1.8;
  const showOrder = t >= 4.0;
  const orderAt = (i: number) => 4.0 + i * 0.5;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
      <span className="absolute" style={{ left: 24, top: 18 }}>
        <Pill tone="child">2 · the diamond</Pill>
      </span>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        {DIAMOND_LINKS.map(([a, b]) => {
          const A = DIAMOND[a];
          const B = DIAMOND[b];
          const dx = B.cx - A.cx;
          const dy = B.cy - A.cy;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const s: Pt = [A.cx + ux * 34, A.cy + uy * 28];
          const e: Pt = [B.cx - ux * 40, B.cy - uy * 30];
          const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <g key={`${a}-${b}`}>
              <line x1={s[0]} y1={s[1]} x2={e[0]} y2={e[1]} stroke="rgba(148,163,184,0.5)" strokeWidth={2.5} />
              <Head at={e} deg={deg} color="rgba(148,163,184,0.8)" />
            </g>
          );
        })}
      </svg>

      {DIAMOND.map((n, i) => {
        const tone = TONE[n.tone];
        const lit = (i === 0 && t >= 1.0 && !atB) || (i === 1 && atB);
        const notReached = atB && (i === 2 || i === 3) && t >= 2.8;
        return (
          <motion.div
            key={n.label}
            animate={{ ...fade(t >= 0.2 + (4 - i) * 0.12), opacity: t >= 0.2 + (4 - i) * 0.12 ? (notReached ? 0.4 : 1) : 0 }}
            className={`absolute flex items-center rounded-2xl border bg-slate-900 px-3.5 transition-colors duration-300 ${lit ? tone.box : "border-white/20"} ${n.chip ? "justify-between" : "justify-center"}`}
            style={{ left: n.cx - 64, top: n.cy - 28, width: 128, height: 56 }}
          >
            <span className="font-mono text-[15px] font-semibold text-white">{n.label}</span>
            {n.chip && <Chip kind={tone.chip}>{n.chip}</Chip>}
            {lit && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-px text-[10px] ${i === 0 ? TONE.bad.pill : TONE.child.pill}`}
                style={i === 0 ? { left: 136, top: 16 } : { right: 136, top: 16 }}
              >
                {i === 0 ? "no show() here" : "found!"}
              </motion.span>
            )}
            {showOrder && t >= orderAt(i) && (
              <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute flex size-6 items-center justify-center rounded-full border border-amber/60 bg-slate-950 font-mono text-[12px] text-amber"
                style={{ left: -12, top: -12 }}
              >
                {i + 1}
              </motion.span>
            )}
          </motion.div>
        );
      })}

      {/* The result of the lookup */}
      <motion.div
        animate={fade(t >= 2.8)}
        className={`absolute rounded-2xl border bg-slate-900 p-4 ${TONE.child.box}`}
        style={{ left: 560, top: 96, width: 216, height: 124 }}
      >
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-white">
          <CheckCircle2 className="size-4 text-mint" /> B's show() runs
        </p>
        <p className="mt-1.5 text-[12px] leading-[18px] text-slate-400">The search stops at the first match, so C and A are never reached.</p>
      </motion.div>

      {/* The full order, revealed number by number */}
      <motion.div
        animate={fade(showOrder)}
        className="absolute rounded-2xl border border-amber/40 bg-slate-900 p-4"
        style={{ left: 560, top: 240, width: 216, height: 124 }}
      >
        <p className="text-[13px] font-medium text-white">The full order</p>
        <p className="mt-1.5 font-mono text-[12px] leading-5 text-amber">D → B → C → A → object</p>
        <p className="mt-1.5 text-[11px] leading-4 text-slate-400">called the MRO</p>
      </motion.div>
    </motion.div>
  );
}

function LookupScene({ t }: { t: number }) {
  return (
    <Backdrop>
      <AnimatePresence mode="wait">
        {t < 5.4 ? <ChainPart key="chain" t={t} /> : <DiamondPart key="diamond" t={t - 5.4} />}
      </AnimatePresence>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4: three ways a child can use a parent's method, one row each          */
/* -------------------------------------------------------------------------- */

const REUSE: {
  tone: Tone;
  pill: string;
  title: string;
  sub: string;
  child: { chip: boolean; note: string; noteTone: string };
  lines: string[];
}[] = [
    {
      tone: "parent",
      pill: "inherit",
      title: "Use it as is",
      sub: "The child defines nothing",
      child: { chip: false, note: "no work() here", noteTone: "text-slate-500" },
      lines: ["Employee is working."],
    },
    {
      tone: "child",
      pill: "override",
      title: "Replace it",
      sub: "The child defines the same name",
      child: { chip: true, note: "its own version", noteTone: "text-mint" },
      lines: ["Developer is writing code."],
    },
    {
      tone: "other",
      pill: "extend",
      title: "Add to it",
      sub: "The child calls super() first",
      child: { chip: true, note: "calls super()", noteTone: "text-violet" },
      lines: ["Employee is working.", "Developer adds more."],
    },
  ];
const ROW_H = 128;
const ROW_GAP = 14;
const ROW_SPAN = 3.9;

function ReuseScene({ t }: { t: number }) {
  return (
    <Backdrop>
      {REUSE.map((r, i) => {
        const t0 = 0.5 + i * ROW_SPAN;
        const y = 12 + i * (ROW_H + ROW_GAP);
        const local = t - t0;
        const started = local >= 0;
        const childLit = i === 0 ? local >= 0.3 && local < 1.5 : local >= 0.3;
        const parentLit = i === 0 ? local >= 1.7 : i === 2 ? local >= 1.9 : false;
        const skipped = i === 1 && local >= 1.0;
        const shown = r.lines.filter((_, k) => local >= (i === 0 ? 2.4 : i === 1 ? 1.5 : 2.5 + k * 0.8));
        const goDot = i === 0 ? local >= 1.1 && local < 1.8 : i === 2 ? local >= 1.2 && local < 1.9 : false;
        const backDot = i === 2 && local >= 2.7 && local < 3.4;
        return (
          <motion.div
            key={r.pill}
            animate={{ opacity: started ? 1 : 0.45 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0"
            style={{ top: y, height: ROW_H }}
          >
            <div className="absolute" style={{ left: 20, top: 14, width: 140 }}>
              <Pill tone={r.tone}>{r.pill}</Pill>
              <p className="mt-1.5 text-[16px] font-medium leading-5 text-white">{r.title}</p>
              <p className="mt-0.5 text-[12px] leading-4 text-slate-400">{r.sub}</p>
            </div>

            <div className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${childLit ? TONE.child.box : "border-white/20"}`} style={{ left: 172, top: 6, width: 158, height: 112 }}>
              <p className="absolute text-[11px] text-slate-500" style={{ left: 14, top: 10 }}>
                child
              </p>
              <p className="absolute text-[16px] font-medium text-white" style={{ left: 14, top: 28 }}>
                Developer
              </p>
              {r.child.chip && (
                <div className="absolute" style={{ left: 14, top: 62 }}>
                  <Chip kind="val">work()</Chip>
                </div>
              )}
              <span className={`absolute text-[12px] ${r.child.noteTone}`} style={{ left: 14, top: r.child.chip ? 88 : 66 }}>
                {started ? r.child.note : ""}
              </span>
              {i === 0 && local >= 0.9 && local < 1.7 && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.bad.pill}`} style={{ right: 10, top: 10 }}>
                  not here
                </motion.span>
              )}
            </div>

            {/* the lookup goes from the child up to the parent */}
            <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={ROW_H} viewBox={`0 0 ${DESIGN_W} ${ROW_H}`}>
              <line x1={334} y1={62} x2={368} y2={62} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
              <Head at={[376, 62]} deg={0} color="rgba(148,163,184,0.85)" />
            </svg>
            <span className="absolute text-[10px] text-slate-500" style={{ left: 334, top: 70 }}>
              looks in
            </span>
            {goDot && (
              <motion.span key="go" initial={{ x: 334, opacity: 0 }} animate={{ x: 368, opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} className="absolute size-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ top: 57 }} />
            )}
            {backDot && (
              <motion.span key="back" initial={{ x: 368, opacity: 0 }} animate={{ x: 334, opacity: [0, 1, 1, 0] }} transition={{ duration: 0.7, ease: "linear" }} className="absolute size-2.5 rounded-full bg-violet shadow-[0_0_10px_rgba(167,139,250,0.9)]" style={{ top: 57 }} />
            )}
            {i === 2 && local >= 1.2 && local < 2.2 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.other.pill}`} style={{ left: 334, top: 34 }}>
                super()
              </motion.span>
            )}

            <div className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${parentLit ? TONE.parent.box : "border-white/20"}`} style={{ left: 380, top: 6, width: 158, height: 112 }}>
              <p className="absolute text-[11px] text-slate-500" style={{ left: 14, top: 10 }}>
                parent
              </p>
              <p className="absolute text-[16px] font-medium text-white" style={{ left: 14, top: 28 }}>
                Employee
              </p>
              <div className="absolute" style={{ left: 14, top: 64 }}>
                <Chip kind="ref">work()</Chip>
              </div>
              {skipped && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.bad.pill}`} style={{ right: 10, top: 10 }}>
                  skipped
                </motion.span>
              )}
              {parentLit && i !== 1 && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.parent.pill}`} style={{ right: 10, top: 10 }}>
                  runs
                </motion.span>
              )}
            </div>

            <div className="absolute rounded-2xl border border-white/20 bg-slate-950" style={{ left: 552, top: 6, width: 232, height: 112 }}>
              <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 14, top: 10 }}>
                output
              </p>
              <div className="absolute flex flex-col gap-1.5" style={{ left: 14, top: 34, right: 10 }}>
                {shown.map((l) => (
                  <motion.p key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-[11.5px] leading-4 text-slate-100">
                    {l}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 5: can the child stand in for its parent? If not, hold it instead      */
/* -------------------------------------------------------------------------- */

function StandInCard({
  x,
  title,
  slotLabel,
  slotIcon: SlotIcon,
  tokenName,
  tokenIcon: TokenIcon,
  tokenTone,
  fits,
  t0,
  t,
  children,
}: {
  x: number;
  title: string;
  slotLabel: string;
  slotIcon: typeof Users;
  tokenName: string;
  tokenIcon: typeof Users;
  tokenTone: Tone;
  fits: boolean;
  t0: number;
  t: number;
  children: ReactNode;
}) {
  const local = t - t0;
  const inSlot = local >= 1.0 && (fits || local < 2.4);
  const verdict = local >= 1.9;
  const slotTone = !inSlot ? "border-white/25" : fits ? TONE.child.box : local >= 1.9 ? TONE.bad.box : "border-white/25";
  return (
    <motion.div
      animate={{ opacity: local >= -0.3 ? 1 : 0, y: local >= -0.3 ? 0 : 14 }}
      className={`absolute rounded-2xl border bg-slate-900 ${fits ? TONE.child.box : TONE.own.box}`}
      style={{ left: x, top: 20, width: 360, height: 360 }}
    >
      <p className="absolute text-[18px] font-medium text-white" style={{ left: 22, top: 18 }}>
        {title}
      </p>
      <p className="absolute text-[13px] leading-5 text-slate-400" style={{ left: 22, top: 50, right: 22 }}>
        Can a {tokenName} stand in where {slotLabel.toLowerCase()} is needed?
      </p>
      <div
        className={`absolute flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-300 ${slotTone}`}
        style={{ left: 40, top: 112, width: 280, height: 76 }}
      >
        {!inSlot && (
          <span className="flex items-center gap-2 text-[14px] text-slate-400">
            <SlotIcon className="size-5" /> needs {slotLabel.toLowerCase()}
          </span>
        )}
      </div>

      <motion.div
        animate={{ x: 70, y: inSlot ? 124 : 250, opacity: local >= 0.3 ? 1 : 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className={`absolute left-0 top-0 flex items-center gap-2.5 rounded-xl border bg-slate-950 px-3 shadow-lg ${TONE[tokenTone].box}`}
        style={{ width: 220, height: 52 }}
      >
        <span className={`flex size-8 items-center justify-center rounded-lg border ${TONE[tokenTone].pill}`}>
          <TokenIcon className="size-[18px]" />
        </span>
        <span className="font-mono text-[14px] font-semibold text-white">{tokenName}</span>
      </motion.div>

      {verdict && (
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute flex items-center gap-2 text-[15px] font-medium ${fits ? TONE.child.text : TONE.bad.text}`}
          style={{ left: 40, top: 204 }}
        >
          {fits ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
          {fits ? "It fits: inheritance" : "It does not fit"}
        </motion.p>
      )}
      {children}
    </motion.div>
  );
}

function IsAScene({ t }: { t: number }) {
  return (
    <Backdrop>
      <StandInCard
        x={24}
        title="A Developer is an Employee"
        slotLabel="An Employee"
        slotIcon={Users}
        tokenName="Developer"
        tokenIcon={Laptop}
        tokenTone="child"
        fits
        t0={0.4}
        t={t}
      >
        <motion.p
          animate={{ opacity: t >= 2.6 ? 1 : 0 }}
          className="absolute text-[13px] leading-5 text-slate-300"
          style={{ left: 22, right: 22, top: 246 }}
        >
          A developer can do everything an employee does, so it can take an employee's place.
        </motion.p>
      </StandInCard>

      <StandInCard
        x={416}
        title="A Car has an Engine"
        slotLabel="An Engine"
        slotIcon={Settings}
        tokenName="Car"
        tokenIcon={Car}
        tokenTone="own"
        fits={false}
        t0={3.4}
        t={t}
      >
        {t >= 5.4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute rounded-xl border bg-slate-950 ${TONE.own.box}`}
            style={{ left: 40, top: 244, width: 280, height: 94 }}
          >
            <span className="absolute font-mono text-[13px] text-white" style={{ left: 14, top: 10 }}>
              Car
            </span>
            <span className="absolute flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 text-[13px] text-slate-200" style={{ left: 14, right: 14, top: 36, height: 44 }}>
              <Settings className="size-4" /> Engine, held as an attribute
            </span>
          </motion.div>
        )}
      </StandInCard>

      <motion.div
        animate={{ opacity: t >= 6.4 ? 1 : 0, y: t >= 6.4 ? 0 : 10 }}
        className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
        style={{ left: 90, top: 396, width: 620, height: 40 }}
      >
        <Shield className="size-5 shrink-0 text-sky-300" />
        <p className="text-[13px] text-white">Ask: could the child stand in for its parent? If not, hold it as an attribute.</p>
      </motion.div>
    </Backdrop>
  );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
  const t = useClock(step, reduce, running);
  return (
    <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
      <AnimatePresence mode="wait">
        {step === 0 && <IdeaScene key="idea" t={t} />}
        {step === 1 && <PatternsScene key="patterns" t={t} />}
        {step === 2 && <LookupScene key="lookup" t={t} />}
        {step === 3 && <ReuseScene key="reuse" t={t} />}
        {step === 4 && <IsAScene key="isa" t={t} />}
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
  title: "Reusing and extending behavior",
  steps: [
    {
      label: "The idea",
      ms: 9400,
      note: "Inheritance lets a child class reuse everything its parent has and add its own. A Developer gets Employee's name, salary and work(), then adds write_code().",
    },
    {
      label: "Patterns",
      ms: Math.round((PAT_TOTAL + 1.2) * 1000),
      note: "Python supports five shapes: single, multiple, multilevel, hierarchical and hybrid. They differ in how many parents a class has and how deep the chain goes.",
    },
    {
      label: "Lookup",
      ms: 14400,
      note: "When a method is called, Python searches the child first, then climbs through its parents in a fixed order, and stops at the first match.",
    },
    {
      label: "Reuse or replace",
      ms: 13200,
      note: "A child can use an inherited method as is, override it with its own version, or extend it by calling super() and adding more.",
    },
    {
      label: "Is-a test",
      ms: 9000,
      note: "Use inheritance for an is-a relationship, such as a Developer being an Employee. If one object merely uses another, like a Car and its Engine, prefer composition.",
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

export function InheritanceCustomAnimation() {
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
            <div className="flex shrink-0 flex-col items-center" style={{ height: 76 }}>
              <p className="h-4 font-mono text-[10px] leading-4 tracking-[0.2em] text-violet">{entry.eyebrow}</p>
              <h3 className="h-7 max-w-full shrink-0 truncate text-lg font-light leading-7 text-foreground">{entry.title}</h3>
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
              style={{ height: 44, width: 720, marginTop: 2 }}
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

            <div className="flex shrink-0 justify-center gap-[10px]" style={{ height: BODY_H, marginTop: 8 }}>
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