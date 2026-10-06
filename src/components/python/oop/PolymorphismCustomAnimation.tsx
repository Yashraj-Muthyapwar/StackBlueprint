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
   Calculator,
   CheckCircle2,
   ChevronLeft,
   ChevronRight,
   CreditCard,
   Database,
   FileText,
   Gift,
   Landmark,
   Laptop,
   Pause,
   PenTool,
   Play,
   Plus,
   Repeat,
   RotateCcw,
   Settings,
   Shield,
   Users,
   Wallet,
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

// Types and classes take a color so they are easy to tell apart: blue, green,
// violet and amber. A method chip uses the color of the class that defines it.
const BLUE = "ref" as Kind;
const GREEN = "val" as Kind;
const VIOLET = "fn" as Kind;
const AMBER = "cls" as Kind;

const slides: Slide[] = [
   /* 1 Operator polymorphism ------------------------------------------------- */
   {
      eyebrow: "Operator polymorphism",
      title: "One + sign, a different behavior for each type",
      consoleRows: 5,
      lines: [
         "print(⟦g0:5 + 3⟧)",
         "print(⟦g1:2.5 + 1.5⟧)",
         'print(⟦g2:"Stack" + "Blueprint"⟧)',
         "print(⟦g3:[1, 2] + [3, 4]⟧)",
      ],
      steps: [
         {
            label: "Types",
            active: [0, 1, 2, 3],
            heaps: [
               K("k_int", "int", "parent", [M("int_add", "__add__", BLUE)]),
               K("k_float", "float", "child", [M("float_add", "__add__", GREEN)]),
               K("k_str", "str", "other", [M("str_add", "__add__", VIOLET)]),
               K("k_list", "list", "own", [M("list_add", "__add__", AMBER)]),
            ],
            note: "Every built-in type already defines what + means for its own values, in a method called __add__().",
         },
         {
            label: "Numbers",
            active: [0],
            flights: [
               { from: "g0", to: "int_add", text: "5 + 3", kind: BLUE, at: 0.2 },
               { from: "int_add", to: "g0", text: "8", kind: GREEN, at: 1.1 },
               { from: "g0", to: "cons", text: "8", kind: "ret", at: 2.0 },
            ],
            swap: { g0: { text: "8", kind: GREEN } },
            out: ["8"],
            note: "For two ints, Python asks int's __add__() to do the work, and it adds the numbers.",
         },
         {
            label: "Floats",
            active: [1],
            flights: [
               { from: "g1", to: "float_add", text: "2.5 + 1.5", kind: GREEN, at: 0.2 },
               { from: "float_add", to: "g1", text: "4.0", kind: GREEN, at: 1.1 },
               { from: "g1", to: "cons", text: "4.0", kind: "ret", at: 2.0 },
            ],
            swap: { g1: { text: "4.0", kind: GREEN } },
            out: ["4.0"],
            note: "Floats use float's __add__(), so the result is another float.",
         },
         {
            label: "Strings",
            active: [2],
            flights: [
               { from: "g2", to: "str_add", text: "two strings", kind: VIOLET, at: 0.2 },
               { from: "str_add", to: "g2", text: '"StackBlueprint"', kind: GREEN, at: 1.1 },
               { from: "g2", to: "cons", text: "StackBlueprint", kind: "ret", at: 2.0 },
            ],
            swap: { g2: { text: '"StackBlueprint"', kind: GREEN } },
            out: ["StackBlueprint"],
            note: "For str, the same + calls a different __add__(), and it joins the two strings instead of adding numbers.",
         },
         {
            label: "Lists",
            active: [3],
            flights: [
               { from: "g3", to: "list_add", text: "two lists", kind: AMBER, at: 0.2 },
               { from: "list_add", to: "g3", text: "[1, 2, 3, 4]", kind: GREEN, at: 1.1 },
               { from: "g3", to: "cons", text: "[1, 2, 3, 4]", kind: "ret", at: 2.0 },
            ],
            swap: { g3: { text: "[1, 2, 3, 4]", kind: GREEN } },
            out: ["[1, 2, 3, 4]"],
            note: "For list, __add__() builds a new list with the items of both. Same symbol, a fourth behavior.",
         },
      ],
   },
   /* 2 Operator overloading -------------------------------------------------- */
   {
      eyebrow: "Operator overloading",
      title: "Your own class can decide what + means",
      zones: [64, 56],
      lines: [
         "class ⟦n0:Money⟧:",
         "    def __init__(self, amount):",
         "        self.amount = amount",
         "",
         "    def __add__(⟦s:self⟧, ⟦p0:other⟧):",
         "        return ⟦cc1:Money(⟧⟦u0:self.amount⟧ + ⟦u1:other.amount⟧)",
         "",
         "⟦v:total⟧ = ⟦cc0:Money(⟧⟦a0:100⟧) ⟦c0:+⟧ ⟦cc2:Money(⟧⟦a1:50⟧)",
         "print(⟦g0:total.amount⟧)",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 4, 5],
            flights: [{ from: "n0", to: "obj_k_money", text: "class Money", kind: BLUE, at: 0.2 }],
            heaps: [K("k_money", "class Money", "parent", [M("mon___init__", "__init__", BLUE), M("mon___add__", "__add__", AMBER)])],
            note: "Money defines __add__(), which tells Python what + should do when both sides are Money objects.",
         },
         {
            label: "Left",
            active: [7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "a0", to: "o1_amount", text: "100", kind: GREEN, at: 0.7 },
            ],
            heaps: [OBJ("o1", "Money #1", [R("o1_amount", "amount", "100")])],
            note: "Money(100) creates the left-hand object. Its __init__() stores the amount.",
         },
         {
            label: "Right",
            active: [7],
            flights: [
               { from: "cc2", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "a1", to: "o2_amount", text: "50", kind: GREEN, at: 0.7 },
            ],
            heaps: [OBJ("o2", "Money #2", [R("o2_amount", "amount", "50")])],
            note: "Money(50) creates the right-hand object.",
         },
         {
            label: "Plus",
            active: [7, 4],
            hot: ["c0"],
            flights: [
               { from: "c0", to: "mon___add__", text: "+ means __add__", kind: "ref", at: 0.2 },
               { from: "obj_o1", to: "s", text: "Money #1", kind: "ref", at: 1.0 },
               { from: "obj_o2", to: "p0", text: "Money #2", kind: "ref", at: 1.3 },
            ],
            swap: {
               s: { text: "Money #1", kind: "ref", cap: "self" },
               p0: { text: "Money #2", kind: "ref", cap: "other" },
            },
            note: "Python sees + between two Money objects and calls the left one's __add__(). The right one arrives as other.",
         },
         {
            label: "Add",
            active: [5],
            flights: [
               { from: "o1_amount", to: "u0", text: "100", kind: GREEN, at: 0.2 },
               { from: "o2_amount", to: "u1", text: "50", kind: GREEN, at: 0.5 },
            ],
            swap: { u0: { text: "100", kind: GREEN }, u1: { text: "50", kind: GREEN } },
            note: "The method reads the amount from self and from other, then adds them: 100 + 50.",
         },
         {
            label: "New",
            active: [5],
            flights: [
               { from: "cc1", to: "obj_o3", text: "new object", kind: "ref", at: 0.2 },
               { from: "u1", to: "o3_amount", text: "150", kind: GREEN, at: 1.0 },
            ],
            heaps: [OBJ("o3", "Money #3", [R("o3_amount", "amount", "150")])],
            note: "Money(...) builds a brand new object holding the sum. The two originals are left unchanged.",
         },
         {
            label: "Return",
            active: [7],
            drop: ["s", "p0", "u0", "u1"],
            flights: [{ from: "obj_o3", to: "m_total", text: "<Money #3>", kind: "ref", at: 0.2 }],
            globals: [N("m_total", "total", "<Money #3>")],
            note: "The new object comes back from __add__(), and total now refers to it.",
         },
         {
            label: "Print",
            active: [8],
            flights: [
               { from: "o3_amount", to: "g0", text: "150", kind: GREEN, at: 0.2 },
               { from: "g0", to: "cons", text: "150", kind: "ret", at: 1.2 },
            ],
            swap: { g0: { text: "150", kind: GREEN } },
            out: ["150"],
            note: "total.amount reads 150 from the new object.",
         },
      ],
   },
   /* 3 Function polymorphism ------------------------------------------------- */
   {
      eyebrow: "Function polymorphism",
      title: "One len(), many kinds of objects",
      consoleRows: 4,
      lines: [
         'print(⟦g0:len("Python")⟧)',
         "print(⟦g1:len([10, 20, 30])⟧)",
         'print(⟦g2:len({"name": "Maya", "role": "Developer"})⟧)',
      ],
      steps: [
         {
            label: "Types",
            active: [0, 1, 2],
            heaps: [
               K("k_str", "str", "parent", [M("str_len", "__len__", BLUE)]),
               K("k_list", "list", "child", [M("list_len", "__len__", GREEN)]),
               K("k_dict", "dict", "other", [M("dict_len", "__len__", VIOLET)]),
            ],
            note: "len() works on any object that can report its own size. Each type answers in its own way, through __len__().",
         },
         {
            label: "String",
            active: [0],
            flights: [
               { from: "g0", to: "str_len", text: "Python", kind: BLUE, at: 0.2 },
               { from: "str_len", to: "g0", text: "6", kind: GREEN, at: 1.1 },
               { from: "g0", to: "cons", text: "6", kind: "ret", at: 2.0 },
            ],
            swap: { g0: { text: "6", kind: GREEN } },
            out: ["6"],
            note: "For a str, len() counts characters. Python has six letters.",
         },
         {
            label: "List",
            active: [1],
            flights: [
               { from: "g1", to: "list_len", text: "[10, 20, 30]", kind: GREEN, at: 0.2 },
               { from: "list_len", to: "g1", text: "3", kind: GREEN, at: 1.1 },
               { from: "g1", to: "cons", text: "3", kind: "ret", at: 2.0 },
            ],
            swap: { g1: { text: "3", kind: GREEN } },
            out: ["3"],
            note: "For a list, the same len() counts items instead.",
         },
         {
            label: "Dict",
            active: [2],
            flights: [
               { from: "g2", to: "dict_len", text: "dictionary", kind: VIOLET, at: 0.2 },
               { from: "dict_len", to: "g2", text: "2", kind: GREEN, at: 1.1 },
               { from: "g2", to: "cons", text: "2", kind: "ret", at: 2.0 },
            ],
            swap: { g2: { text: "2", kind: GREEN } },
            out: ["2"],
            note: "For a dict, len() counts keys. Two keys, so the answer is 2.",
         },
      ],
   },
   /* 4 Shared interface without inheritance ---------------------------------- */
   {
      eyebrow: "Shared interface",
      title: "Unrelated classes can offer the same method",
      dense: true,
      consoleRows: 4,
      lines: [
         "class ⟦n0:Email⟧:",
         '    def send(self): print(⟦q0:"Sending an email."⟧)',
         "class ⟦n1:SMS⟧:",
         '    def send(self): print(⟦q1:"Sending an SMS."⟧)',
         "class ⟦n2:Push⟧:",
         '    def send(self): print(⟦q2:"Sending a push notification."⟧)',
         "",
         "⟦v:notifications⟧ = [⟦cc0:Email()⟧, ⟦cc1:SMS()⟧, ⟦cc2:Push()⟧]",
         "",
         "for ⟦v2:notification⟧ in notifications:",
         "    ⟦c3:notification.send()⟧",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 3, 4, 5],
            flights: [
               { from: "n0", to: "obj_k_em", text: "class Email", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_sms", text: "class SMS", kind: GREEN, at: 0.5 },
               { from: "n2", to: "obj_k_push", text: "class Push", kind: VIOLET, at: 0.8 },
            ],
            heaps: [
               K("k_em", "class Email", "parent", [M("em_send", "send", BLUE)]),
               K("k_sms", "class SMS", "child", [M("sms_send", "send", GREEN)]),
               K("k_push", "class Push", "other", [M("push_send", "send", VIOLET)]),
            ],
            note: "Three classes with no shared parent. Each one simply defines its own send().",
         },
         {
            label: "List",
            active: [7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.5 },
               { from: "cc2", to: "obj_o3", text: "new object", kind: "ref", at: 0.8 },
               { from: "obj_o3", to: "m_notifications", text: "[3 objects]", kind: "ref", at: 1.8 },
            ],
            heaps: [OBJ("o1", "Email #1", []), OBJ("o2", "SMS #1", []), OBJ("o3", "Push #1", [])],
            globals: [N("m_notifications", "notifications", "[3 objects]")],
            note: "One object of each class goes into a single list.",
         },
         {
            label: "Email",
            active: [9, 10, 1],
            hot: ["c3"],
            flights: [
               { from: "obj_o1", to: "m_item", text: "<Email #1>", kind: "ref", at: 0.2 },
               { from: "c3", to: "em_send", text: "send", kind: BLUE, at: 0.9 },
               { from: "q0", to: "cons", text: "Sending an email.", kind: "ret", at: 1.8 },
            ],
            globals: [N("m_item", "notification", "<Email #1>")],
            out: ["Sending an email."],
            note: "The loop variable points at the first object. Python finds send() on its class and runs Email's version.",
         },
         {
            label: "SMS",
            active: [9, 10, 3],
            hot: ["c3"],
            flights: [
               { from: "obj_o2", to: "m_item", text: "<SMS #1>", kind: "ref", at: 0.2 },
               { from: "c3", to: "sms_send", text: "send", kind: GREEN, at: 0.9 },
               { from: "q1", to: "cons", text: "Sending an SMS.", kind: "ret", at: 1.8 },
            ],
            globals: [N("m_item", "notification", "<SMS #1>")],
            out: ["Sending an SMS."],
            note: "Same line of code, different object, so a different send() runs.",
         },
         {
            label: "Push",
            active: [9, 10, 5],
            hot: ["c3"],
            flights: [
               { from: "obj_o3", to: "m_item", text: "<Push #1>", kind: "ref", at: 0.2 },
               { from: "c3", to: "push_send", text: "send", kind: VIOLET, at: 0.9 },
               { from: "q2", to: "cons", text: "Sending a push notification.", kind: "ret", at: 1.8 },
            ],
            globals: [N("m_item", "notification", "<Push #1>")],
            out: ["Sending a push notification."],
            note: "The loop never checks which kind of object it holds. It just calls send().",
         },
      ],
   },
   /* 5 Method overriding ------------------------------------------------------ */
   {
      eyebrow: "Method overriding",
      title: "Children replace a shared method, one call fits all",
      dense: true,
      consoleRows: 3,
      lines: [
         "class ⟦n0:Employee⟧:",
         '    def work(self): print(⟦q0:"Employee is working."⟧)',
         "class ⟦n1:Developer⟧(Employee):",
         '    def work(self): print(⟦q1:"Developer is writing code."⟧)',
         "class ⟦n2:Designer⟧(Employee):",
         '    def work(self): print(⟦q2:"Designer is creating a design."⟧)',
         "",
         "⟦v:employees⟧ = [⟦cc0:Developer()⟧, ⟦cc1:Designer()⟧]",
         "",
         "for ⟦v2:employee⟧ in employees:",
         "    ⟦c0:employee.work()⟧",
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 3, 4, 5],
            flights: [
               { from: "n0", to: "obj_k_emp", text: "class Employee", kind: BLUE, at: 0.2 },
               { from: "n1", to: "obj_k_dev", text: "class Developer", kind: GREEN, at: 0.5 },
               { from: "n2", to: "obj_k_des", text: "class Designer", kind: VIOLET, at: 0.8 },
            ],
            heaps: [
               K("k_emp", "class Employee", "parent", [M("emp_work", "work", BLUE)]),
               K("k_dev", "class Developer(Employee)", "child", [M("dev_work", "work", GREEN)]),
               K("k_des", "class Designer(Employee)", "other", [M("des_work", "work", VIOLET)]),
            ],
            note: "Employee defines work(). Both children override it with their own version, keeping the same name.",
         },
         {
            label: "List",
            active: [7],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.5 },
               { from: "obj_o2", to: "m_employees", text: "[2 objects]", kind: "ref", at: 1.5 },
            ],
            heaps: [OBJ("o1", "Developer #1", []), OBJ("o2", "Designer #1", [])],
            globals: [N("m_employees", "employees", "[2 objects]")],
            note: "A list holds a Developer and a Designer. Both are kinds of Employee.",
         },
         {
            label: "Developer",
            active: [9, 10, 3],
            hot: ["c0"],
            flights: [
               { from: "obj_o1", to: "m_employee", text: "<Developer #1>", kind: "ref", at: 0.2 },
               { from: "c0", to: "dev_work", text: "work", kind: GREEN, at: 0.9 },
               { from: "c0", to: "emp_work", text: "skipped", kind: "no", at: 1.4 },
               { from: "q1", to: "cons", text: "Developer is writing code.", kind: "ret", at: 2.2 },
            ],
            globals: [N("m_employee", "employee", "<Developer #1>")],
            out: ["Developer is writing code."],
            note: "Python finds Developer's own work() first, so Employee's version is skipped.",
         },
         {
            label: "Designer",
            active: [9, 10, 5],
            hot: ["c0"],
            flights: [
               { from: "obj_o2", to: "m_employee", text: "<Designer #1>", kind: "ref", at: 0.2 },
               { from: "c0", to: "des_work", text: "work", kind: VIOLET, at: 0.9 },
               { from: "c0", to: "emp_work", text: "skipped", kind: "no", at: 1.4 },
               { from: "q2", to: "cons", text: "Designer is creating a design.", kind: "ret", at: 2.2 },
            ],
            globals: [N("m_employee", "employee", "<Designer #1>")],
            out: ["Designer is creating a design."],
            note: "The same call on a different child runs a different work(). Each subclass supplies its own behavior.",
         },
      ],
   },
   /* 6 Duck typing ------------------------------------------------------------ */
   {
      eyebrow: "Duck typing",
      title: "If it has write(), the function can use it",
      consoleRows: 3,
      lines: [
         "class ⟦n0:FileLogger⟧:",
         "    def write(self, ⟦p2:message⟧):",
         '        print(f"File: {⟦u1:message⟧}")',
         "",
         "class ⟦n1:DatabaseLogger⟧:",
         "    def write(self, ⟦p3:message⟧):",
         '        print(f"Database: {⟦u2:message⟧}")',
         "",
         "def save_log(⟦p0:logger⟧, ⟦p1:message⟧):",
         "    ⟦c1:logger.write⟧(⟦u0:message⟧)",
         "",
         'save_log(⟦cc0:FileLogger()⟧, ⟦a1:"User logged in"⟧)',
         'save_log(⟦cc1:DatabaseLogger()⟧, ⟦a2:"User logged in"⟧)',
      ],
      steps: [
         {
            label: "Define",
            active: [0, 1, 2, 4, 5, 6],
            flights: [
               { from: "n0", to: "obj_k_file", text: "class FileLogger", kind: GREEN, at: 0.2 },
               { from: "n1", to: "obj_k_db", text: "class DatabaseLogger", kind: VIOLET, at: 0.5 },
            ],
            heaps: [
               K("k_file", "class FileLogger", "child", [M("fl_write", "write", GREEN)]),
               K("k_db", "class DatabaseLogger", "other", [M("db_write", "write", VIOLET)]),
            ],
            note: "Two classes with no shared parent. They only have one thing in common: both define write().",
         },
         {
            label: "Call 1",
            active: [11, 8],
            flights: [
               { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
               { from: "obj_o1", to: "p0", text: "<FileLogger #1>", kind: "ref", at: 1.0 },
               { from: "a1", to: "p1", text: '"User logged in"', kind: GREEN, at: 1.3 },
            ],
            swap: {
               p0: { text: "<FileLogger #1>", kind: "ref", cap: "logger" },
               p1: { text: '"User logged in"', kind: GREEN, cap: "message" },
            },
            heaps: [OBJ("o1", "FileLogger #1", [])],
            note: "save_log() receives a FileLogger object and a message. It does not know or care about the class.",
         },
         {
            label: "Check",
            active: [9, 1],
            flights: [
               { from: "c1", to: "fl_write", text: "has write()", kind: GREEN, at: 0.3 },
               { from: "p1", to: "u0", text: '"User logged in"', kind: GREEN, at: 1.0 },
               { from: "u0", to: "p2", text: '"User logged in"', kind: GREEN, at: 1.9 },
            ],
            swap: {
               u0: { text: '"User logged in"', kind: GREEN },
               p2: { text: '"User logged in"', kind: GREEN, cap: "message" },
            },
            note: "save_log() just calls write(). This object has one, so the call works. No class check anywhere.",
         },
         {
            label: "Print",
            active: [2],
            flights: [
               { from: "p2", to: "u1", text: '"User logged in"', kind: GREEN, at: 0.2 },
               { from: "u1", to: "cons", text: "File: User logged in", kind: "ret", at: 1.1 },
            ],
            swap: { u1: { text: '"User logged in"', kind: GREEN } },
            out: ["File: User logged in"],
            note: "FileLogger's write() prints with its own File: prefix.",
         },
         {
            label: "Call 2",
            active: [12, 8],
            drop: ["p0", "p1", "u0", "p2", "u1"],
            flights: [
               { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
               { from: "obj_o2", to: "p0", text: "<DatabaseLogger #1>", kind: "ref", at: 1.0 },
               { from: "a2", to: "p1", text: '"User logged in"', kind: GREEN, at: 1.3 },
            ],
            swap: {
               p0: { text: "<DatabaseLogger #1>", kind: "ref", cap: "logger" },
               p1: { text: '"User logged in"', kind: GREEN, cap: "message" },
            },
            heaps: [OBJ("o2", "DatabaseLogger #1", [])],
            note: "The same function now receives an object of a completely different class.",
         },
         {
            label: "Check",
            active: [9, 5],
            flights: [
               { from: "c1", to: "db_write", text: "has write()", kind: VIOLET, at: 0.3 },
               { from: "p1", to: "u0", text: '"User logged in"', kind: GREEN, at: 1.0 },
               { from: "u0", to: "p3", text: '"User logged in"', kind: GREEN, at: 1.9 },
            ],
            swap: {
               u0: { text: '"User logged in"', kind: GREEN },
               p3: { text: '"User logged in"', kind: GREEN, cap: "message" },
            },
            note: "The line inside save_log() has not changed, yet it now reaches DatabaseLogger's write().",
         },
         {
            label: "Print",
            active: [6],
            flights: [
               { from: "p3", to: "u2", text: '"User logged in"', kind: GREEN, at: 0.2 },
               { from: "u2", to: "cons", text: "Database: User logged in", kind: "ret", at: 1.1 },
            ],
            swap: { u2: { text: '"User logged in"', kind: GREEN } },
            out: ["Database: User logged in"],
            note: "Same function, same call, different behavior. That is duck typing at work.",
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
/* Step 1: one symbol, a different behavior for each type                      */
/* -------------------------------------------------------------------------- */

const LANES: {
   tone: Tone;
   type: string;
   name: string;
   sub: string;
   verb: string;
   a: string;
   b: string;
   res: { text: string; tone: Tone }[];
}[] = [
      { tone: "parent", type: "int", name: "Numbers", sub: "adds the values", verb: "adds", a: "10", b: "20", res: [{ text: "30", tone: "own" }] },
      {
         tone: "child",
         type: "str",
         name: "Strings",
         sub: "joins the text",
         verb: "joins",
         a: '"Stack"',
         b: '"Blueprint"',
         res: [
            { text: '"Stack', tone: "parent" },
            { text: 'Blueprint"', tone: "child" },
         ],
      },
      {
         tone: "other",
         type: "list",
         name: "Lists",
         sub: "merges the items",
         verb: "concatenates",
         a: "[1, 2]",
         b: "[3, 4]",
         res: [
            { text: "[1, 2,", tone: "parent" },
            { text: " 3, 4]", tone: "child" },
         ],
      },
   ];

function OperatorScene({ t }: { t: number }) {
   return (
      <Backdrop>
         {LANES.map((l, i) => {
            const t0 = 0.4 + i * 3.4;
            const local = t - t0;
            const started = local >= -0.2;
            const merged = local >= 0.9;
            const done = local >= 1.9;
            const pulse = local >= 0.5 && local < 1.6;
            return (
               <motion.div
                  key={l.name}
                  animate={{ opacity: started ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-x-0"
                  style={{ top: 14 + i * 144, height: 128 }}
               >
                  <div className="absolute" style={{ left: 20, top: 26, width: 150 }}>
                     <Pill tone={l.tone}>{l.type}</Pill>
                     <p className="mt-1.5 text-[17px] font-medium leading-5 text-white">{l.name}</p>
                     <p className="mt-0.5 text-[12px] leading-4 text-slate-400">{l.sub}</p>
                  </div>

                  <motion.div
                     animate={{ x: merged ? 6 : 0, opacity: done ? 0.5 : 1 }}
                     className={`absolute flex items-center justify-center rounded-2xl border bg-slate-900 font-mono text-[17px] text-white ${TONE.parent.box}`}
                     style={{ left: 184, top: 32, width: 130, height: 64 }}
                  >
                     {l.a}
                  </motion.div>

                  <div className="absolute flex items-center justify-center rounded-full border-2 border-white/40 bg-slate-900" style={{ left: 330, top: 43, width: 42, height: 42 }}>
                     <Plus className="size-5 text-white" />
                  </div>
                  {pulse && (
                     <motion.span
                        key="pulse"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.9 }}
                        className="absolute rounded-full border-2"
                        style={{ left: 330, top: 43, width: 42, height: 42, borderColor: TONE[l.tone].hex }}
                     />
                  )}
                  <p className="absolute text-center text-[10px] text-slate-500" style={{ left: 316, top: 92, width: 70 }}>
                     the same +
                  </p>

                  <motion.div
                     animate={{ x: merged ? -6 : 0, opacity: done ? 0.5 : 1 }}
                     className={`absolute flex items-center justify-center rounded-2xl border bg-slate-900 font-mono text-[17px] text-white ${TONE.child.box}`}
                     style={{ left: 388, top: 32, width: 130, height: 64 }}
                  >
                     {l.b}
                  </motion.div>

                  <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={128} viewBox={`0 0 ${DESIGN_W} 128`}>
                     <line x1={532} y1={64} x2={566} y2={64} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
                     <Head at={[578, 64]} deg={0} color="rgba(148,163,184,0.85)" />
                  </svg>

                  <Fly t={local} start={1.0} dur={0.8} from={[200, 54]} to={[606, 54]} kind="ref" text={l.a} />
                  <Fly t={local} start={1.15} dur={0.8} from={[404, 54]} to={[690, 54]} kind="val" text={l.b} />

                  <motion.div
                     animate={{ opacity: done ? 1 : 0.3, scale: done ? 1 : 0.96 }}
                     className={`absolute flex items-center justify-center rounded-2xl border bg-slate-900 font-mono text-[17px] ${done ? TONE.own.box : "border-white/15"}`}
                     style={{ left: 586, top: 32, width: 198, height: 64 }}
                  >
                     {done && (
                        <span className="whitespace-pre">
                           {l.res.map((seg) => (
                              <span key={seg.text} className={TONE[seg.tone].text}>
                                 {seg.text}
                              </span>
                           ))}
                        </span>
                     )}
                  </motion.div>
                  {done && (
                     <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute" style={{ left: 586, top: 6 }}>
                        <Pill tone="own">{l.verb}</Pill>
                     </motion.span>
                  )}
               </motion.div>
            );
         })}
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 2: one function, three kinds of counting                               */
/* -------------------------------------------------------------------------- */

type Tile = { k: string; v?: string };
const LEN_INPUTS: {
   type: string;
   tone: Tone;
   literal: string;
   tiles: Tile[];
   tileW: number;
   tileH: number;
   what: string;
   count: number;
}[] = [
      { type: "str", tone: "child", literal: '"Python"', tiles: ["P", "y", "t", "h", "o", "n"].map((k) => ({ k })), tileW: 36, tileH: 44, what: "characters", count: 6 },
      { type: "list", tone: "other", literal: "[10, 20, 30]", tiles: ["10", "20", "30"].map((k) => ({ k })), tileW: 60, tileH: 44, what: "items", count: 3 },
      {
         type: "dict",
         tone: "own",
         literal: '{"name": ..., "role": ...}',
         tiles: [
            { k: "name", v: "Maya" },
            { k: "role", v: "Developer" },
         ],
         tileW: 118,
         tileH: 52,
         what: "keys",
         count: 2,
      },
   ];
const LEN_SPAN = 4.0;

function LenScene({ t }: { t: number }) {
   const idx = t < 0.4 ? -1 : Math.min(2, Math.floor((t - 0.4) / LEN_SPAN));
   const local = t - 0.4 - Math.max(idx, 0) * LEN_SPAN;
   const cur = LEN_INPUTS[Math.max(idx, 0)];
   const n = cur.tiles.length;
   const lit = idx < 0 || local < 0.9 ? 0 : Math.min(n, Math.floor((local - 0.9) / 0.32) + 1);
   const flyAt = 0.9 + n * 0.32 + 0.1;
   const showRes = idx >= 0 && local >= flyAt + 0.8;
   const tone = TONE[cur.tone];
   const rowW = n * cur.tileW + (n - 1) * 6;
   const start = (272 - rowW) / 2;

   return (
      <Backdrop>
         <div className="absolute flex gap-2" style={{ left: 24, top: 18 }}>
            {LEN_INPUTS.map((inp, i) => (
               <span key={inp.type} style={{ opacity: idx === i ? 1 : 0.4 }}>
                  <Pill tone={inp.tone}>{inp.type}</Pill>
               </span>
            ))}
         </div>

         {/* The input object, drawn as the pieces len() will count */}
         <motion.div
            key={`in-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: idx >= 0 ? 1 : 0, y: 0 }}
            className={`absolute rounded-2xl border bg-slate-900 ${tone.box}`}
            style={{ left: 24, top: 62, width: 272, height: 190 }}
         >
            <span className="absolute" style={{ left: 16, top: 16 }}>
               <Chip kind={tone.chip}>{cur.literal}</Chip>
            </span>
            {cur.tiles.map((tile, k) => (
               <motion.div
                  key={`${idx}-${k}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + k * 0.06 }}
                  className={`absolute flex flex-col items-center justify-center rounded-lg border font-mono transition-colors duration-200 ${k < lit ? `${tone.box} bg-white/10 text-white` : "border-white/20 bg-slate-950 text-slate-300"
                     }`}
                  style={{ left: start + k * (cur.tileW + 6), top: 74, width: cur.tileW, height: cur.tileH }}
               >
                  <span className={tile.v ? "text-[14px] font-semibold" : "text-[16px]"}>{tile.k}</span>
                  {tile.v && <span className="text-[10px] text-slate-500">{tile.v}</span>}
               </motion.div>
            ))}
            <p className="absolute text-[12px] text-slate-400" style={{ left: 16, top: 146, right: 16 }}>
               one tile for each {cur.what.replace(/s$/, "")}
            </p>
         </motion.div>

         <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
            <line x1={298} y1={157} x2={320} y2={157} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
            <Head at={[330, 157]} deg={0} color="rgba(148,163,184,0.85)" />
            <line x1={472} y1={157} x2={494} y2={157} stroke={showRes ? tone.hex : "rgba(148,163,184,0.5)"} strokeWidth={3} />
            <Head at={[504, 157]} deg={0} color={showRes ? tone.hex : "rgba(148,163,184,0.85)"} />
         </svg>

         {/* The one function */}
         <div className="absolute rounded-2xl border border-white/25 bg-slate-900" style={{ left: 330, top: 62, width: 140, height: 190 }}>
            <motion.span animate={{ rotate: lit * 60 }} transition={{ duration: 0.25 }} className="absolute" style={{ left: 54, top: 16 }}>
               <Settings className="size-8 text-slate-300" />
            </motion.span>
            <p className="absolute inset-x-0 text-center font-mono text-[20px] font-semibold text-white" style={{ top: 64 }}>
               len()
            </p>
            <div className="absolute flex items-center justify-center rounded-xl border border-white/20 bg-slate-950" style={{ left: 22, top: 106, width: 96, height: 56 }}>
               <motion.span key={lit} initial={{ scale: 1.3, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[30px] font-semibold text-amber">
                  {lit}
               </motion.span>
            </div>
            <p className="absolute inset-x-0 text-center text-[10px] text-slate-500" style={{ top: 168 }}>
               counting
            </p>
         </div>

         <Fly t={local} start={flyAt} dur={0.7} from={[396, 140]} to={[580, 150]} kind={tone.chip} text={String(cur.count)} />

         {/* The result */}
         <div className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 504, top: 62, width: 272, height: 190 }}>
            <p className="absolute text-[11px] tracking-wider text-slate-500" style={{ left: 16, top: 14 }}>
               result
            </p>
            {showRes && (
               <motion.div key={`res-${idx}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-x-0 text-center" style={{ top: 44 }}>
                  <p className={`font-mono text-[64px] font-semibold leading-[72px] ${tone.text}`}>{cur.count}</p>
                  <p className="text-[13px] text-slate-300">it counted {cur.what}</p>
               </motion.div>
            )}
         </div>

         {/* The three answers side by side */}
         {LEN_INPUTS.map((inp, i) => {
            const finished = idx > i || (idx === i && local >= flyAt + 0.8);
            const active = idx === i;
            return (
               <div
                  key={inp.type}
                  className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${active ? TONE[inp.tone].box : "border-white/15"}`}
                  style={{ left: 24 + i * 256, top: 280, width: 240, height: 150, opacity: idx >= i ? 1 : 0.4 }}
               >
                  <span className="absolute" style={{ left: 14, top: 14 }}>
                     <Pill tone={inp.tone}>{inp.type}</Pill>
                  </span>
                  <p className="absolute text-[14px] text-white" style={{ left: 14, top: 44 }}>
                     counts {inp.what}
                  </p>
                  <p className="absolute font-mono text-[11px] text-slate-500" style={{ left: 14, top: 68 }}>
                     {inp.literal}
                  </p>
                  {finished && (
                     <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`absolute font-mono text-[40px] font-semibold ${TONE[inp.tone].text}`} style={{ right: 16, bottom: 12 }}>
                        {inp.count}
                     </motion.p>
                  )}
               </div>
            );
         })}
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 3: one method name, a different behavior for each class                */
/* -------------------------------------------------------------------------- */

const FAMILY: { name: string; icon: typeof Users; tone: Tone; line: string }[] = [
   { name: "Developer", icon: Laptop, tone: "child", line: "Developer is writing code." },
   { name: "Designer", icon: PenTool, tone: "other", line: "Designer is creating a design." },
   { name: "DataAnalyst", icon: Database, tone: "own", line: "Data analyst is studying data." },
];
const FAM_X = [200, 384, 568];
const FAM_W = 170;
const FAM_START = 1.8;
const FAM_SPAN = 2.0;

function FamilyScene({ t }: { t: number }) {
   const stage = t < FAM_START ? -1 : Math.min(2, Math.floor((t - FAM_START) / FAM_SPAN));
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   const tokenX = stage < 0 ? 150 : FAM_X[stage] + FAM_W / 2 - 24;
   const tokenY = stage < 0 ? 196 : 136;
   return (
      <Backdrop>
         <p className="absolute text-[14px] leading-5 text-slate-300" style={{ left: 16, top: 18, width: 270 }}>
            One method name, a different behavior for each class.
         </p>

         <motion.div
            animate={fade(t >= 0.3)}
            className={`absolute rounded-2xl border bg-slate-900 ${TONE.parent.box}`}
            style={{ left: 301, top: 14, width: 336, height: 84 }}
         >
            <div className="absolute flex items-center gap-2.5" style={{ left: 16, top: 12 }}>
               <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
                  <Users className="size-[18px] text-sky-300" />
               </span>
               <span className="text-[17px] font-medium text-white">Employee</span>
            </div>
            <span className="absolute" style={{ left: 16, top: 54 }}>
               <Chip kind="ref">work()</Chip>
            </span>
            <span className="absolute text-[11px] text-slate-500" style={{ left: 84, top: 56 }}>
               the shared version
            </span>
         </motion.div>

         <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
            {FAMILY.map((f, i) => {
               const cx = FAM_X[i] + FAM_W / 2;
               return (
                  <g key={f.name}>
                     <motion.path
                        d={`M 469 98 L 469 124 L ${cx} 124 L ${cx} 142`}
                        fill="none"
                        stroke="rgba(148,163,184,0.45)"
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: t >= 0.6 ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                     />
                     {t >= 1.0 && <Head at={[cx, 150]} deg={90} color="rgba(148,163,184,0.7)" />}
                  </g>
               );
            })}
         </svg>

         <motion.div
            animate={fade(t >= 1.0)}
            className="absolute rounded-2xl border border-white/20 bg-slate-900"
            style={{ left: 16, top: 150, width: 168, height: 112 }}
         >
            <span className="absolute flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/5" style={{ left: 14, top: 14 }}>
               <Repeat className="size-5 text-slate-200" />
            </span>
            <p className="absolute text-[14px] leading-5 text-white" style={{ left: 14, top: 58, width: 140 }}>
               For each employee, call work()
            </p>
         </motion.div>

         {FAMILY.map((f, i) => {
            const Icon = f.icon;
            const local = t - FAM_START - i * FAM_SPAN;
            const processed = local >= 0.6;
            const active = processed && stage === i;
            const tone = TONE[f.tone];
            return (
               <motion.div
                  key={f.name}
                  animate={fade(t >= 0.8 + i * 0.15)}
                  className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${active ? tone.box : processed ? "border-white/35" : "border-white/15"}`}
                  style={{ left: FAM_X[i], top: 150, width: FAM_W, height: 112 }}
               >
                  <div className="absolute flex items-center gap-2.5" style={{ left: 12, top: 12 }}>
                     <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                        <Icon className="size-[18px]" />
                     </span>
                     <span className="font-mono text-[13px] font-semibold text-white">{f.name}</span>
                  </div>
                  <span className="absolute" style={{ left: 12, top: 58 }}>
                     <Chip kind={tone.chip}>work()</Chip>
                  </span>
                  <span className="absolute text-[11px] text-slate-500" style={{ left: 12, top: 84 }}>
                     its own version
                  </span>
                  {active && (
                     <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${tone.pill}`} style={{ right: 10, bottom: 10 }}>
                        runs
                     </motion.span>
                  )}
               </motion.div>
            );
         })}

         {/* The call travels along the row of objects */}
         <motion.div
            initial={{ opacity: 0, x: 150, y: 196 }}
            animate={{ opacity: t >= 1.4 ? 1 : 0, x: tokenX, y: tokenY }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="pointer-events-none absolute left-0 top-0 z-20"
         >
            <span className={`${chipBase} shadow-[0_0_16px_rgba(255,255,255,0.35)] ${chipClass.ret}`}>work()</span>
         </motion.div>

         <div className="absolute rounded-2xl border border-white/20 bg-slate-950" style={{ left: 200, top: 288, width: 538, height: 142 }}>
            <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 12 }}>
               output
            </p>
            <div className="absolute flex flex-col gap-2" style={{ left: 16, top: 36 }}>
               {FAMILY.map((f, i) =>
                  t - FAM_START - i * FAM_SPAN >= 1.1 ? (
                     <motion.p key={f.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[13px] leading-5 ${TONE[f.tone].text}`}>
                        {f.line}
                     </motion.p>
                  ) : null,
               )}
            </div>
         </div>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 4: duck typing, anything with write() plugs in                         */
/* -------------------------------------------------------------------------- */

const CANDS: { name: string; icon: typeof Users; tone: Tone; has: boolean; line: string }[] = [
   { name: "FileLogger", icon: FileText, tone: "child", has: true, line: "File: User logged in" },
   { name: "DatabaseLogger", icon: Database, tone: "other", has: true, line: "Database: User logged in" },
   { name: "Counter", icon: Calculator, tone: "bad", has: false, line: "AttributeError: no write()" },
];
const DUCK_SPAN = 3.4;

function DuckScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   return (
      <Backdrop>
         {CANDS.map((c, i) => {
            const Icon = c.icon;
            const t0 = 0.6 + i * DUCK_SPAN;
            const local = t - t0;
            const active = local >= 0 && local < DUCK_SPAN;
            const verdict = local >= 1.8;
            const tone = TONE[c.tone];
            const cy = 16 + i * 124 + 56;
            return (
               <div key={c.name}>
                  <motion.div
                     animate={{ ...fade(t >= 0.1 + i * 0.1), opacity: t >= 0.1 + i * 0.1 ? (local >= 0 ? 1 : 0.6) : 0 }}
                     className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${active ? tone.box : "border-white/20"}`}
                     style={{ left: 24, top: 16 + i * 124, width: 240, height: 112 }}
                  >
                     <div className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
                        <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                           <Icon className="size-[18px]" />
                        </span>
                        <span className="font-mono text-[14px] font-semibold text-white">{c.name}</span>
                     </div>
                     <span className="absolute" style={{ left: 14, top: 56 }}>
                        <Chip kind={c.has ? tone.chip : "ret"}>{c.has ? "write()" : "count()"}</Chip>
                     </span>
                     <span className="absolute text-[11px] text-slate-500" style={{ left: 14, top: 84 }}>
                        no shared parent
                     </span>
                     {verdict && (
                        <motion.span
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className={`absolute flex items-center gap-1 rounded-full border px-2 py-px text-[10px] ${c.has ? TONE.child.pill : TONE.bad.pill}`}
                           style={{ right: 10, bottom: 10 }}
                        >
                           {c.has ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                           {c.has ? "works" : "fails"}
                        </motion.span>
                     )}
                  </motion.div>
                  <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
                     {active && local >= 0.3 && (
                        <>
                           <motion.path
                              d={`M 266 ${cy} L 342 ${cy} L 342 122 L 440 122`}
                              fill="none"
                              stroke={tone.hex}
                              strokeWidth={3}
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.6 }}
                           />
                           {local >= 0.8 && <Head at={[448, 122]} deg={0} color={tone.hex} />}
                        </>
                     )}
                  </svg>
                  {c.has && <Fly t={t - t0} start={0.9} dur={0.8} from={[38, cy - 10]} to={[560, 112]} kind={tone.chip} text="write()" />}
               </div>
            );
         })}

         {/* The function that only asks: can you write()? */}
         <motion.div
            animate={fade(t >= 0.3)}
            className={`absolute rounded-2xl border bg-slate-900 ${TONE.parent.box}`}
            style={{ left: 432, top: 16, width: 344, height: 214 }}
         >
            <p className="absolute font-mono text-[14px] font-semibold text-white" style={{ left: 18, top: 16 }}>
               save_log(logger, message)
            </p>
            <p className="absolute text-[12px] text-slate-400" style={{ left: 18, top: 42 }}>
               It never checks the class
            </p>
            {CANDS.map((c, i) => {
               const local = t - (0.6 + i * DUCK_SPAN);
               const here = local >= 1.8 && local < DUCK_SPAN;
               if (!here) return null;
               return (
                  <motion.div
                     key={c.name}
                     initial={{ opacity: 0, x: c.has ? 0 : -6 }}
                     animate={c.has ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                     transition={{ duration: 0.5 }}
                     className={`absolute flex items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] ${c.has ? `${TONE.child.box} bg-mint/5 text-mint` : `${TONE.bad.box} bg-rose-400/5 text-rose-300`}`}
                     style={{ left: 18, top: 76, width: 308, height: 60 }}
                  >
                     {c.has ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                     {c.has ? `${c.name} is plugged in` : "no write() to call"}
                  </motion.div>
               );
            })}
            {!CANDS.some((_, i) => {
               const local = t - (0.6 + i * DUCK_SPAN);
               return local >= 1.8 && local < DUCK_SPAN;
            }) && (
                  <div className="absolute flex items-center justify-center rounded-xl border-2 border-dashed border-white/25 text-[13px] text-slate-400" style={{ left: 18, top: 76, width: 308, height: 60 }}>
                     needs an object with write()
                  </div>
               )}
            <span className="absolute text-[11px] text-slate-500" style={{ left: 18, top: 156 }}>
               message
            </span>
            <span className="absolute" style={{ left: 18, top: 176 }}>
               <Chip kind="val">"User logged in"</Chip>
            </span>
         </motion.div>

         <div className="absolute rounded-2xl border border-white/20 bg-slate-950" style={{ left: 432, top: 246, width: 344, height: 130 }}>
            <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 12 }}>
               output
            </p>
            <div className="absolute flex flex-col gap-2" style={{ left: 16, top: 34 }}>
               {CANDS.map((c, i) =>
                  t - (0.6 + i * DUCK_SPAN) >= 2.1 ? (
                     <motion.p key={c.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[13px] leading-5 ${TONE[c.tone].text}`}>
                        {c.line}
                     </motion.p>
                  ) : null,
               )}
            </div>
         </div>

         <motion.div
            animate={fade(t >= 0.6 + 3 * DUCK_SPAN)}
            className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
            style={{ left: 24, top: 394, width: 752, height: 44 }}
         >
            <Shield className="size-5 shrink-0 text-sky-300" />
            <p className="text-[13px] text-white">Any object with a write() method works. No shared parent is needed.</p>
         </motion.div>
      </Backdrop>
   );
}

/* -------------------------------------------------------------------------- */
/* Step 5: in practice, ask the object instead of checking its type            */
/* -------------------------------------------------------------------------- */

const PAYS: { label: string; icon: typeof Users; tone: Tone; line: string }[] = [
   { label: "Card", icon: CreditCard, tone: "parent", line: "Charging $120 to the credit card." },
   { label: "PayPal", icon: Wallet, tone: "child", line: "Sending $80 through PayPal." },
   { label: "Gift card", icon: Gift, tone: "other", line: "Using $25 from the gift card." },
   { label: "Bank", icon: Landmark, tone: "own", line: "Transferring $60 from the bank." },
];
const CHAIN: { pill: string; text: string }[] = [
   { pill: "if", text: "Is it a credit card?" },
   { pill: "elif", text: "Is it PayPal?" },
   { pill: "elif", text: "Is it a gift card?" },
   { pill: "elif", text: "Is it a bank transfer?" },
];
const PAY_AT = [2.0, 3.9, 5.8, 8.6];

function PracticeScene({ t }: { t: number }) {
   const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
   return (
      <Backdrop>
         {/* Without polymorphism */}
         <motion.div animate={fade(t >= 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 16, top: 16, width: 368, height: 418 }}>
            <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
               Check every type
            </p>
            <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
               One long chain inside checkout()
            </p>
         </motion.div>
         {CHAIN.map((r, i) => {
            const at = i < 3 ? 0.6 + i * 0.6 : 7.8;
            const added = i === 3;
            return (
               <motion.div
                  key={r.text}
                  animate={fade(t >= at)}
                  className={`absolute flex items-center gap-3 rounded-xl border bg-slate-950 px-3 ${added ? TONE.bad.box : "border-white/20"}`}
                  style={{ left: 36, top: 84 + i * 58, width: 328, height: 48 }}
               >
                  <span className={`inline-block rounded-md border px-2 py-px font-mono text-[11px] ${added ? TONE.bad.pill : "border-white/20 bg-white/5 text-slate-300"}`}>{r.pill}</span>
                  <span className="text-[13px] text-slate-200">{r.text}</span>
                  {added && (
                     <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute text-[10px] text-rose-300" style={{ right: 12 }}>
                        edit again
                     </motion.span>
                  )}
               </motion.div>
            );
         })}
         <motion.p animate={{ opacity: t >= 8.6 ? 1 : 0 }} className="absolute flex items-center gap-2 text-[13px] leading-5 text-slate-300" style={{ left: 36, top: 330, width: 328 }}>
            <XCircle className="size-5 shrink-0 text-rose-300" /> Every new payment type means editing checkout() again.
         </motion.p>

         {/* With polymorphism */}
         <motion.div animate={fade(t >= 0.4)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.child.box}`} style={{ left: 416, top: 16, width: 368, height: 418 }}>
            <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
               Ask the object
            </p>
            <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
               Each payment knows how to pay()
            </p>
         </motion.div>
         <motion.div animate={fade(t >= 0.8)} className="absolute flex items-center justify-between rounded-xl border border-white/25 bg-slate-950 px-4" style={{ left: 436, top: 84, width: 328, height: 56 }}>
            <span className="font-mono text-[13px] text-white">checkout(payment, amount)</span>
            <Chip kind="ret">pay()</Chip>
         </motion.div>
         {PAYS.map((p, i) => {
            const Icon = p.icon;
            const at = i < 3 ? 1.0 + i * 0.15 : 7.8;
            const local = t - PAY_AT[i];
            const active = local >= 0.8 && local < 2.0;
            const tone = TONE[p.tone];
            return (
               <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={fade(t >= at)}
                  className={`absolute rounded-xl border bg-slate-950 transition-colors duration-300 ${active ? tone.box : "border-white/20"}`}
                  style={{ left: 436 + i * 84, top: 196, width: 78, height: 98 }}
               >
                  <span className={`absolute flex size-8 items-center justify-center rounded-lg border ${tone.pill}`} style={{ left: 23, top: 10 }}>
                     <Icon className="size-[18px]" />
                  </span>
                  <p className="absolute inset-x-0 text-center text-[11px] text-slate-200" style={{ top: 48 }}>
                     {p.label}
                  </p>
                  <span className="absolute" style={{ left: 15, top: 68 }}>
                     <Chip kind={tone.chip}>pay()</Chip>
                  </span>
                  {i === 3 && (
                     <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-1.5 py-px text-[9px] ${TONE.child.pill}`} style={{ right: -2, top: -10 }}>
                        new
                     </motion.span>
                  )}
               </motion.div>
            );
         })}
         {PAYS.map((p, i) => (
            <Fly key={p.label} t={t} start={PAY_AT[i]} dur={0.8} from={[580, 150]} to={[436 + i * 84 + 14, 188]} kind={TONE[p.tone].chip} text="pay()" />
         ))}

         <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 436, top: 306, width: 328, height: 98 }}>
            <div className="absolute flex flex-col gap-0.5" style={{ left: 14, top: 8 }}>
               {PAYS.map((p, i) =>
                  t - PAY_AT[i] >= 1.2 ? (
                     <motion.p key={p.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[11.5px] leading-[18px] ${TONE[p.tone].text}`}>
                        {p.line}
                     </motion.p>
                  ) : null,
               )}
            </div>
         </div>
         <motion.p animate={{ opacity: t >= 9.8 ? 1 : 0 }} className={`absolute flex items-center gap-2 text-[13px] leading-5 ${TONE.child.text}`} style={{ left: 436, top: 408 }}>
            <CheckCircle2 className="size-5 shrink-0" /> Add a class. checkout() stays the same.
         </motion.p>
      </Backdrop>
   );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
   const t = useClock(step, reduce, running);
   return (
      <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
         <AnimatePresence mode="wait">
            {step === 0 && <OperatorScene key="operator" t={t} />}
            {step === 1 && <LenScene key="len" t={t} />}
            {step === 2 && <FamilyScene key="family" t={t} />}
            {step === 3 && <DuckScene key="duck" t={t} />}
            {step === 4 && <PracticeScene key="practice" t={t} />}
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
   title: "Many forms, one interface",
   steps: [
      {
         label: "One symbol",
         ms: 11000,
         note: "The + sign adds numbers, joins strings and merges lists. Python picks the behavior from the types of the values on either side.",
      },
      {
         label: "One function",
         ms: 14000,
         note: "A single function like len() works on many kinds of objects. What it counts depends on the object: characters, items or keys.",
      },
      {
         label: "One method name",
         ms: 10800,
         note: "Different classes can define a method with the same name. When children override a shared parent method, one call gives each object its own behavior.",
      },
      {
         label: "Duck typing",
         ms: 13200,
         note: "Python cares about what an object can do, not which class it comes from. Any object with a write() method works, with no shared parent needed.",
      },
      {
         label: "In practice",
         ms: 12400,
         note: "Polymorphism removes long type-checking chains. Each object knows how to do its own work, so a new type means a new class, not edits to old code.",
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

export function PolymorphismCustomAnimation() {
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