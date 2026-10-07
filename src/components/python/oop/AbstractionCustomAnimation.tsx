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
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Gift,
  HardDrive,
  Laptop,
  Layers,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Table,
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

// Class cards use four colors. An abstract method gets the amber chip, so it is
// easy to spot, and a concrete method keeps the color of its own class.
const BLUE = "ref" as Kind;
const GREEN = "val" as Kind;
const VIOLET = "fn" as Kind;
const AMBER = "cls" as Kind;
const ROSE = "no" as Kind;

const slides: Slide[] = [
  /* 1 The problem with a plain parent --------------------------------------- */
  {
    eyebrow: "A plain parent",
    title: "Nothing stops you from creating an unfinished class",
    lines: [
      "class ⟦n0:Payment⟧:",
      "    def pay(self, amount):",
      "        pass",
      "",
      "⟦v:payment⟧ = ⟦cc0:Payment()⟧",
      "⟦v2:result⟧ = ⟦c0:payment.pay⟧(⟦a0:100⟧)",
      'print(f"Payment result: {⟦u0:result⟧}")',
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2],
        flights: [{ from: "n0", to: "obj_k_pay", text: "class Payment", kind: BLUE, at: 0.2 }],
        heaps: [K("k_pay", "class Payment", "parent", [M("pay_pay", "pay", BLUE)])],
        note: "A plain parent class. pay() exists, but its body is only pass, so it does nothing.",
      },
      {
        label: "Create",
        active: [4],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_payment", text: "<Payment #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "Payment #1", [])],
        globals: [N("m_payment", "payment", "<Payment #1>")],
        note: "Python happily builds a Payment object, even though the class was only meant as a blueprint.",
      },
      {
        label: "Call",
        active: [5, 1, 2],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "pay_pay", text: "pay", kind: BLUE, at: 0.2 },
          { from: "pay_pay", to: "m_result", text: "None", kind: ROSE, at: 1.2 },
        ],
        globals: [N("m_result", "result", "None")],
        note: "pay() runs, meets only pass, and returns None. Nothing was charged.",
      },
      {
        label: "Print",
        active: [6],
        flights: [
          { from: "m_result", to: "u0", text: "None", kind: ROSE, at: 0.2 },
          { from: "u0", to: "cons", text: "Payment result: None", kind: "ret", at: 1.2 },
        ],
        swap: { u0: { text: "None", kind: ROSE } },
        out: ["Payment result: None"],
        note: "The program carries on as if a payment happened. This is the problem abstract classes solve.",
      },
    ],
  },
  /* 2 Abstract base class --------------------------------------------------- */
  {
    eyebrow: "Abstract base class",
    title: "An abstract class can only be a blueprint",
    dense: true,
    lines: [
      "from abc import ABC, abstractmethod",
      "",
      "class ⟦n0:Payment⟧(ABC):",
      "    ⟦q0:@abstractmethod⟧",
      "    def pay(self, amount):",
      "        pass",
      "",
      "class ⟦n1:CreditCardPayment⟧(Payment):",
      "    def pay(self, amount):",
      '        print(⟦q1:f"Charging ${amount} to a credit card."⟧)',
      "",
      "⟦v:card⟧ = ⟦cc0:CreditCardPayment()⟧",
      "⟦c0:card.pay⟧(⟦a0:100⟧)",
      "⟦v2:payment⟧ = ⟦cc1:Payment()⟧",
    ],
    steps: [
      {
        label: "Abstract",
        active: [2, 3, 4, 5],
        flights: [
          { from: "n0", to: "obj_k_pay", text: "class Payment", kind: BLUE, at: 0.2 },
          { from: "q0", to: "pay_abs", text: "abstract", kind: AMBER, at: 0.7 },
        ],
        heaps: [K("k_pay", "class Payment(ABC)", "parent", [M("pay_abs", "pay", AMBER, "abstract pay()")])],
        note: "Inheriting from ABC and marking pay() with @abstractmethod makes pay() a required method with no real body.",
      },
      {
        label: "Child",
        active: [7, 8, 9],
        flights: [{ from: "n1", to: "obj_k_cc", text: "class CreditCardPayment", kind: GREEN, at: 0.2 }],
        heaps: [K("k_cc", "class CreditCardPayment(Payment)", "child", [M("cc_pay", "pay", GREEN)])],
        note: "CreditCardPayment overrides pay() with a real implementation, so it satisfies the contract.",
      },
      {
        label: "Create",
        active: [11],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_card", text: "<CreditCard #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "CreditCard #1", [])],
        globals: [N("m_card", "card", "<CreditCard #1>")],
        note: "CreditCardPayment is concrete, so Python lets you create an object from it.",
      },
      {
        label: "Call",
        active: [12, 8, 9],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "cc_pay", text: "pay", kind: GREEN, at: 0.2 },
          { from: "q1", to: "cons", text: "Charging $100 to a credit card.", kind: "ret", at: 1.1 },
        ],
        out: ["Charging $100 to a credit card."],
        note: "The call reaches the child's own pay(), which does the real work.",
      },
      {
        label: "Refused",
        active: [13],
        flights: [
          { from: "cc1", to: "obj_k_pay", text: "Payment()", kind: "ref", at: 0.2 },
          { from: "obj_k_pay", to: "pay_abs", text: "still abstract", kind: ROSE, at: 1.0 },
          { from: "pay_abs", to: "cons", text: "TypeError", kind: ROSE, at: 1.8 },
        ],
        out: ["TypeError: Can't instantiate abstract class Payment"],
        note: "Payment still has an abstract method, so Python refuses to build an object. The full message adds: without an implementation for abstract method 'pay'.",
      },
    ],
  },
  /* 3 Missing implementation ------------------------------------------------ */
  {
    eyebrow: "The contract is enforced",
    title: "A child that skips the required method is blocked",
    lines: [
      "from abc import ABC, abstractmethod",
      "",
      "class ⟦n0:Payment⟧(ABC):",
      "    ⟦q0:@abstractmethod⟧",
      "    def pay(self, amount):",
      "        pass",
      "",
      "class ⟦n1:GiftCardPayment⟧(Payment):",
      "    pass",
      "",
      "⟦v:gift_card⟧ = ⟦cc0:GiftCardPayment()⟧",
    ],
    steps: [
      {
        label: "Contract",
        active: [2, 3, 4, 5],
        flights: [
          { from: "n0", to: "obj_k_pay", text: "class Payment", kind: BLUE, at: 0.2 },
          { from: "q0", to: "pay_abs", text: "abstract", kind: AMBER, at: 0.7 },
        ],
        heaps: [K("k_pay", "class Payment(ABC)", "parent", [M("pay_abs", "pay", AMBER, "abstract pay()")])],
        note: "The contract says every concrete payment class must provide pay().",
      },
      {
        label: "Forgetful",
        active: [7, 8],
        flights: [{ from: "n1", to: "obj_k_gift", text: "class GiftCardPayment", kind: GREEN, at: 0.2 }],
        heaps: [K("k_gift", "class GiftCardPayment(Payment)", "child", [])],
        note: "GiftCardPayment inherits from Payment but never defines pay(). The required method is still missing.",
      },
      {
        label: "Create",
        active: [10],
        flights: [
          { from: "cc0", to: "obj_k_gift", text: "has pay()?", kind: "ref", at: 0.2 },
          { from: "obj_k_gift", to: "pay_abs", text: "not implemented", kind: ROSE, at: 1.0 },
          { from: "pay_abs", to: "cons", text: "TypeError", kind: ROSE, at: 1.8 },
        ],
        out: ["TypeError: Can't instantiate abstract class GiftCardPayment"],
        note: "Python raises a TypeError because a required abstract method is missing. The contract is being enforced.",
      },
    ],
  },
  /* 4 One interface, many implementations ------------------------------------ */
  {
    eyebrow: "Abstraction with polymorphism",
    title: "checkout() relies on the contract, not on the class",
    dense: true,
    lines: [
      "class ⟦n0:Payment⟧(ABC):",
      "    ⟦q0:@abstractmethod⟧",
      "    def pay(self, amount): pass",
      "class ⟦n1:CreditCardPayment⟧(Payment):",
      '    def pay(self, amount): print(⟦q1:f"Charging ${amount}"⟧)',
      "class ⟦n2:PayPalPayment⟧(Payment):",
      '    def pay(self, amount): print(⟦q2:f"PayPal sent ${amount}"⟧)',
      "",
      "def checkout(⟦p0:payment_method⟧, ⟦p1:amount⟧):",
      "    ⟦c0:payment_method.pay⟧(⟦u0:amount⟧)",
      "",
      "checkout(⟦cc0:CreditCardPayment()⟧, ⟦a0:120⟧)",
      "checkout(⟦cc1:PayPalPayment()⟧, ⟦a1:80⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6],
        flights: [
          { from: "n0", to: "obj_k_pay", text: "class Payment", kind: BLUE, at: 0.2 },
          { from: "q0", to: "pay_abs", text: "abstract", kind: AMBER, at: 0.5 },
          { from: "n1", to: "obj_k_cc", text: "class CreditCardPayment", kind: GREEN, at: 0.8 },
          { from: "n2", to: "obj_k_pp", text: "class PayPalPayment", kind: VIOLET, at: 1.1 },
        ],
        heaps: [
          K("k_pay", "class Payment(ABC)", "parent", [M("pay_abs", "pay", AMBER, "abstract pay()")]),
          K("k_cc", "class CreditCardPayment(Payment)", "child", [M("cc_pay", "pay", GREEN)]),
          K("k_pp", "class PayPalPayment(Payment)", "other", [M("pp_pay", "pay", VIOLET)]),
        ],
        note: "One abstract parent and two concrete children. checkout() will rely only on the parent's contract.",
      },
      {
        label: "Call 1",
        active: [11, 8],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "p0", text: "<CreditCard #1>", kind: "ref", at: 1.0 },
          { from: "a0", to: "p1", text: "120", kind: GREEN, at: 1.3 },
        ],
        swap: {
          p0: { text: "<CreditCard #1>", kind: "ref", cap: "payment_method" },
          p1: { text: "120", kind: GREEN, cap: "amount" },
        },
        heaps: [OBJ("o1", "CreditCard #1", [])],
        note: "checkout() receives a credit card object and an amount. It does not know the class.",
      },
      {
        label: "pay()",
        active: [9, 4],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "cc_pay", text: "pay", kind: GREEN, at: 0.3 },
          { from: "p1", to: "u0", text: "120", kind: GREEN, at: 0.9 },
          { from: "q1", to: "cons", text: "Charging $120", kind: "ret", at: 1.8 },
        ],
        swap: { u0: { text: "120", kind: GREEN } },
        out: ["Charging $120"],
        note: "checkout() just calls pay(). The contract guarantees every payment object has one.",
      },
      {
        label: "Call 2",
        active: [12, 8],
        drop: ["p0", "p1", "u0"],
        flights: [
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o2", to: "p0", text: "<PayPal #1>", kind: "ref", at: 1.0 },
          { from: "a1", to: "p1", text: "80", kind: GREEN, at: 1.3 },
        ],
        swap: {
          p0: { text: "<PayPal #1>", kind: "ref", cap: "payment_method" },
          p1: { text: "80", kind: GREEN, cap: "amount" },
        },
        heaps: [OBJ("o2", "PayPal #1", [])],
        note: "The same function now receives a different kind of payment.",
      },
      {
        label: "pay()",
        active: [9, 6],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "pp_pay", text: "pay", kind: VIOLET, at: 0.3 },
          { from: "p1", to: "u0", text: "80", kind: GREEN, at: 0.9 },
          { from: "q2", to: "cons", text: "PayPal sent $80", kind: "ret", at: 1.8 },
        ],
        swap: { u0: { text: "80", kind: GREEN } },
        out: ["PayPal sent $80"],
        note: "Same line inside checkout(), different behavior. Abstraction sets the contract, polymorphism fills it in.",
      },
    ],
  },
  /* 5 Shared concrete method ------------------------------------------------- */
  {
    eyebrow: "Concrete methods",
    title: "An abstract class can also share working code",
    dense: true,
    lines: [
      "class ⟦n0:Payment⟧(ABC):",
      "    def validate_amount(self, amount): return amount > 0",
      "    ⟦q0:@abstractmethod⟧",
      "    def pay(self, amount): pass",
      "class ⟦n1:CreditCardPayment⟧(Payment):",
      "    def pay(self, ⟦p0:amount⟧):",
      "        if ⟦c0:self.validate_amount⟧(⟦u0:amount⟧):",
      '            print(⟦q1:f"Charging ${amount}"⟧)',
      '        else: print(⟦q2:"Invalid payment amount."⟧)',
      "",
      "⟦v:card⟧ = ⟦cc0:CreditCardPayment()⟧",
      "⟦c1:card.pay⟧(⟦a0:100⟧)",
      "⟦c2:card.pay⟧(⟦a1:-20⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        flights: [
          { from: "n0", to: "obj_k_pay", text: "class Payment", kind: BLUE, at: 0.2 },
          { from: "q0", to: "pay_abs", text: "abstract", kind: AMBER, at: 0.6 },
          { from: "n1", to: "obj_k_cc", text: "class CreditCardPayment", kind: GREEN, at: 1.0 },
        ],
        heaps: [
          K("k_pay", "class Payment(ABC)", "parent", [
            M("pay_validate", "validate_amount", BLUE),
            M("pay_abs", "pay", AMBER, "abstract pay()"),
          ]),
          K("k_cc", "class CreditCardPayment(Payment)", "child", [M("cc_pay", "pay", GREEN)]),
        ],
        note: "Payment mixes two kinds of method. validate_amount() is shared by every child, and pay() must be written by each one.",
      },
      {
        label: "Create",
        active: [10],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "m_card", text: "<CreditCard #1>", kind: "ref", at: 1.1 },
        ],
        heaps: [OBJ("o1", "CreditCard #1", [])],
        globals: [N("m_card", "card", "<CreditCard #1>")],
        note: "One CreditCard object. It will use both its own pay() and the parent's shared check.",
      },
      {
        label: "pay(100)",
        active: [11, 5, 6, 7],
        hot: ["c1"],
        flights: [
          { from: "c1", to: "cc_pay", text: "pay", kind: GREEN, at: 0.2 },
          { from: "a0", to: "p0", text: "100", kind: GREEN, at: 0.6 },
          { from: "p0", to: "u0", text: "100", kind: GREEN, at: 1.3 },
          { from: "c0", to: "pay_validate", text: "shared check", kind: BLUE, at: 2.0 },
          { from: "pay_validate", to: "c0", text: "True", kind: GREEN, at: 2.9 },
          { from: "q1", to: "cons", text: "Charging $100", kind: "ret", at: 3.7 },
        ],
        swap: { p0: { text: "100", kind: GREEN, cap: "amount" }, u0: { text: "100", kind: GREEN } },
        out: ["Charging $100"],
        note: "pay() asks validate_amount(), which lives in Payment. Python finds it by looking up the family. It returns True.",
      },
      {
        label: "pay(-20)",
        active: [12, 5, 6, 8],
        hot: ["c2"],
        drop: ["p0", "u0"],
        flights: [
          { from: "c2", to: "cc_pay", text: "pay", kind: GREEN, at: 0.2 },
          { from: "a1", to: "p0", text: "-20", kind: ROSE, at: 0.6 },
          { from: "p0", to: "u0", text: "-20", kind: ROSE, at: 1.3 },
          { from: "c0", to: "pay_validate", text: "shared check", kind: BLUE, at: 2.0 },
          { from: "pay_validate", to: "c0", text: "False", kind: ROSE, at: 2.9 },
          { from: "q2", to: "cons", text: "Invalid payment amount.", kind: "ret", at: 3.7 },
        ],
        swap: { p0: { text: "-20", kind: ROSE, cap: "amount" }, u0: { text: "-20", kind: ROSE } },
        out: ["Invalid payment amount."],
        note: "The same shared check now returns False, so the else branch runs. Every child gets this validation for free.",
      },
    ],
  },
  /* 6 Putting abstraction together -------------------------------------------- */
  {
    eyebrow: "Putting it together",
    title: "The rest of the program only knows export()",
    dense: true,
    zones: [64, 208],
    lines: [
      "class ⟦n0:ReportExporter⟧(ABC):",
      "    ⟦q0:@abstractmethod⟧",
      "    def export(self, data): pass",
      "class ⟦n1:PDFExporter⟧(ReportExporter):",
      '    def export(self, data): print(⟦q1:f"Exported {data} as PDF"⟧)',
      "class ⟦n2:CSVExporter⟧(ReportExporter):",
      '    def export(self, data): print(⟦q2:f"Exported {data} as CSV"⟧)',
      "",
      "def export_report(⟦p0:exporter⟧, ⟦p1:data⟧):",
      "    ⟦c0:exporter.export⟧(⟦u0:data⟧)",
      "",
      'export_report(⟦cc0:PDFExporter()⟧, ⟦a0:"Sales Report"⟧)',
      'export_report(⟦cc1:CSVExporter()⟧, ⟦a1:"Sales Report"⟧)',
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6],
        flights: [
          { from: "n0", to: "obj_k_rep", text: "class ReportExporter", kind: BLUE, at: 0.2 },
          { from: "q0", to: "rep_export", text: "abstract", kind: AMBER, at: 0.5 },
          { from: "n1", to: "obj_k_pdf", text: "class PDFExporter", kind: GREEN, at: 0.8 },
          { from: "n2", to: "obj_k_csv", text: "class CSVExporter", kind: VIOLET, at: 1.1 },
        ],
        heaps: [
          K("k_rep", "class ReportExporter(ABC)", "parent", [M("rep_export", "export", AMBER, "abstract export()")]),
          K("k_pdf", "class PDFExporter(ReportExporter)", "child", [M("pdf_export", "export", GREEN)]),
          K("k_csv", "class CSVExporter(ReportExporter)", "other", [M("csv_export", "export", VIOLET)]),
        ],
        note: "One contract, export(data), and two exporters that each implement it in their own format.",
      },
      {
        label: "Call 1",
        active: [11, 8],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o1", to: "p0", text: "<PDFExporter #1>", kind: "ref", at: 1.0 },
          { from: "a0", to: "p1", text: '"Sales Report"', kind: GREEN, at: 1.3 },
        ],
        swap: {
          p0: { text: "<PDFExporter #1>", kind: "ref", cap: "exporter" },
          p1: { text: '"Sales Report"', kind: GREEN, cap: "data" },
        },
        heaps: [OBJ("o1", "PDFExporter #1", [])],
        note: "export_report() receives an exporter and some data. It never asks which kind of exporter it is.",
      },
      {
        label: "export()",
        active: [9, 4],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "pdf_export", text: "export", kind: GREEN, at: 0.3 },
          { from: "p1", to: "u0", text: '"Sales Report"', kind: GREEN, at: 0.9 },
          { from: "q1", to: "cons", text: "Exported Sales Report as PDF", kind: "ret", at: 1.8 },
        ],
        swap: { u0: { text: '"Sales Report"', kind: GREEN } },
        out: ["Exported Sales Report as PDF"],
        note: "The call lands in PDFExporter, which hides how a PDF is really produced.",
      },
      {
        label: "Call 2",
        active: [12, 8],
        drop: ["p0", "p1", "u0"],
        flights: [
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "obj_o2", to: "p0", text: "<CSVExporter #1>", kind: "ref", at: 1.0 },
          { from: "a1", to: "p1", text: '"Sales Report"', kind: GREEN, at: 1.3 },
        ],
        swap: {
          p0: { text: "<CSVExporter #1>", kind: "ref", cap: "exporter" },
          p1: { text: '"Sales Report"', kind: GREEN, cap: "data" },
        },
        heaps: [OBJ("o2", "CSVExporter #1", [])],
        note: "A different exporter goes through the very same function.",
      },
      {
        label: "export()",
        active: [9, 6],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "csv_export", text: "export", kind: VIOLET, at: 0.3 },
          { from: "p1", to: "u0", text: '"Sales Report"', kind: GREEN, at: 0.9 },
          { from: "q2", to: "cons", text: "Exported Sales Report as CSV", kind: "ret", at: 1.8 },
        ],
        swap: { u0: { text: '"Sales Report"', kind: GREEN } },
        out: ["Exported Sales Report as CSV"],
        note: "Adding a JSONExporter later would need no change to export_report(). That is the payoff of abstraction.",
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
/* Step 1: hide the details behind a simple call                               */
/* -------------------------------------------------------------------------- */

