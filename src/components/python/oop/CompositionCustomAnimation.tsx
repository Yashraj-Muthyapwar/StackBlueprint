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
   Car,
   CheckCircle2,
   ChevronLeft,
   ChevronRight,
   Cpu,
   Laptop,
   Lock,
   Package,
   Pause,
   Play,
   RotateCcw,
   Settings,
   ShoppingCart,
   User,
   Users,
   Zap,
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
// A class or type card takes one of four colors so the cards are easy to tell apart.
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
   zones?: [number, number]; // heights of the names and classes zones; the objects zone gets the rest
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
   zones: [number, number, number];
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
const OBJ = (id: "o1" | "o2" | "o3", title: string, attrs: Row[]): Heap => ({ id, title, zone: "object", attrs });

// Class cards use four colors. Objects that live inside another object are shown
// as references: the attribute holds a chip such as <Engine #1>.
const BLUE = "ref" as Kind;
const GREEN = "val" as Kind;
const VIOLET = "fn" as Kind;

const slides: Slide[] = [
   /* 1 A component inside an object ------------------------------------------- */
   {
      eyebrow: "Has-a relationship",
      title: "A Car holds an Engine object inside it",
      lines: [
         "class ⟦n0:Engine⟧:",
         "    def start(self):",
         '        print(⟦q0:"Engine started."⟧)',
         "",
         "class ⟦n1:Car⟧:",
         "    def __init__(self, ⟦p0:brand⟧):",
         "        self.brand = ⟦u0:brand⟧",
         "        self.engine = ⟦cc1:Engine()⟧",
         "",
         '⟦v:car⟧ = ⟦cc0:Car(⟧⟦a0:"Toyota"⟧)',
         "⟦c0:car.engine.start⟧()",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 4, 5, 6, 7],
            flights: [
               { from: "n0", to: "obj_k_eng", text: "class Engine", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_car", text: "class Car", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_eng", "class Engine", "parent", [M("en_start", "start", BLUE)]),
               K("k_car", "class Car", "child", [M("car___init__", "__init__", GREEN)]),
            ],
            note: "Engine is a small class with one job. Car will use an Engine, not inherit from it.",
         },
         {
            label: "Car",
            active: [9, 5],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "p0", text: '"Toyota"', kind: GREEN, at: 0.6 },
               { from: "obj_o1", to: "m_car", text: "<Car #1>", kind: "ref", at: 1.4 },
            ],
            swap: { p0: { text: '"Toyota"', kind: GREEN, cap: "brand" } },
            heaps: [OBJ("o1", "Car #1", [])],
            globals: [N("m_car", "car", "<Car #1>")],
            note: "Python creates the Car object and runs __init__() with the brand.",
         },
         {
            label: "Brand",
            active: [6],
            flights: [
               { from: "p0", to: "u0", text: '"Toyota"', kind: GREEN, at: 0.2 },
               { from: "u0", to: "o1_brand", text: '"Toyota"', kind: GREEN, at: 1.2 },
            ],
            swap: { u0: { text: '"Toyota"', kind: GREEN } },
            heaps: [OBJ("o1", "Car #1", [R("o1_brand", "brand", '"Toyota"')])],
            note: "A plain value is stored as an attribute, as you have seen before.",
         },
         {
            label: "Engine",
            active: [7],
            flights: [
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "obj_o2", to: "o1_engine", text: "<Engine #1>", kind: "ref", at: 1.1 },
            ],
            heaps: [OBJ("o2", "Engine #1", []), OBJ("o1", "Car #1", [R("o1_engine", "engine", "<Engine #1>", "ref")])],
            note: "self.engine = Engine() builds a separate Engine object and stores it inside the Car. That is composition.",
         },
         {
            label: "Reach in",
            active: [10, 1, 2],
            hot: ["c0"],
            flights: [
               { from: "c0", to: "o1_engine", text: "car.engine", kind: "ref", at: 0.2 },
               { from: "o1_engine", to: "obj_o2", text: "Engine #1", kind: "ref", at: 1.0 },
               { from: "obj_o2", to: "en_start", text: "start", kind: BLUE, at: 1.8 },
               { from: "q0", to: "cons", text: "Engine started.", kind: "ret", at: 2.7 },
            ],
            out: ["Engine started."],
            note: "car.engine reaches the Engine object stored inside the Car, and start() runs on it.",
         },
      ],
   },
   /* 2 Delegation ------------------------------------------------------------- */
   {
      eyebrow: "Delegation",
      title: "Car.start() hands the work to its Engine",
      dense: true,
      lines: [
         "class ⟦n0:Engine⟧:",
         "    def start(self):",
         '        print(⟦q0:"Engine started."⟧)',
         "",
         "class ⟦n1:Car⟧:",
         "    def __init__(self, brand):",
         "        self.brand = brand",
         "        self.engine = ⟦cc1:Engine()⟧",
         "",
         "    def start(self):",
         "        ⟦c1:self.engine.start⟧()",
         "",
         '⟦v:car⟧ = ⟦cc0:Car(⟧⟦a0:"Toyota"⟧)',
         "⟦c0:car.start⟧()",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 4, 5, 6, 7, 9, 10],
            flights: [
               { from: "n0", to: "obj_k_eng", text: "class Engine", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_car", text: "class Car", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_eng", "class Engine", "parent", [M("en_start", "start", BLUE)]),
               K("k_car", "class Car", "child", [M("car___init__", "__init__", GREEN), M("car_start", "start", GREEN)]),
            ],
            note: "Car now defines its own start() method, next to the Engine's.",
         },
         {
            label: "Build",
            active: [12, 7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "o1_brand", text: '"Toyota"', kind: GREEN, at: 0.7 },
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 1.2 },
               { from: "obj_o2", to: "o1_engine", text: "<Engine #1>", kind: "ref", at: 2.0 },
               { from: "obj_o1", to: "m_car", text: "<Car #1>", kind: "ref", at: 2.6 },
            ],
            heaps: [
               OBJ("o1", "Car #1", [R("o1_brand", "brand", '"Toyota"'), R("o1_engine", "engine", "<Engine #1>", "ref")]),
               OBJ("o2", "Engine #1", []),
            ],
            globals: [N("m_car", "car", "<Car #1>")],
            note: "The Car is built together with the Engine object it owns.",
         },
         {
            label: "Call",
            active: [13, 9],
            hot: ["c0"],
            flights: [{ from: "c0", to: "car_start", text: "start", kind: GREEN, at: 0.2 }],
            note: "The caller asks the Car to start. It never mentions the engine.",
         },
         {
            label: "Delegate",
            active: [10],
            hot: ["c1"],
            flights: [
               { from: "c1", to: "o1_engine", text: "self.engine", kind: "ref", at: 0.2 },
               { from: "o1_engine", to: "obj_o2", text: "Engine #1", kind: "ref", at: 1.0 },
               { from: "obj_o2", to: "en_start", text: "start", kind: BLUE, at: 1.8 },
            ],
            note: "Car.start() forwards the job to its Engine. This is delegation.",
         },
         {
            label: "Print",
            active: [1, 2],
            flights: [{ from: "q0", to: "cons", text: "Engine started.", kind: "ret", at: 0.2 }],
            out: ["Engine started."],
            note: "The Engine does the specialized work. The Car only decided which operation to offer.",
         },
      ],
   },
   /* 3 Passing a component in -------------------------------------------------- */
   {
      eyebrow: "Passing components in",
      title: "The caller chooses which engine the Car gets",
      lines: [
         "class ⟦n0:Engine⟧:",
         '    def start(self): print(⟦q0:"Gas engine started."⟧)',
         "class ⟦n1:Car⟧:",
         "    def __init__(self, ⟦p0:engine⟧):",
         "        self.engine = ⟦u0:engine⟧",
         "    def start(self): ⟦c1:self.engine.start⟧()",
         "",
         "⟦v0:engine⟧ = ⟦cc0:Engine()⟧",
         "⟦v1:car⟧ = ⟦cc1:Car(⟧⟦a0:engine⟧)",
         "⟦c0:car.start⟧()",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 3, 4, 5],
            flights: [
               { from: "n0", to: "obj_k_eng", text: "class Engine", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_car", text: "class Car", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_eng", "class Engine", "parent", [M("en_start", "start", BLUE)]),
               K("k_car", "class Car", "child", [M("car___init__", "__init__", GREEN), M("car_start", "start", GREEN)]),
            ],
            note: "This Car does not build its own engine. Its __init__() accepts one as an argument.",
         },
         {
            label: "Engine",
            active: [7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "obj_o1", to: "m_engine", text: "<Engine #1>", kind: "ref", at: 1.1 },
            ],
            heaps: [OBJ("o1", "Engine #1", [])],
            globals: [N("m_engine", "engine", "<Engine #1>")],
            note: "The engine is created first, outside the car.",
         },
         {
            label: "Pass in",
            active: [8, 3],
            flights: [
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "p0", text: "<Engine #1>", kind: "ref", at: 0.7 },
               { from: "obj_o2", to: "m_car", text: "<Car #1>", kind: "ref", at: 1.6 },
            ],
            swap: { p0: { text: "<Engine #1>", kind: "ref", cap: "engine" } },
            heaps: [OBJ("o2", "Car #1", [])],
            globals: [N("m_car", "car", "<Car #1>")],
            note: "The existing engine object is handed to the new Car.",
         },
         {
            label: "Store",
            active: [4],
            flights: [
               { from: "p0", to: "u0", text: "<Engine #1>", kind: "ref", at: 0.2 },
               { from: "u0", to: "o2_engine", text: "<Engine #1>", kind: "ref", at: 1.2 },
            ],
            swap: { u0: { text: "<Engine #1>", kind: "ref" } },
            heaps: [OBJ("o2", "Car #1", [R("o2_engine", "engine", "<Engine #1>", "ref")])],
            note: "The Car stores the engine it was given. It is the same object, not a copy.",
         },
         {
            label: "start()",
            active: [9, 5, 1],
            hot: ["c0"],
            flights: [
               { from: "c0", to: "car_start", text: "start", kind: GREEN, at: 0.2 },
               { from: "c1", to: "o2_engine", text: "self.engine", kind: "ref", at: 0.9 },
               { from: "o2_engine", to: "obj_o1", text: "Engine #1", kind: "ref", at: 1.6 },
               { from: "obj_o1", to: "en_start", text: "start", kind: BLUE, at: 2.2 },
               { from: "q0", to: "cons", text: "Gas engine started.", kind: "ret", at: 3.0 },
            ],
            out: ["Gas engine started."],
            note: "start() is delegated to whichever engine the Car received.",
         },
      ],
   },
   /* 4 A different component ---------------------------------------------------- */
   {
      eyebrow: "Replaceable parts",
      title: "A different component, and the Car class stays the same",
      lines: [
         "class ⟦n0:ElectricMotor⟧:",
         '    def start(self): print(⟦q0:"Electric motor started."⟧)',
         "class ⟦n1:Car⟧:",
         "    def __init__(self, ⟦p0:engine⟧):",
         "        self.engine = ⟦u0:engine⟧",
         "    def start(self): ⟦c1:self.engine.start⟧()",
         "",
         "⟦v0:motor⟧ = ⟦cc0:ElectricMotor()⟧",
         "⟦v1:car⟧ = ⟦cc1:Car(⟧⟦a0:motor⟧)",
         "⟦c0:car.start⟧()",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 3, 4, 5],
            flights: [
               { from: "n0", to: "obj_k_mot", text: "class ElectricMotor", kind: VIOLET, at: 0.2 },
               { from: "n1", to: "obj_k_car", text: "class Car", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_mot", "class ElectricMotor", "other", [M("mo_start", "start", VIOLET)]),
               K("k_car", "class Car", "child", [M("car___init__", "__init__", GREEN), M("car_start", "start", GREEN)]),
            ],
            note: "ElectricMotor has the same start() method as an engine. The Car class below is identical to before.",
         },
         {
            label: "Motor",
            active: [7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "obj_o1", to: "m_motor", text: "<Motor #1>", kind: "ref", at: 1.1 },
            ],
            heaps: [OBJ("o1", "Motor #1", [])],
            globals: [N("m_motor", "motor", "<Motor #1>")],
            note: "This time the part is an electric motor.",
         },
         {
            label: "Pass in",
            active: [8, 3, 4],
            flights: [
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "p0", text: "<Motor #1>", kind: "ref", at: 0.7 },
               { from: "p0", to: "u0", text: "<Motor #1>", kind: "ref", at: 1.6 },
               { from: "u0", to: "o2_engine", text: "<Motor #1>", kind: "ref", at: 2.4 },
               { from: "obj_o2", to: "m_car", text: "<Car #1>", kind: "ref", at: 3.0 },
            ],
            swap: {
               p0: { text: "<Motor #1>", kind: "ref", cap: "engine" },
               u0: { text: "<Motor #1>", kind: "ref" },
            },
            heaps: [OBJ("o2", "Car #1", [R("o2_engine", "engine", "<Motor #1>", "ref")])],
            globals: [N("m_car", "car", "<Car #1>")],
            note: "Car accepts any object that offers start(). It does not care that this one is a motor.",
         },
         {
            label: "start()",
            active: [9, 5, 1],
            hot: ["c0"],
            flights: [
               { from: "c0", to: "car_start", text: "start", kind: GREEN, at: 0.2 },
               { from: "c1", to: "o2_engine", text: "self.engine", kind: "ref", at: 0.9 },
               { from: "o2_engine", to: "obj_o1", text: "Motor #1", kind: "ref", at: 1.6 },
               { from: "obj_o1", to: "mo_start", text: "start", kind: VIOLET, at: 2.2 },
               { from: "q0", to: "cons", text: "Electric motor started.", kind: "ret", at: 3.0 },
            ],
            out: ["Electric motor started."],
            note: "Same Car code, different behavior, because the component it received is different.",
         },
      ],
   },
   /* 5 Aggregation ---------------------------------------------------------------- */
   {
      eyebrow: "Aggregation",
      title: "The team uses a manager that already exists",
      lines: [
         "class ⟦n0:Employee⟧:",
         "    def __init__(self, ⟦p0:name⟧):",
         "        self.name = ⟦u0:name⟧",
         "",
         "class ⟦n1:Team⟧:",
         "    def __init__(self, ⟦p1:manager⟧):",
         "        self.manager = ⟦u1:manager⟧",
         "",
         '⟦v:manager⟧ = ⟦cc0:Employee(⟧⟦a0:"Maya"⟧)',
         "⟦v2:team⟧ = ⟦cc1:Team(⟧⟦a1:manager⟧)",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 4, 5, 6],
            flights: [
               { from: "n0", to: "obj_k_emp", text: "class Employee", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_team", text: "class Team", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_emp", "class Employee", "parent", [M("emp___init__", "__init__", BLUE)]),
               K("k_team", "class Team", "child", [M("team___init__", "__init__", GREEN)]),
            ],
            note: "Team does not create its manager. It only receives one.",
         },
         {
            label: "Manager",
            active: [8, 1, 2],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "p0", text: '"Maya"', kind: GREEN, at: 0.6 },
               { from: "p0", to: "u0", text: '"Maya"', kind: GREEN, at: 1.4 },
               { from: "u0", to: "o1_name", text: '"Maya"', kind: GREEN, at: 2.2 },
               { from: "obj_o1", to: "m_manager", text: "<Employee #1>", kind: "ref", at: 2.8 },
            ],
            swap: { p0: { text: '"Maya"', kind: GREEN, cap: "name" }, u0: { text: '"Maya"', kind: GREEN } },
            heaps: [OBJ("o1", "Employee #1", [R("o1_name", "name", '"Maya"')])],
            globals: [N("m_manager", "manager", "<Employee #1>")],
            note: "Maya exists on her own, before any team does.",
         },
         {
            label: "Team",
            active: [9, 5],
            flights: [
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "a1", to: "p1", text: "<Employee #1>", kind: "ref", at: 0.7 },
               { from: "obj_o2", to: "m_team", text: "<Team #1>", kind: "ref", at: 1.6 },
            ],
            swap: { p1: { text: "<Employee #1>", kind: "ref", cap: "manager" } },
            heaps: [OBJ("o2", "Team #1", [])],
            globals: [N("m_team", "team", "<Team #1>")],
            note: "The existing manager is supplied to the new Team from outside.",
         },
         {
            label: "Store",
            active: [6],
            flights: [
               { from: "p1", to: "u1", text: "<Employee #1>", kind: "ref", at: 0.2 },
               { from: "u1", to: "o2_manager", text: "<Employee #1>", kind: "ref", at: 1.2 },
            ],
            swap: { u1: { text: "<Employee #1>", kind: "ref" } },
            heaps: [OBJ("o2", "Team #1", [R("o2_manager", "manager", "<Employee #1>", "ref")])],
            note: "The Team keeps a reference to Maya. She could outlive the team and be used elsewhere too.",
         },
      ],
   },
   /* 6 Order and cart ------------------------------------------------------------- */
   {
      eyebrow: "Putting it together",
      title: "Order handles the workflow, ShoppingCart handles the totals",
      dense: true,
      lines: [
         "class ⟦n0:ShoppingCart⟧:",
         "    def __init__(self): self.items = []",
         "    def add(self, price): self.items.append(price)",
         "    def total(self): return sum(self.items)",
         "class ⟦n1:Order⟧:",
         "    def __init__(self): self.cart = ⟦cc1:ShoppingCart()⟧",
         "    def add_product(self, price): ⟦c1:self.cart.add⟧(price)",
         "    def checkout(self): print(⟦g0:self.cart.total()⟧)",
         "",
         "⟦v:order⟧ = ⟦cc0:Order()⟧",
         "⟦c0:order.add_product⟧(⟦a0:80⟧)",
         "⟦c2:order.add_product⟧(⟦a1:40⟧)",
         "⟦c3:order.checkout⟧()",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 3, 4, 5, 6, 7],
            flights: [
               { from: "n0", to: "obj_k_cart", text: "class ShoppingCart", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_ord", text: "class Order", kind: GREEN, at: 0.5 },
            ],
            heaps: [
               K("k_cart", "class ShoppingCart", "parent", [
                  M("cart___init__", "__init__", BLUE),
                  M("cart_add", "add", BLUE),
                  M("cart_total", "total", BLUE),
               ]),
               K("k_ord", "class Order", "child", [
                  M("ord___init__", "__init__", GREEN),
                  M("ord_add", "add_product", GREEN),
                  M("ord_checkout", "checkout", GREEN),
               ]),
            ],
            note: "Two focused classes. The cart stores items and totals them. The order runs the workflow. Method names are shortened here to fit.",
         },
         {
            label: "Order",
            active: [9, 5],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 1.0 },
               { from: "obj_o2", to: "o1_cart", text: "<Cart #1>", kind: "ref", at: 1.8 },
               { from: "obj_o1", to: "m_order", text: "<Order #1>", kind: "ref", at: 2.4 },
            ],
            heaps: [
               OBJ("o1", "Order #1", [R("o1_cart", "cart", "<Cart #1>", "ref")]),
               OBJ("o2", "Cart #1", [R("o2_items", "items", "[]")]),
            ],
            globals: [N("m_order", "order", "<Order #1>")],
            note: "Creating an Order also creates the ShoppingCart it owns. The cart starts empty.",
         },
         {
            label: "Add 80",
            active: [10, 6, 2],
            hot: ["c0"],
            flights: [
               { from: "c0", to: "ord_add", text: "add_product", kind: GREEN, at: 0.2 },
               { from: "c1", to: "cart_add", text: "delegate", kind: BLUE, at: 0.9 },
               { from: "a0", to: "o2_items", text: "80", kind: GREEN, at: 1.7 },
            ],
            heaps: [OBJ("o2", "Cart #1", [R("o2_items", "items", "[80]")])],
            note: "The order does not store the product itself. It delegates to the cart.",
         },
         {
            label: "Add 40",
            active: [11, 6, 2],
            hot: ["c2"],
            flights: [
               { from: "c2", to: "ord_add", text: "add_product", kind: GREEN, at: 0.2 },
               { from: "c1", to: "cart_add", text: "delegate", kind: BLUE, at: 0.9 },
               { from: "a1", to: "o2_items", text: "40", kind: GREEN, at: 1.7 },
            ],
            heaps: [OBJ("o2", "Cart #1", [R("o2_items", "items", "[80, 40]")])],
            note: "A second product goes the same way.",
         },
         {
            label: "Checkout",
            active: [12, 7, 3],
            hot: ["c3"],
            flights: [
               { from: "c3", to: "ord_checkout", text: "checkout", kind: GREEN, at: 0.2 },
               { from: "g0", to: "cart_total", text: "total", kind: BLUE, at: 0.9 },
               { from: "o2_items", to: "g0", text: "120", kind: GREEN, at: 1.7 },
               { from: "g0", to: "cons", text: "120", kind: "ret", at: 2.6 },
            ],
            swap: { g0: { text: "120", kind: GREEN } },
            out: ["120"],
            note: "The order asks the cart for the total. It does not need to know how the sum is calculated.",
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

const KEYWORDS = new Set(["def", "class", "return", "if", "else", "raise", "pass", "for", "in", "from", "import"]);
const DECORATORS = new Set(["classmethod", "staticmethod", "property", "abstractmethod"]);
const BUILTIN_NAMES = new Set(["print", "len"]);

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
            <ZoneBox label="names" height={ctx.zones[0]}>
               <div className="flex flex-col gap-1">
                  {view.globals.length === 0 && <Placeholder>no names yet</Placeholder>}
                  {view.globals.map((row) => (
                     <RowView key={row.id} row={row} ctx={ctx} />
                  ))}
               </div>
            </ZoneBox>
            <ZoneBox label="classes" height={ctx.zones[1]}>
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
            <ZoneBox label="objects and calls" height={ctx.zones[2]}>
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

// An arrow head at the end of a straight or elbow line, drawn in SVG.
function Head({ at, deg, color }: { at: Pt; deg: number; color: string }) {
   return <polygon points="0,0 -11,-6 -11,6" fill={color} transform={`translate(${at[0]} ${at[1]}) rotate(${deg})`} />;
}


/* -------------------------------------------------------------------------- */
/* Step 1: a bigger object holds smaller ones                                  */
/* -------------------------------------------------------------------------- */

const PARTS: { container: string; cIcon: typeof Users; part: string; pIcon: typeof Users; attr: string; tone: Tone; sentence: string }[] = [
   { container: "Car", cIcon: Car, part: "Engine", pIcon: Settings, attr: "engine", tone: "parent", sentence: "A Car has an Engine" },
   { container: "Computer", cIcon: Laptop, part: "Processor", pIcon: Cpu, attr: "processor", tone: "child", sentence: "A Computer has a Processor" },
   { container: "Order", cIcon: Package, part: "ShoppingCart", pIcon: ShoppingCart, attr: "cart", tone: "other", sentence: "An Order has a ShoppingCart" },
];

function PartsScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   return (
      <Backdrop>
         {PARTS.map((p, i) => {
            const t0 = 0.4 + i * 3.2;
            const local = t - t0;
            const started = local >= -0.2;
            const filled = local >= 1.7;
            const CIcon = p.cIcon;
            const PIcon = p.pIcon;
            const tone = TONE[p.tone];
            return (
               <motion.div key={p.container} animate={{ opacity: started ? 1 : 0.4 }} transition={{ duration: 0.3 }} className="absolute inset-x-0" style={{ top: 10 + i * 130, height: 120 }}>
                  <div className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${filled ? tone.box : "border-white/20"}`} style={{ left: 24, top: 6, width: 330, height: 108 }}>
                     <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
                        <span className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/5">
                           <CIcon className="size-[18px] text-slate-200" />
                        </span>
                        <span className="font-mono text-[15px] font-semibold text-white">{p.container}</span>
                     </span>
                     <div
                        className={`absolute flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-300 ${filled ? `${tone.box} bg-white/5` : "border-white/20"}`}
                        style={{ left: 14, top: 54, width: 302, height: 42 }}
                     >
                        {filled ? (
                           <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                              <PIcon className={`size-4 ${tone.text}`} />
                              <span className="font-mono text-[12px] text-white">self.{p.attr}</span>
                              <span className="text-[12px] text-slate-400">holds {/^[AEIOU]/.test(p.part) ? "an" : "a"} {p.part}</span>
                           </motion.span>
                        ) : (
                           <span className="text-[12px] text-slate-500">empty slot</span>
                        )}
                     </div>
                  </div>

                  <motion.div
                     animate={{ opacity: local >= 0 ? (filled ? 0.55 : 1) : 0, x: local >= 0 ? 0 : 12 }}
                     className={`absolute rounded-xl border bg-slate-900 ${tone.box}`}
                     style={{ left: 560, top: 30, width: 216, height: 60 }}
                  >
                     <span className="absolute flex items-center gap-2.5" style={{ left: 12, top: 14 }}>
                        <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                           <PIcon className="size-[18px]" />
                        </span>
                        <span className="font-mono text-[14px] font-semibold text-white">{p.part}</span>
                     </span>
                  </motion.div>
                  <Fly t={local} start={0.8} dur={0.9} from={[560, 48]} to={[150, 71]} kind={tone.chip} text={`${p.part}()`} />

                  {filled && (
                     <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="absolute" style={{ left: 376, top: 22, width: 170 }}>
                        <Pill tone="own">has-a</Pill>
                        <p className="mt-2 text-[14px] leading-5 text-white">{p.sentence}</p>
                     </motion.div>
                  )}
               </motion.div>
            );
         })}
         <motion.div
            animate={fade(t >= 10.4)}
            className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
            style={{ left: 24, top: 398, width: 752, height: 40 }}
         >
            <CheckCircle2 className="size-5 shrink-0 text-mint" />
            <p className="text-[13px] text-white">Is-a? Consider inheritance. Has-a? Consider composition.</p>
         </motion.div>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 2: delegation, the outer object forwards the work                      */
/* -------------------------------------------------------------------------- */

function DelegationScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   const carOn = t >= 2.2 && t < 5.2;
   const engOn = t >= 3.6 && t < 6.4;
   return (
      <Backdrop>
         <motion.div animate={fade(t >= 0.3)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.child.box}`} style={{ left: 24, top: 140, width: 188, height: 110 }}>
            <span className="absolute flex size-9 items-center justify-center rounded-xl border border-mint/40 bg-mint/10" style={{ left: 14, top: 14 }}>
               <Laptop className="size-5 text-mint" />
            </span>
            <p className="absolute text-[15px] font-medium text-white" style={{ left: 62, top: 22 }}>
               Your code
            </p>
            <span className="absolute" style={{ left: 14, top: 62 }}>
               <Chip kind="val">car.start()</Chip>
            </span>
         </motion.div>

         <motion.div animate={fade(t >= 0.6)} className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${carOn ? TONE.child.box : "border-white/20"}`} style={{ left: 270, top: 24, width: 370, height: 306 }}>
            <span className="absolute flex items-center gap-2.5" style={{ left: 18, top: 14 }}>
               <span className="flex size-9 items-center justify-center rounded-xl border border-mint/40 bg-mint/10">
                  <Car className="size-5 text-mint" />
               </span>
               <span className="text-[17px] font-medium text-white">Car</span>
               <Pill tone="child">outer object</Pill>
            </span>
            <span className="absolute" style={{ left: 18, top: 62 }}>
               <Chip kind="val">start()</Chip>
            </span>
            <span className="absolute text-[11px] text-slate-400" style={{ left: 86, top: 65 }}>
               decides what callers can do
            </span>

            <motion.div animate={fade(t >= 1.0)} className={`absolute rounded-xl border bg-slate-950 transition-colors duration-300 ${engOn ? TONE.parent.box : "border-white/20"}`} style={{ left: 18, top: 112, width: 334, height: 170 }}>
               <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 14 }}>
                  <motion.span animate={{ rotate: engOn ? (t - 3.6) * 160 : 0 }} transition={{ duration: 0.1, ease: "linear" }} className="flex size-9 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
                     <Settings className="size-5 text-sky-300" />
                  </motion.span>
                  <span className="text-[15px] font-medium text-white">Engine</span>
                  <Pill tone="parent">component</Pill>
               </span>
               <span className="absolute" style={{ left: 14, top: 62 }}>
                  <Chip kind="ref">start()</Chip>
               </span>
               <span className="absolute text-[11px] text-slate-400" style={{ left: 82, top: 65 }}>
                  does the real work
               </span>
               <span className="absolute flex items-center gap-1.5 text-[11px] text-slate-500" style={{ left: 14, top: 118 }}>
                  <Lock className="size-3.5" /> callers never touch this directly
               </span>
            </motion.div>
         </motion.div>

         {t >= 2.8 && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2.5 py-0.5 text-[11px] ${TONE.own.pill}`} style={{ left: 548, top: 108 }}>
               delegates
            </motion.span>
         )}

         <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
            <line x1={214} y1={195} x2={256} y2={195} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
            <Head at={[264, 195]} deg={0} color="rgba(148,163,184,0.85)" />
         </svg>

         <Fly t={t} start={1.4} dur={0.8} from={[38, 202]} to={[290, 86]} kind="val" text="start()" />
         <Fly t={t} start={2.8} dur={0.8} from={[290, 86]} to={[306, 198]} kind="ref" text="start()" />

         <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 24, top: 352, width: 752, height: 84 }}>
            <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 10 }}>
               output
            </p>
            {t >= 4.4 && (
               <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`absolute font-mono text-[13px] ${TONE.parent.text}`} style={{ left: 16, top: 34 }}>
                  Engine started.
               </motion.p>
            )}
         </div>

         <motion.div animate={fade(t >= 5.0)} className="absolute rounded-xl border border-white/20 bg-slate-900 p-3" style={{ left: 654, top: 150, width: 130, height: 110 }}>
            <p className="text-[12px] leading-[18px] text-slate-300">Callers talk to the Car. The Car talks to the Engine.</p>
         </motion.div>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 3: pass a part in, the same class behaves differently                  */