const HIDDEN: { icon: typeof Cpu; text: string }[] = [
  { icon: Cpu, text: "Ask the operating system" },
  { icon: HardDrive, text: "Read bytes from disk" },
  { icon: Layers, text: "Manage buffers" },
];

function HideScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 12 });
  const hidden = t >= 5.8;
  return (
    <Backdrop>
      {/* What you write */}
      <motion.div animate={fade(t >= 0.3)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.child.box}`} style={{ left: 24, top: 130, width: 192, height: 150 }}>
        <span className="absolute flex size-9 items-center justify-center rounded-xl border border-mint/40 bg-mint/10" style={{ left: 16, top: 16 }}>
          <Laptop className="size-5 text-mint" />
        </span>
        <p className="absolute text-[16px] font-medium text-white" style={{ left: 16, top: 62 }}>
          Your code
        </p>
        <span className="absolute" style={{ left: 16, top: 98 }}>
          <Chip kind="val">file.read()</Chip>
        </span>
      </motion.div>

      {/* What happens inside */}
      <motion.div animate={fade(t >= 0.6)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 256, top: 24, width: 292, height: 354 }}>
        <p className="absolute text-[14px] font-medium text-white" style={{ left: 18, top: 16 }}>
          Inside read()
        </p>
        <motion.div
          animate={{ opacity: hidden ? 0.4 : 1, filter: hidden ? "blur(4px)" : "blur(0px)" }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {HIDDEN.map((h, i) => {
            const Icon = h.icon;
            const at = 2.2 + i * 0.8;
            const on = t >= at && t < at + 0.8;
            const done = t >= at + 0.8;
            return (
              <div
                key={h.text}
                className={`absolute flex items-center gap-3 rounded-xl border bg-slate-950 px-3 transition-colors duration-300 ${on ? TONE.own.box : done ? "border-white/30" : "border-white/15"}`}
                style={{ left: 16, top: 56 + i * 96, width: 260, height: 80 }}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${on || done ? TONE.own.pill : "border-white/15 bg-white/5 text-slate-400"}`}>
                  <Icon className="size-5" />
                </span>
                <span className="text-[13px] leading-5 text-slate-200">{h.text}</span>
                {done && <CheckCircle2 className="absolute size-4 text-mint" style={{ right: 12, top: 12 }} />}
              </div>
            );
          })}
        </motion.div>
        {hidden && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-x-0 flex flex-col items-center gap-2" style={{ top: 140 }}>
            <span className="flex size-12 items-center justify-center rounded-full border border-white/30 bg-slate-950">
              <Lock className="size-6 text-slate-200" />
            </span>
            <p className="text-[14px] text-white">You never see this</p>
          </motion.div>
        )}
      </motion.div>

      {/* What you get back */}
      <motion.div animate={fade(t >= 0.9)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.parent.box}`} style={{ left: 588, top: 130, width: 188, height: 150 }}>
        <span className="absolute flex size-9 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10" style={{ left: 16, top: 16 }}>
          <FileText className="size-5 text-sky-300" />
        </span>
        <p className="absolute text-[16px] font-medium text-white" style={{ left: 16, top: 62 }}>
          What you get
        </p>
        {t >= 5.4 && (
          <span className="absolute" style={{ left: 16, top: 98 }}>
            <Chip kind="ref">data</Chip>
          </span>
        )}
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <line x1={218} y1={205} x2={246} y2={205} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[254, 205]} deg={0} color="rgba(148,163,184,0.85)" />
        <line x1={550} y1={205} x2={578} y2={205} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[586, 205]} deg={0} color="rgba(148,163,184,0.85)" />
      </svg>

      <Fly t={t} start={1.4} dur={0.7} from={[40, 228]} to={[286, 214]} kind="val" text="read()" />
      <Fly t={t} start={4.6} dur={0.8} from={[470, 214]} to={[604, 228]} kind="ref" text="data" />

      <motion.div
        animate={fade(t >= 6.4)}
        className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
        style={{ left: 24, top: 396, width: 752, height: 40 }}
      >
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">You only need to know: read() gives me data. How it does that stays hidden.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2: a plain parent versus an abstract parent                            */
/* -------------------------------------------------------------------------- */

function PlainScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const blocked = t >= 5.7;
  return (
    <Backdrop>
      {/* Plain parent */}
      <motion.div animate={fade(t >= 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 16, top: 16, width: 368, height: 418 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          Plain parent
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          Nothing stops you from creating it
        </p>
      </motion.div>
      <motion.div animate={fade(t >= 0.4)} className={`absolute rounded-xl border bg-slate-950 ${TONE.parent.box}`} style={{ left: 36, top: 84, width: 328, height: 84 }}>
        <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
          <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
            <BookOpen className="size-[18px] text-sky-300" />
          </span>
          <span className="font-mono text-[15px] font-semibold text-white">Payment</span>
        </span>
        <span className="absolute" style={{ left: 14, top: 54 }}>
          <Chip kind="ref">pay()</Chip>
        </span>
        <span className="absolute text-[11px] text-slate-500" style={{ left: 70, top: 56 }}>
          its body is just pass
        </span>
      </motion.div>
      {t < 1.8 && (
        <p className="absolute text-[11px] text-slate-500" style={{ left: 36, top: 184 }}>
          your code
        </p>
      )}
      <Fly t={t} start={0.9} dur={0.8} from={[36, 202]} to={[150, 124]} kind="ret" text="Payment()" />
      {t >= 1.8 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute flex items-center justify-between rounded-xl border border-white/30 bg-slate-950 px-3" style={{ left: 36, top: 196, width: 328, height: 48 }}>
          <Chip kind="ref">{"<Payment #1>"}</Chip>
          <span className={`rounded-full border px-2 py-px text-[10px] ${TONE.bad.pill}`}>accepted</span>
        </motion.div>
      )}
      <Fly t={t} start={2.8} dur={0.8} from={[36, 262]} to={[150, 214]} kind="ret" text="pay(100)" />
      {t >= 3.7 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`absolute flex items-center justify-between rounded-xl border bg-slate-950 px-3 ${TONE.bad.box}`} style={{ left: 36, top: 262, width: 328, height: 48 }}>
          <span className="flex items-center gap-2">
            <span className="text-[12px] text-slate-400">returns</span>
            <Chip kind="no">None</Chip>
          </span>
          <span className="text-[11px] text-rose-300">nothing happened</span>
        </motion.div>
      )}
      <motion.p animate={{ opacity: t >= 4.4 ? 1 : 0 }} className={`absolute flex items-center gap-2 text-[13px] ${TONE.bad.text}`} style={{ left: 36, top: 340 }}>
        <XCircle className="size-5 shrink-0" /> Silent failure: nothing was charged.
      </motion.p>

      {/* Abstract parent */}
      <motion.div animate={fade(t >= 0.4)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.own.box}`} style={{ left: 416, top: 16, width: 368, height: 418 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          Abstract parent
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          Python blocks the unfinished class
        </p>
      </motion.div>
      <motion.div
        animate={{ ...fade(t >= 0.6), x: blocked ? [0, -9, 9, -6, 6, 0] : 0 }}
        transition={{ duration: blocked ? 0.5 : 0.3 }}
        className={`absolute rounded-xl border bg-slate-950 ${blocked ? TONE.bad.box : TONE.own.box}`}
        style={{ left: 436, top: 84, width: 328, height: 84 }}
      >
        <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 12 }}>
          <span className="flex size-8 items-center justify-center rounded-lg border border-amber/40 bg-amber/10">
            <Lock className="size-[18px] text-amber" />
          </span>
          <span className="font-mono text-[15px] font-semibold text-white">Payment (ABC)</span>
        </span>
        <span className="absolute" style={{ left: 14, top: 54 }}>
          <Chip kind="cls">abstract pay()</Chip>
        </span>
        {blocked && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.bad.pill}`} style={{ right: 12, top: 14 }}>
            TypeError
          </motion.span>
        )}
      </motion.div>
      {t < 6.0 && (
        <p className="absolute text-[11px] text-slate-500" style={{ left: 436, top: 184 }}>
          your code
        </p>
      )}
      <Fly t={t} start={4.8} dur={0.8} from={[436, 202]} to={[560, 124]} kind="ret" text="Payment()" />
      {t >= 6.0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`absolute flex items-center rounded-xl border bg-slate-950 px-3 ${TONE.bad.box}`} style={{ left: 436, top: 196, width: 328, height: 56 }}>
          <span className="font-mono text-[12px] leading-4 text-rose-300">Can't instantiate abstract class Payment</span>
        </motion.div>
      )}
      <motion.p animate={{ opacity: t >= 7.0 ? 1 : 0 }} className={`absolute flex items-center gap-2 text-[13px] ${TONE.child.text}`} style={{ left: 436, top: 340 }}>
        <ShieldCheck className="size-5 shrink-0" /> Caught right away, before any damage.
      </motion.p>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3: children sign the contract, and the contract is enforced            */
/* -------------------------------------------------------------------------- */

const SIGNERS: { name: string; icon: typeof Users; tone: Tone; x: number }[] = [
  { name: "CreditCard", icon: CreditCard, tone: "child", x: 40 },
  { name: "PayPal", icon: Wallet, tone: "other", x: 292 },
  { name: "GiftCard", icon: Gift, tone: "own", x: 544 },
];
const SIGN_W = 216;
const SIGN_START = 2.6;
const SIGN_SPAN = 2.0;
const FIX_AT = 8.6;

function ContractScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const fixed = t >= FIX_AT;
  const stage = t >= FIX_AT + 1.0 ? 2 : t < SIGN_START ? -1 : Math.min(2, Math.floor((t - SIGN_START) / SIGN_SPAN));
  const tokenX = stage < 0 ? 16 : SIGNERS[stage].x + SIGN_W / 2 - 46;
  const tokenY = stage < 0 ? 154 : 150;
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.3)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.own.box}`} style={{ left: 200, top: 16, width: 400, height: 94 }}>
        <span className="absolute flex items-center gap-2.5" style={{ left: 18, top: 14 }}>
          <span className="flex size-9 items-center justify-center rounded-xl border border-amber/40 bg-amber/10">
            <BookOpen className="size-5 text-amber" />
          </span>
          <span className="text-[17px] font-medium text-white">Payment</span>
          <Pill tone="own">abstract</Pill>
        </span>
        <span className="absolute" style={{ left: 18, top: 60 }}>
          <Chip kind="cls">abstract pay()</Chip>
        </span>
        <span className="absolute text-[12px] text-slate-400" style={{ left: 140, top: 62 }}>
          every child must provide it
        </span>
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        {SIGNERS.map((s) => {
          const cx = s.x + SIGN_W / 2;
          return (
            <g key={s.name}>
              <motion.path
                d={`M 400 110 L 400 134 L ${cx} 134 L ${cx} 170`}
                fill="none"
                stroke="rgba(148,163,184,0.4)"
                strokeWidth={2.5}
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: t >= 0.7 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
              {t >= 1.1 && <Head at={[cx, 176]} deg={90} color="rgba(148,163,184,0.7)" />}
            </g>
          );
        })}
      </svg>

      {SIGNERS.map((s, i) => {
        const Icon = s.icon;
        const tone = TONE[s.tone];
        const has = i < 2 || fixed;
        const chipAt = i === 0 ? 1.4 : i === 1 ? 1.6 : FIX_AT + 0.2;
        const attemptAt = SIGN_START + i * SIGN_SPAN + 0.7;
        const blocked = i === 2 && t >= attemptAt && !fixed;
        const made = i < 2 ? t >= attemptAt : t >= FIX_AT + 1.7;
        return (
          <motion.div
            key={s.name}
            animate={{ ...fade(t >= 0.8 + i * 0.15), x: blocked && t < attemptAt + 0.6 ? [0, -9, 9, -6, 6, 0] : 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${blocked ? TONE.bad.box : made ? tone.box : "border-white/20"}`}
            style={{ left: s.x, top: 180, width: SIGN_W, height: 140 }}
          >
            <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 14 }}>
              <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                <Icon className="size-[18px]" />
              </span>
              <span className="font-mono text-[14px] font-semibold text-white">{s.name}</span>
            </span>
            {has && t >= chipAt ? (
              <span className="absolute" style={{ left: 14, top: 58 }}>
                <Chip kind={tone.chip}>pay()</Chip>
              </span>
            ) : (
              t >= 1.8 && (
                <span className={`absolute flex items-center justify-center rounded-lg border border-dashed text-[12px] ${TONE.bad.pill}`} style={{ left: 14, top: 58, width: 120, height: 24 }}>
                  pay() missing
                </span>
              )
            )}
            {has && t >= chipAt && i === 2 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.child.pill}`} style={{ left: 74, top: 61 }}>
                added
              </motion.span>
            )}
            {made && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`absolute flex items-center gap-2 rounded-lg border bg-slate-950 px-2.5 ${tone.box}`} style={{ left: 14, top: 94, width: 188, height: 34 }}>
                <CheckCircle2 className="size-4 shrink-0 text-mint" />
                <span className="text-[12px] text-slate-200">object created</span>
              </motion.div>
            )}
            {blocked && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`absolute flex items-center gap-2 rounded-lg border bg-slate-950 px-2.5 ${TONE.bad.box}`} style={{ left: 14, top: 94, width: 188, height: 34 }}>
                <XCircle className="size-4 shrink-0 text-rose-300" />
                <span className="text-[12px] text-rose-300">TypeError: blocked</span>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, x: 16, y: 154 }}
        animate={{ opacity: t >= SIGN_START - 0.4 ? 1 : 0, x: tokenX, y: tokenY }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="pointer-events-none absolute left-0 top-0 z-20"
      >
        <span className={`${chipBase} shadow-[0_0_16px_rgba(255,255,255,0.35)] ${chipClass.ret}`}>create object</span>
      </motion.div>

      <motion.div
        animate={fade(t >= FIX_AT + 2.2)}
        className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4"
        style={{ left: 40, top: 350, width: 720, height: 56 }}
      >
        <ShieldCheck className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] leading-5 text-white">Every child must implement pay() before Python lets you create an object from it.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4: one interface, many implementations                                 */
/* -------------------------------------------------------------------------- */

const EXPORTERS: { name: string; icon: typeof Users; tone: Tone; line: string }[] = [
  { name: "PDF", icon: FileText, tone: "parent", line: "Exporting 'Sales Report' as PDF." },
  { name: "CSV", icon: Table, tone: "child", line: "Exporting 'Sales Report' as CSV." },
  { name: "Excel", icon: FileSpreadsheet, tone: "other", line: "Exporting 'Sales Report' as Excel." },
  { name: "JSON", icon: Download, tone: "own", line: "Exporting 'Sales Report' as JSON." },
];
const EXP_AT = [2.0, 3.9, 5.8, 10.2];
const NEW_AT = 9.0;

function InterfaceScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.3)} className="absolute rounded-2xl border border-white/25 bg-slate-900" style={{ left: 200, top: 14, width: 400, height: 66 }}>
        <p className="absolute text-[14px] font-medium text-white" style={{ left: 18, top: 10 }}>
          The rest of the program
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 18, top: 34 }}>
          knows only one thing:
        </p>
        <span className="absolute" style={{ left: 172, top: 36 }}>
          <Chip kind="ret">export(data)</Chip>
        </span>
      </motion.div>
      {t >= 11.8 && (
        <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${TONE.child.pill}`} style={{ left: 620, top: 28 }}>
          <CheckCircle2 className="size-4" /> program unchanged
        </motion.span>
      )}

      <motion.div animate={fade(t >= 0.7)} className={`absolute flex items-center justify-center gap-3 rounded-xl border bg-slate-900 ${TONE.own.box}`} style={{ left: 120, top: 122, width: 560, height: 52 }}>
        <BookOpen className="size-5 text-amber" />
        <span className="font-mono text-[14px] font-semibold text-white">ReportExporter</span>
        <Chip kind="cls">abstract export()</Chip>
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <line x1={400} y1={82} x2={400} y2={116} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[400, 120]} deg={90} color="rgba(148,163,184,0.85)" />
        {EXPORTERS.map((e, i) => {
          const cx = 24 + i * 190 + 86;
          const show = i < 3 ? t >= 1.0 + i * 0.15 : t >= NEW_AT;
          return show ? (
            <g key={e.name}>
              <path d={`M ${cx} 174 L ${cx} 216`} stroke="rgba(148,163,184,0.45)" strokeWidth={2.5} fill="none" />
              <Head at={[cx, 224]} deg={90} color="rgba(148,163,184,0.75)" />
            </g>
          ) : null;
        })}
      </svg>

      {EXPORTERS.map((e, i) => {
        const Icon = e.icon;
        const show = i < 3 ? t >= 1.0 + i * 0.15 : t >= NEW_AT;
        const local = t - EXP_AT[i];
        const active = local >= 0.8 && local < 2.0;
        const tone = TONE[e.tone];
        return (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
            className={`absolute rounded-xl border bg-slate-900 transition-colors duration-300 ${active ? tone.box : "border-white/20"}`}
            style={{ left: 24 + i * 190, top: 224, width: 172, height: 88 }}
          >
            <span className="absolute flex items-center gap-2.5" style={{ left: 12, top: 12 }}>
              <span className={`flex size-8 items-center justify-center rounded-lg border ${tone.pill}`}>
                <Icon className="size-[18px]" />
              </span>
              <span className="font-mono text-[13px] font-semibold text-white">{e.name}Exporter</span>
            </span>
            <span className="absolute" style={{ left: 12, top: 56 }}>
              <Chip kind={tone.chip}>export()</Chip>
            </span>
            {i === 3 && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-full border px-2 py-px text-[10px] ${TONE.child.pill}`} style={{ right: 10, top: 58 }}>
                new
              </motion.span>
            )}
          </motion.div>
        );
      })}
      {EXPORTERS.map((e, i) => (
        <Fly key={e.name} t={t} start={EXP_AT[i]} dur={0.8} from={[350, 92]} to={[24 + i * 190 + 40, 212]} kind="ret" text="export(data)" />
      ))}

      <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 24, top: 322, width: 752, height: 118 }}>
        <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 10 }}>
          output
        </p>
        <div className="absolute flex flex-col gap-0.5" style={{ left: 16, top: 28 }}>
          {EXPORTERS.map((e, i) =>
            t - EXP_AT[i] >= 1.2 ? (
              <motion.p key={e.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[12px] leading-[18px] ${TONE[e.tone].text}`}>
                {e.line}
              </motion.p>
            ) : null,
          )}
        </div>
      </div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 5: required behavior and shared behavior live in the same class       */
/* -------------------------------------------------------------------------- */

const CALLS: { call: string; check: string; verdict: string; ok: boolean; line: string; at: number }[] = [
  { call: "pay(100)", check: "check 100", verdict: "True", ok: true, line: "Charging $100", at: 2.0 },
  { call: "pay(-20)", check: "check -20", verdict: "False", ok: false, line: "Invalid payment amount.", at: 6.4 },
];

function SharedScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const childOn = CALLS.some((c) => t - c.at >= 0.7 && t - c.at < 3.6);
  const sharedOn = CALLS.some((c) => t - c.at >= 1.7 && t - c.at < 2.8);
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.3)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.own.box}`} style={{ left: 160, top: 14, width: 480, height: 138 }}>
        <span className="absolute flex items-center gap-2.5" style={{ left: 16, top: 12 }}>
          <span className="flex size-8 items-center justify-center rounded-lg border border-amber/40 bg-amber/10">
            <BookOpen className="size-[18px] text-amber" />
          </span>
          <span className="text-[16px] font-medium text-white">Payment</span>
          <Pill tone="own">abstract</Pill>
        </span>
      </motion.div>
      <motion.div animate={fade(t >= 0.6)} className={`absolute rounded-xl border border-dashed bg-slate-950 ${TONE.own.box}`} style={{ left: 176, top: 66, width: 220, height: 74 }}>
        <p className="absolute text-[11px] tracking-wide text-amber" style={{ left: 12, top: 8 }}>
          required: children write it
        </p>
        <span className="absolute" style={{ left: 12, top: 36 }}>
          <Chip kind="cls">abstract pay()</Chip>
        </span>
      </motion.div>
      <motion.div
        animate={fade(t >= 0.8)}
        className={`absolute rounded-xl border border-dashed bg-slate-950 transition-colors duration-300 ${sharedOn ? TONE.parent.box : "border-sky-400/30"}`}
        style={{ left: 404, top: 66, width: 220, height: 74 }}
      >
        <p className="absolute text-[11px] tracking-wide text-sky-300" style={{ left: 12, top: 8 }}>
          shared: already written
        </p>
        <span className="absolute" style={{ left: 12, top: 36 }}>
          <Chip kind="ref">validate_amount()</Chip>
        </span>
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <motion.line x1={400} y1={222} x2={400} y2={162} stroke="rgba(148,163,184,0.5)" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: t >= 1.2 ? 1 : 0 }} transition={{ duration: 0.4 }} />
        {t >= 1.5 && <Head at={[400, 156]} deg={-90} color="rgba(148,163,184,0.85)" />}
      </svg>
      <motion.span animate={{ opacity: t >= 1.5 ? 1 : 0 }} className="absolute rounded-full border border-white/20 bg-slate-900 px-2.5 py-0.5 text-[11px] text-slate-300" style={{ left: 444, top: 186 }}>
        inherits
      </motion.span>

      <motion.div
        animate={fade(t >= 1.0)}
        className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${childOn ? TONE.child.box : "border-white/20"}`}
        style={{ left: 240, top: 224, width: 320, height: 110 }}
      >
        <span className="absolute flex items-center gap-2.5" style={{ left: 16, top: 14 }}>
          <span className="flex size-8 items-center justify-center rounded-lg border border-mint/40 bg-mint/10">
            <CreditCard className="size-[18px] text-mint" />
          </span>
          <span className="font-mono text-[14px] font-semibold text-white">CreditCardPayment</span>
        </span>
        <span className="absolute" style={{ left: 16, top: 62 }}>
          <Chip kind="val">pay()</Chip>
        </span>
        <span className="absolute text-[11px] text-slate-500" style={{ left: 70, top: 64 }}>
          its own version of the required part
        </span>
      </motion.div>

      {CALLS.map((c) => (
        <div key={c.call}>
          <Fly t={t} start={c.at} dur={0.7} from={[40, 270]} to={[262, 270]} kind="ret" text={c.call} />
          <Fly t={t} start={c.at + 0.9} dur={0.8} from={[262, 270]} to={[420, 104]} kind="ref" text={c.check} />
          <Fly t={t} start={c.at + 2.0} dur={0.8} from={[420, 104]} to={[270, 296]} kind={c.ok ? "val" : "no"} text={c.verdict} />
        </div>
      ))}
      <p className="absolute text-[11px] text-slate-500" style={{ left: 24, top: 238 }}>
        your code
      </p>

      <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 24, top: 352, width: 752, height: 84 }}>
        <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 16, top: 10 }}>
          output
        </p>
        <div className="absolute flex flex-col gap-1" style={{ left: 16, top: 30 }}>
          {CALLS.map((c) =>
            t - c.at >= 3.4 ? (
              <motion.p key={c.call} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[13px] leading-5 ${c.ok ? TONE.child.text : TONE.bad.text}`}>
                {c.line}
              </motion.p>
            ) : null,
          )}
        </div>
      </div>
    </Backdrop>
  );
}