/* -------------------------------------------------------------------------- */

const PASS_CARS: { brand: string; part: string; pIcon: typeof Users; tone: Tone; x: number; shelfX: number; line: string }[] = [
   { brand: "Toyota", part: "Engine", pIcon: Settings, tone: "parent", x: 40, shelfX: 120, line: "Gas engine started." },
   { brand: "Tesla", part: "ElectricMotor", pIcon: Zap, tone: "other", x: 420, shelfX: 440, line: "Electric motor started." },
];

function PassInScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   const FLY_AT = [1.4, 3.2];
   const RUN_AT = [5.0, 6.6];
   return (
      <Backdrop>
         {PASS_CARS.map((c, i) => {
            const PIcon = c.pIcon;
            const tone = TONE[c.tone];
            const filled = t >= FLY_AT[i] + 0.9;
            const running = t >= RUN_AT[i] && t < RUN_AT[i] + 1.4;
            return (
               <div key={c.brand}>
                  <motion.div animate={fade(t >= 0.3 + i * 0.15)} className={`absolute rounded-xl border bg-slate-900 ${tone.box}`} style={{ left: c.shelfX, top: 14, width: 240, height: 64 }}>
                     <span className="absolute flex items-center gap-2.5" style={{ left: 12, top: 15 }}>
                        <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                           <PIcon className="size-[18px]" />
                        </span>
                        <span className="font-mono text-[14px] font-semibold text-white">{c.part}</span>
                     </span>
                  </motion.div>

                  <motion.div
                     animate={fade(t >= 0.8 + i * 0.15)}
                     className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${running ? TONE.child.box : filled ? "border-white/30" : "border-white/20"}`}
                     style={{ left: c.x, top: 150, width: 340, height: 140 }}
                  >
                     <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 14 }}>
                        <span className="flex size-8 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
                           <Car className="size-[18px] text-mint" />
                        </span>
                        <span className="text-[16px] font-medium text-white">Car</span>
                        <Pill tone="child">{c.brand}</Pill>
                     </span>
                     <div
                        className={`absolute flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors duration-300 ${filled ? `${tone.box} bg-white/5` : "border-white/20"}`}
                        style={{ left: 14, top: 62, width: 312, height: 58 }}
                     >
                        {filled ? (
                           <motion.span initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                              <PIcon className={`size-4 ${tone.text}`} />
                              <span className="font-mono text-[12px] text-white">self.engine</span>
                              <span className="text-[12px] text-slate-400">= {c.part}</span>
                           </motion.span>
                        ) : (
                           <span className="text-[12px] text-slate-500">needs an engine</span>
                        )}
                     </div>
                  </motion.div>

                  <Fly t={t} start={FLY_AT[i]} dur={0.9} from={[c.shelfX + 20, 36]} to={[c.x + 40, 228]} kind={tone.chip} text={`${c.part}()`} />
                  <Fly t={t} start={RUN_AT[i]} dur={0.6} from={[c.x + 60, 168]} to={[c.x + 60, 230]} kind="val" text="start()" />
               </div>
            );
         })}

         {t >= 7.8 && (
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-3 py-1 text-[12px] ${TONE.own.pill}`} style={{ left: 300, top: 100 }}>
               same Car class, different part
            </motion.span>
         )}

         <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 40, top: 318, width: 720, height: 118 }}>
            <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 10 }}>
               output
            </p>
            <div className="absolute flex flex-col gap-1.5" style={{ left: 16, top: 34 }}>
               {PASS_CARS.map((c, i) =>
                  t >= RUN_AT[i] + 0.8 ? (
                     <motion.p key={c.brand} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[13px] ${TONE[c.tone].text}`}>
                        {c.line}
                     </motion.p>
                  ) : null,
               )}
            </div>
         </div>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 4: composition owns its part, aggregation only refers to one           */
/* -------------------------------------------------------------------------- */

function OwnershipScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   const gone = t >= 4.6;
   return (
      <Backdrop>
         {/* Composition */}
         <motion.div animate={fade(t >= 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 16, top: 16, width: 368, height: 418 }}>
            <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
               Composition
            </p>
            <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
               The computer creates and owns its processor
            </p>
         </motion.div>
         <motion.div
            animate={{ opacity: t >= 0.6 ? (gone ? 0.15 : 1) : 0, y: t >= 0.6 ? (gone ? 10 : 0) : 10, scale: gone ? 0.96 : 1 }}
            transition={{ duration: 0.5 }}
            className={`absolute rounded-2xl border bg-slate-950 ${TONE.child.box}`}
            style={{ left: 40, top: 100, width: 320, height: 150 }}
         >
            <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
               <span className="flex size-8 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
                  <Laptop className="size-[18px] text-mint" />
               </span>
               <span className="font-mono text-[15px] font-semibold text-white">Computer</span>
            </span>
            {t >= 2.0 && (
               <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.own.pill}`} style={{ right: 12, top: 18 }}>
                  created inside
               </motion.span>
            )}
            <div className="absolute rounded-xl border-2 border-dashed border-white/20" style={{ left: 14, top: 60, width: 292, height: 76 }}>
               {t >= 1.4 && (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className={`absolute flex items-center gap-2.5 rounded-lg border bg-slate-900 px-3 ${TONE.parent.box}`} style={{ left: 12, top: 12, width: 266, height: 48 }}>
                     <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
                        <Cpu className="size-[18px] text-sky-300" />
                     </span>
                     <span className="font-mono text-[14px] font-semibold text-white">Processor</span>
                  </motion.div>
               )}
            </div>
         </motion.div>
         <motion.p animate={{ opacity: t >= 5.0 ? 1 : 0 }} className="absolute text-[13px] leading-5 text-slate-300" style={{ left: 40, top: 276, width: 320 }}>
            Discard the computer and its processor goes with it.
         </motion.p>

         {/* Aggregation */}
         <motion.div animate={fade(t >= 0.4)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 416, top: 16, width: 368, height: 418 }}>
            <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
               Aggregation
            </p>
            <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
               The team uses a manager that already exists
            </p>
         </motion.div>
         <motion.div animate={fade(t >= 0.8)} className={`absolute rounded-xl border bg-slate-950 transition-colors duration-300 ${gone ? TONE.child.box : "border-white/25"}`} style={{ left: 440, top: 100, width: 320, height: 72 }}>
            <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
               <span className="flex size-9 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
                  <User className="size-5 text-mint" />
               </span>
               <span className="font-mono text-[14px] font-semibold text-white">Employee</span>
               <Chip kind="val">"Maya"</Chip>
            </span>
            <span className="absolute text-[10px] text-slate-500" style={{ right: 12, top: 10 }}>
               exists on its own
            </span>
         </motion.div>

         <motion.div
            animate={{ opacity: t >= 1.6 ? (gone ? 0.15 : 1) : 0, y: t >= 1.6 ? (gone ? 10 : 0) : 10, scale: gone ? 0.96 : 1 }}
            transition={{ duration: 0.5 }}
            className={`absolute rounded-2xl border bg-slate-950 ${TONE.other.box}`}
            style={{ left: 440, top: 230, width: 320, height: 120 }}
         >
            <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
               <span className="flex size-8 items-center justify-center rounded-lg border border-violet/40 bg-violet/10">
                  <Users className="size-[18px] text-violet" />
               </span>
               <span className="font-mono text-[15px] font-semibold text-white">Team</span>
            </span>
            <div className="absolute flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20" style={{ left: 14, top: 56, width: 292, height: 48 }}>
               {t >= 2.6 ? (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                     <Chip kind="ref">manager</Chip>
                     <span className="text-[12px] text-slate-400">refers to Maya</span>
                  </motion.span>
               ) : (
                  <span className="text-[12px] text-slate-500">needs a manager</span>
               )}
            </div>
         </motion.div>

         <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
            <motion.path
               d="M 600 280 L 600 190"
               fill="none"
               stroke="#a78bfa"
               strokeWidth={3}
               strokeDasharray="6 5"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: t >= 2.2 && !gone ? 1 : 0 }}
               transition={{ duration: 0.5 }}
            />
            {t >= 2.7 && !gone && <Head at={[600, 176]} deg={-90} color="#a78bfa" />}
         </svg>
         {t >= 2.7 && !gone && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.other.pill}`} style={{ left: 612, top: 202 }}>
               refers to
            </motion.span>
         )}
         <motion.p animate={{ opacity: t >= 5.0 ? 1 : 0 }} className={`absolute flex items-center gap-2 text-[13px] leading-5 ${TONE.child.text}`} style={{ left: 440, top: 372, width: 320 }}>
            <CheckCircle2 className="size-5 shrink-0" /> Discard the team and Maya still exists.
         </motion.p>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 5: an order delegates products and totals to its cart                  */
/* -------------------------------------------------------------------------- */

const PRODUCTS = [
   { name: "Keyboard $80", x: 284, at: 1.8 },
   { name: "Mouse $40", x: 428, at: 4.2 },
];

function OrderScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   const totalOn = t >= 8.0 && t < 10.2;
   const orderOn = (t >= 1.8 && t < 3.4) || (t >= 4.2 && t < 5.8) || (t >= 6.6 && t < 7.6) || (t >= 9.0 && t < 9.8);
   return (
      <Backdrop>
         <motion.div animate={fade(t >= 0.3)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 24, top: 130, width: 172, height: 100 }}>
            <span className="absolute flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/5" style={{ left: 14, top: 14 }}>
               <Laptop className="size-5 text-slate-200" />
            </span>
            <p className="absolute text-[15px] font-medium text-white" style={{ left: 62, top: 22 }}>
               Your code
            </p>
            <p className="absolute text-[11px] text-slate-500" style={{ left: 14, top: 68 }}>
               adds, then checks out
            </p>
         </motion.div>

         <motion.div animate={fade(t >= 0.3)} className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${orderOn ? TONE.child.box : "border-white/20"}`} style={{ left: 250, top: 20, width: 450, height: 310 }}>
            <span className="absolute flex items-center gap-2.5" style={{ left: 18, top: 12 }}>
               <span className="flex size-8 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
                  <Package className="size-[18px] text-mint" />
               </span>
               <span className="text-[16px] font-medium text-white">Order</span>
               <Pill tone="child">workflow</Pill>
            </span>
            <span className="absolute" style={{ left: 18, top: 56 }}>
               <Chip kind="val">add_product()</Chip>
            </span>
            <span className="absolute" style={{ left: 140, top: 56 }}>
               <Chip kind="val">checkout()</Chip>
            </span>
         </motion.div>

         <motion.div animate={fade(t >= 0.8)} className={`absolute rounded-xl border bg-slate-950 ${TONE.parent.box}`} style={{ left: 268, top: 112, width: 414, height: 202 }}>
            <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
               <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
                  <ShoppingCart className="size-[18px] text-sky-300" />
               </span>
               <span className="font-mono text-[14px] font-semibold text-white">ShoppingCart</span>
               <Pill tone="parent">component</Pill>
            </span>
            <span className="absolute" style={{ left: 16, top: 52 }}>
               <Chip kind="ref">add()</Chip>
            </span>
            <span className="absolute" style={{ left: 78, top: 52 }}>
               <Chip kind="ref">total()</Chip>
            </span>
            <p className="absolute text-[11px] text-slate-500" style={{ left: 16, top: 76 }}>
               items
            </p>
            <div
               className={`absolute flex flex-col items-center justify-center rounded-xl border transition-colors duration-300 ${totalOn ? TONE.own.box : "border-white/20"} bg-slate-900`}
               style={{ left: 270, top: 90, width: 128, height: 100 }}
            >
               <span className="text-[11px] text-slate-400">total</span>
               <span className={`font-mono text-[34px] font-semibold ${t >= 8.4 ? "text-amber" : "text-slate-600"}`}>{t >= 8.4 ? "120" : "?"}</span>
            </div>
         </motion.div>

         {PRODUCTS.map((p) =>
            t >= p.at + 1.6 ? (
               <motion.div key={p.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute" style={{ left: p.x, top: 204 }}>
                  <Chip kind="val">{p.name}</Chip>
               </motion.div>
            ) : null,
         )}
         {PRODUCTS.map((p) => (
            <div key={p.name}>
               <Fly t={t} start={p.at} dur={0.7} from={[40, 178]} to={[268, 76]} kind="val" text={p.name} />
               <Fly t={t} start={p.at + 0.9} dur={0.7} from={[268, 76]} to={[p.x, 204]} kind="val" text={p.name} />
            </div>
         ))}
         <Fly t={t} start={6.6} dur={0.7} from={[40, 178]} to={[390, 76]} kind="ret" text="checkout()" />
         <Fly t={t} start={7.4} dur={0.6} from={[390, 76]} to={[346, 164]} kind="ref" text="total?" />
         <Fly t={t} start={9.0} dur={0.7} from={[540, 222]} to={[390, 76]} kind="cls" text="120" />
         <Fly t={t} start={9.8} dur={0.7} from={[390, 76]} to={[40, 384]} kind="cls" text="120" />

         <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 24, top: 352, width: 752, height: 84 }}>
            <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 10 }}>
               output
            </p>
            {t >= 10.6 && (
               <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="absolute font-mono text-[13px] text-amber" style={{ left: 16, top: 34 }}>
                  Order ORD-101: $120
               </motion.p>
            )}
         </div>
      </Backdrop>
   );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
   const t = useClock(step, reduce, running);
   return (
      <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
         <AnimatePresence mode="wait">
            {step === 0 && <PartsScene key="parts" t={t} />}
            {step === 1 && <DelegationScene key="delegation" t={t} />}
            {step === 2 && <PassInScene key="passin" t={t} />}
            {step === 3 && <OwnershipScene key="ownership" t={t} />}
            {step === 4 && <OrderScene key="order" t={t} />}
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
   title: "Build big from small",
   steps: [
      {
         label: "Has-a",
         ms: 12000,
         note: "Composition builds a larger object from smaller ones. A Car has an Engine, a Computer has a Processor, an Order has a ShoppingCart.",
      },
      {
         label: "Delegation",
         ms: 9400,
         note: "The outer object offers the operation and forwards the work to its component. Callers talk to the Car, not to the Engine. This is delegation.",
      },
      {
         label: "Pass in",
         ms: 10800,
         note: "A component can be passed in instead of created inside. The same Car class behaves differently depending on the part it receives.",
      },
      {
         label: "Ownership",
         ms: 8800,
         note: "In composition the container creates and owns its part. In aggregation the part exists independently and is supplied from outside.",
      },
      {
         label: "Order and cart",
         ms: 13200,
         note: "An Order delegates products and totals to its ShoppingCart. Each class keeps one focused job, and the cart can change without touching Order.",
      },
   ],
};

const ENTRIES: Entry[] = [OVERVIEW, ...slides.map((s): Entry => ({ kind: "code", ...s }))];

// The names and classes zones can be resized for a slide; objects get what is left.
const zonesOf = (s: Slide): [number, number, number] =>
   s.zones ? [s.zones[0], s.zones[1], BODY_H - 58 - s.zones[0] - s.zones[1]] : [ZONE_NAMES_H, ZONE_CLASS_H, ZONE_OBJECTS_H];

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

export function CompositionCustomAnimation() {
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

   const ctx: Ctx = { step, view, prev, reg, reduce, timed, dense: !!codeSlide.dense, wide: !!codeSlide.wide, zones: zonesOf(codeSlide) };
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