function OverviewScene({ step, reduce, running }: { step: number; reduce: boolean; running: boolean }) {
  const t = useClock(step, reduce, running);
  return (
    <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
      <AnimatePresence mode="wait">
        {step === 0 && <HideScene key="hide" t={t} />}
        {step === 1 && <PlainScene key="plain" t={t} />}
        {step === 2 && <ContractScene key="contract" t={t} />}
        {step === 3 && <InterfaceScene key="interface" t={t} />}
        {step === 4 && <SharedScene key="shared" t={t} />}
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
  title: "Define what, hide how",
  steps: [
    {
      label: "Hide details",
      ms: 9600,
      note: "Abstraction exposes the essential behavior and hides the rest. file.read() gives you data without showing how the operating system, disk and buffers work.",
    },
    {
      label: "Plain vs abstract",
      ms: 9800,
      note: "A plain parent class can still be created, and its empty method fails silently. An abstract parent is blocked by Python at once.",
    },
    {
      label: "The contract",
      ms: 14000,
      note: "A child must implement every abstract method before Python lets you create its objects. A class that forgets pay() is blocked until it adds it.",
    },
    {
      label: "One interface",
      ms: 14800,
      note: "The rest of the program depends only on the contract. New implementations plug in without changing the code that uses them.",
    },
    {
      label: "Shared helpers",
      ms: 12000,
      note: "An abstract class can mix required methods with ordinary shared ones. Children write the required part and inherit the rest for free.",
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

export function AbstractionCustomAnimation() {
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