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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Package,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  ShoppingCart,
  Terminal,
  User,
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

// Each special method gets its own chip color, so you can see which method Python
// picked: init is blue, a readable or value method green, and so on.
const BLUE = "ref" as Kind;
const GREEN = "val" as Kind;
const VIOLET = "fn" as Kind;
const ROSE = "no" as Kind;

const slides: Slide[] = [
  /* 1 init, str, repr ------------------------------------------------------- */
  {
    eyebrow: "__init__, __str__, __repr__",
    title: "Python calls these when you create, print and inspect",
    dense: true,
    lines: [
      "class ⟦n0:Product⟧:",
      "    def __init__(self, name, price):",
      "        self.name = name",
      "        self.price = price",
      "    def __str__(self):",
      '        return ⟦q0:f"{self.name} - ${self.price}"⟧',
      "    def __repr__(self):",
      '        return ⟦q1:f"Product({self.name!r}, {self.price!r})"⟧',
      "",
      '⟦v:product⟧ = ⟦cc0:Product(⟧⟦a0:"Laptop"⟧, ⟦a1:900⟧)',
      "print(⟦g0:str(product)⟧)",
      "print(⟦g1:repr(product)⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6, 7],
        flights: [{ from: "n0", to: "obj_k_prod", text: "class Product", kind: BLUE, at: 0.2 }],
        heaps: [
          K("k_prod", "class Product", "parent", [
            M("prod___init__", "__init__", BLUE),
            M("prod___str__", "__str__", GREEN),
            M("prod___repr__", "__repr__", VIOLET),
          ]),
        ],
        note: "Three special methods in one class. Python will call each one for you at the right moment.",
      },
      {
        label: "Create",
        active: [9, 1, 2, 3],
        flights: [
          { from: "cc0", to: "prod___init__", text: "Python calls __init__", kind: BLUE, at: 0.2 },
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.9 },
          { from: "a0", to: "o1_name", text: '"Laptop"', kind: GREEN, at: 1.4 },
          { from: "a1", to: "o1_price", text: "900", kind: GREEN, at: 1.8 },
          { from: "obj_o1", to: "m_product", text: "<Product #1>", kind: "ref", at: 2.4 },
        ],
        heaps: [OBJ("o1", "Product #1", [R("o1_name", "name", '"Laptop"'), R("o1_price", "price", "900")])],
        globals: [N("m_product", "product", "<Product #1>")],
        note: "Product(...) builds the object, then Python calls __init__() to store the values on it.",
      },
      {
        label: "str()",
        active: [10, 4, 5],
        hot: ["g0"],
        flights: [
          { from: "g0", to: "prod___str__", text: "str()", kind: GREEN, at: 0.2 },
          { from: "q0", to: "g0", text: "Laptop - $900", kind: GREEN, at: 1.1 },
          { from: "g0", to: "cons", text: "Laptop - $900", kind: "ret", at: 2.0 },
        ],
        swap: { g0: { text: "Laptop - $900", kind: GREEN } },
        out: ["Laptop - $900"],
        note: "str() and print() ask for __str__(), the readable text meant for people.",
      },
      {
        label: "repr()",
        active: [11, 6, 7],
        hot: ["g1"],
        flights: [
          { from: "g1", to: "prod___repr__", text: "repr()", kind: VIOLET, at: 0.2 },
          { from: "q1", to: "g1", text: "Product('Laptop', 900)", kind: VIOLET, at: 1.1 },
          { from: "g1", to: "cons", text: "Product('Laptop', 900)", kind: "ret", at: 2.0 },
        ],
        swap: { g1: { text: "Product('Laptop', 900)", kind: VIOLET } },
        out: ["Product('Laptop', 900)"],
        note: "repr() asks for __repr__(), an exact description that helps developers while debugging.",
      },
    ],
  },
  /* 2 len and bool ------------------------------------------------------------ */
  {
    eyebrow: "__len__ and __bool__",
    title: "len(cart) and if cart: both ask the cart itself",
    lines: [
      "class ⟦n0:ShoppingCart⟧:",
      "    def __init__(self, items):",
      "        self.items = items",
      "    def __len__(self):",
      "        return len(⟦u0:self.items⟧)",
      "    def __bool__(self):",
      "        return len(⟦u1:self.items⟧) > 0",
      "",
      '⟦v:cart⟧ = ⟦cc0:ShoppingCart(⟧⟦a0:["Laptop", "Mouse"]⟧)',
      "print(⟦g0:len(cart)⟧)",
      'if ⟦g1:cart⟧: print(⟦q0:"Cart has items."⟧)',
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6],
        flights: [{ from: "n0", to: "obj_k_cart", text: "class ShoppingCart", kind: BLUE, at: 0.2 }],
        heaps: [
          K("k_cart", "class ShoppingCart", "parent", [
            M("cart___init__", "__init__", BLUE),
            M("cart___len__", "__len__", GREEN),
            M("cart___bool__", "__bool__", VIOLET),
          ]),
        ],
        note: "ShoppingCart answers two questions: how big are you, and are you truthy?",
      },
      {
        label: "Create",
        active: [8, 1, 2],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_items", text: "[2 items]", kind: GREEN, at: 0.8 },
          { from: "obj_o1", to: "m_cart", text: "<Cart #1>", kind: "ref", at: 1.6 },
        ],
        heaps: [OBJ("o1", "Cart #1", [R("o1_items", "items", "[2 items]")])],
        globals: [N("m_cart", "cart", "<Cart #1>")],
        note: "A cart holding two products. The list is stored in the items attribute by __init__().",
      },
      {
        label: "len()",
        active: [9, 3, 4],
        hot: ["g0"],
        flights: [
          { from: "g0", to: "cart___len__", text: "len()", kind: GREEN, at: 0.2 },
          { from: "o1_items", to: "u0", text: "[2 items]", kind: GREEN, at: 1.0 },
          { from: "u0", to: "g0", text: "2", kind: GREEN, at: 1.8 },
          { from: "g0", to: "cons", text: "2", kind: "ret", at: 2.6 },
        ],
        swap: { u0: { text: "[2 items]", kind: GREEN }, g0: { text: "2", kind: GREEN } },
        out: ["2"],
        note: "len(cart) calls __len__(), which returns the number of items. It must be a non-negative integer.",
      },
      {
        label: "bool()",
        active: [10, 5, 6],
        hot: ["g1"],
        flights: [
          { from: "g1", to: "cart___bool__", text: "truthy?", kind: VIOLET, at: 0.2 },
          { from: "o1_items", to: "u1", text: "[2 items]", kind: GREEN, at: 0.9 },
          { from: "u1", to: "g1", text: "True", kind: GREEN, at: 1.7 },
          { from: "q0", to: "cons", text: "Cart has items.", kind: "ret", at: 2.5 },
        ],
        swap: { u1: { text: "[2 items]", kind: GREEN }, g1: { text: "True", kind: GREEN } },
        out: ["Cart has items."],
        note: "if cart: calls __bool__(). Without it, Python would fall back to __len__() and treat zero as falsey.",
      },
    ],
  },
  /* 3 getitem and contains ------------------------------------------------------ */
  {
    eyebrow: "__getitem__ and __contains__",
    title: "Brackets and the in operator work on your own class",
    lines: [
      "class ⟦n0:Team⟧:",
      "    def __init__(self, members):",
      "        self.members = members",
      "    def __getitem__(self, ⟦p0:index⟧):",
      "        return self.members[⟦u0:index⟧]",
      "    def __contains__(self, ⟦p1:member⟧):",
      "        return ⟦u1:member⟧ in self.members",
      "",
      '⟦v:team⟧ = ⟦cc0:Team(⟧⟦a0:["Aman", "Riya", "Kabir"]⟧)',
      "print(⟦g0:team⟧[⟦a1:0⟧])",
      'print(⟦a2:"Neha"⟧ ⟦g1:in⟧ team)',
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6],
        flights: [{ from: "n0", to: "obj_k_team", text: "class Team", kind: BLUE, at: 0.2 }],
        heaps: [
          K("k_team", "class Team", "parent", [
            M("team___init__", "__init__", BLUE),
            M("team___getitem__", "__getitem__", GREEN),
            M("team___contains__", "__contains__", VIOLET),
          ]),
        ],
        note: "Two more special methods: one for square brackets, one for the in operator.",
      },
      {
        label: "Create",
        active: [8, 1, 2],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_members", text: "[3 names]", kind: GREEN, at: 0.8 },
          { from: "obj_o1", to: "m_team", text: "<Team #1>", kind: "ref", at: 1.6 },
        ],
        heaps: [OBJ("o1", "Team #1", [R("o1_members", "members", "[3 names]")])],
        globals: [N("m_team", "team", "<Team #1>")],
        note: "A team with three members, stored in the members attribute by __init__().",
      },
      {
        label: "team[0]",
        active: [9, 3, 4],
        hot: ["g0"],
        flights: [
          { from: "g0", to: "team___getitem__", text: "[ ] calls it", kind: GREEN, at: 0.2 },
          { from: "a1", to: "p0", text: "0", kind: GREEN, at: 0.7 },
          { from: "p0", to: "u0", text: "0", kind: GREEN, at: 1.5 },
          { from: "o1_members", to: "cons", text: "Aman", kind: "ret", at: 2.3 },
        ],
        swap: { p0: { text: "0", kind: GREEN, cap: "index" }, u0: { text: "0", kind: GREEN } },
        out: ["Aman"],
        note: "team[0] becomes team.__getitem__(0). The method looks the index up in its own list.",
      },
      {
        label: "in",
        active: [10, 5, 6],
        hot: ["g1"],
        drop: ["p0", "u0"],
        flights: [
          { from: "g1", to: "team___contains__", text: "in calls it", kind: VIOLET, at: 0.2 },
          { from: "a2", to: "p1", text: '"Neha"', kind: GREEN, at: 0.7 },
          { from: "p1", to: "u1", text: '"Neha"', kind: GREEN, at: 1.5 },
          { from: "o1_members", to: "cons", text: "False", kind: ROSE, at: 2.3 },
        ],
        swap: { p1: { text: '"Neha"', kind: GREEN, cap: "member" }, u1: { text: '"Neha"', kind: GREEN } },
        out: ["False"],
        note: "\"Neha\" in team becomes team.__contains__(\"Neha\"). Neha is not a member, so the answer is False.",
      },
    ],
  },
  /* 4 add --------------------------------------------------------------------- */
  {
    eyebrow: "__add__",
    title: "Two carts combine with a plain + sign",
    zones: [108, 80],
    lines: [
      "class ⟦n0:ShoppingCart⟧:",
      "    def __init__(self, items):",
      "        self.items = items",
      "    def __add__(⟦s:self⟧, ⟦p0:other⟧):",
      "        return ⟦cc3:ShoppingCart(⟧⟦u0:self.items⟧ + ⟦u1:other.items⟧)",
      "",
      '⟦v0:cart1⟧ = ⟦cc0:ShoppingCart(⟧⟦a0:["Laptop", "Mouse"]⟧)',
      '⟦v1:cart2⟧ = ⟦cc1:ShoppingCart(⟧⟦a1:["Keyboard"]⟧)',
      "⟦v2:combined⟧ = cart1 ⟦c0:+⟧ cart2",
      "print(⟦g0:combined.items⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4],
        flights: [{ from: "n0", to: "obj_k_cart", text: "class ShoppingCart", kind: BLUE, at: 0.2 }],
        heaps: [K("k_cart", "class ShoppingCart", "parent", [M("cart___init__", "__init__", BLUE), M("cart___add__", "__add__", GREEN)])],
        note: "__add__() tells Python what + means when both sides are ShoppingCart objects.",
      },
      {
        label: "Cart 1",
        active: [6, 1, 2],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_items", text: "[2 items]", kind: GREEN, at: 0.8 },
          { from: "obj_o1", to: "m_cart1", text: "<Cart #1>", kind: "ref", at: 1.6 },
        ],
        heaps: [OBJ("o1", "Cart #1", [R("o1_items", "items", "[2 items]")])],
        globals: [N("m_cart1", "cart1", "<Cart #1>")],
        note: "The first cart holds a laptop and a mouse.",
      },
      {
        label: "Cart 2",
        active: [7, 1, 2],
        flights: [
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "a1", to: "o2_items", text: "[1 item]", kind: GREEN, at: 0.8 },
          { from: "obj_o2", to: "m_cart2", text: "<Cart #2>", kind: "ref", at: 1.6 },
        ],
        heaps: [OBJ("o2", "Cart #2", [R("o2_items", "items", "[1 item]")])],
        globals: [N("m_cart2", "cart2", "<Cart #2>")],
        note: "The second cart holds a keyboard.",
      },
      {
        label: "Plus",
        active: [8, 3],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "cart___add__", text: "+ calls __add__", kind: GREEN, at: 0.2 },
          { from: "obj_o1", to: "s", text: "Cart #1", kind: "ref", at: 1.0 },
          { from: "obj_o2", to: "p0", text: "Cart #2", kind: "ref", at: 1.3 },
        ],
        swap: { s: { text: "Cart #1", kind: "ref", cap: "self" }, p0: { text: "Cart #2", kind: "ref", cap: "other" } },
        note: "cart1 + cart2 becomes cart1.__add__(cart2). The left cart is self, the right one is other.",
      },
      {
        label: "Join",
        active: [4],
        flights: [
          { from: "o1_items", to: "u0", text: "[2 items]", kind: GREEN, at: 0.2 },
          { from: "o2_items", to: "u1", text: "[1 item]", kind: GREEN, at: 0.5 },
          { from: "cc3", to: "obj_o3", text: "new object", kind: "ref", at: 1.2 },
          { from: "u1", to: "o3_items", text: "[3 items]", kind: GREEN, at: 1.9 },
        ],
        swap: { u0: { text: "[2 items]", kind: GREEN }, u1: { text: "[1 item]", kind: GREEN } },
        heaps: [OBJ("o3", "Cart #3", [R("o3_items", "items", "[3 items]")])],
        note: "The method joins the two item lists and wraps them in a brand new cart. The originals are unchanged.",
      },
      {
        label: "Print",
        active: [8, 9],
        drop: ["s", "p0", "u0", "u1"],
        flights: [
          { from: "obj_o3", to: "m_combined", text: "<Cart #3>", kind: "ref", at: 0.2 },
          { from: "o3_items", to: "g0", text: "[3 items]", kind: GREEN, at: 0.9 },
          { from: "g0", to: "cons", text: "['Laptop', 'Mouse', 'Keyboard']", kind: "ret", at: 1.8 },
        ],
        swap: { g0: { text: "[3 items]", kind: GREEN } },
        globals: [N("m_combined", "combined", "<Cart #3>")],
        out: ["['Laptop', 'Mouse', 'Keyboard']"],
        note: "combined refers to the new cart, and its items hold everything from both carts.",
      },
    ],
  },
  /* 5 eq ------------------------------------------------------------------------ */
  {
    eyebrow: "__eq__",
    title: "You decide what it means for two products to be equal",
    lines: [
      "class ⟦n0:Product⟧:",
      "    def __init__(self, sku, name):",
      "        self.sku = sku",
      "        self.name = name",
      "    def __eq__(self, other):",
      "        if not isinstance(other, Product):",
      "            return NotImplemented",
      "        return ⟦u0:self.sku⟧ == ⟦u1:other.sku⟧",
      "",
      '⟦v0:product1⟧ = ⟦cc0:Product(⟧⟦a0:"SKU100"⟧, ⟦a2:"Laptop"⟧)',
      '⟦v1:product2⟧ = ⟦cc1:Product(⟧⟦a1:"SKU100"⟧, ⟦a3:"Laptop Pro"⟧)',
      "print(product1 ⟦c0:==⟧ product2)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6, 7],
        flights: [{ from: "n0", to: "obj_k_prod", text: "class Product", kind: BLUE, at: 0.2 }],
        heaps: [K("k_prod", "class Product", "parent", [M("prod___init__", "__init__", BLUE), M("prod___eq__", "__eq__", GREEN)])],
        note: "__eq__() compares only the sku. The isinstance check returns NotImplemented for anything that is not a Product.",
      },
      {
        label: "Product 1",
        active: [9, 1, 2, 3],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "o1_sku", text: '"SKU100"', kind: GREEN, at: 0.7 },
          { from: "a2", to: "o1_name", text: '"Laptop"', kind: GREEN, at: 1.1 },
          { from: "obj_o1", to: "m_product1", text: "<Product #1>", kind: "ref", at: 1.8 },
        ],
        heaps: [OBJ("o1", "Product #1", [R("o1_sku", "sku", '"SKU100"'), R("o1_name", "name", '"Laptop"')])],
        globals: [N("m_product1", "product1", "<Product #1>")],
        note: "The first product has the sku SKU100 and the name Laptop. Python runs __init__() to store both.",
      },
      {
        label: "Product 2",
        active: [10, 1, 2, 3],
        flights: [
          { from: "cc1", to: "obj_o2", text: "new object", kind: "ref", at: 0.2 },
          { from: "a1", to: "o2_sku", text: '"SKU100"', kind: GREEN, at: 0.7 },
          { from: "a3", to: "o2_name", text: '"Laptop Pro"', kind: GREEN, at: 1.1 },
          { from: "obj_o2", to: "m_product2", text: "<Product #2>", kind: "ref", at: 1.8 },
        ],
        heaps: [OBJ("o2", "Product #2", [R("o2_sku", "sku", '"SKU100"'), R("o2_name", "name", '"Laptop Pro"')])],
        globals: [N("m_product2", "product2", "<Product #2>")],
        note: "A second, separate object. The name differs, but the sku is the same.",
      },
      {
        label: "Compare",
        active: [11, 4, 7],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "prod___eq__", text: "== calls __eq__", kind: GREEN, at: 0.2 },
          { from: "o1_sku", to: "u0", text: '"SKU100"', kind: GREEN, at: 0.9 },
          { from: "o2_sku", to: "u1", text: '"SKU100"', kind: GREEN, at: 1.2 },
          { from: "u1", to: "cons", text: "True", kind: "ret", at: 2.1 },
        ],
        swap: { u0: { text: '"SKU100"', kind: GREEN }, u1: { text: '"SKU100"', kind: GREEN } },
        out: ["True"],
        note: "product1 == product2 becomes product1.__eq__(product2). Same sku, so Python treats them as equal.",
      },
    ],
  },
  /* 6 call ---------------------------------------------------------------------- */
  {
    eyebrow: "__call__",
    title: "An object can be called like a function",
    lines: [
      "class ⟦n0:Discount⟧:",
      "    def __init__(self, ⟦p0:percent⟧):",
      "        self.percent = ⟦u0:percent⟧",
      "    def __call__(self, ⟦p1:price⟧):",
      "        return ⟦u1:price⟧ * (1 - ⟦u2:self.percent⟧ / 100)",
      "",
      "⟦v:summer_sale⟧ = ⟦cc0:Discount(⟧⟦a0:20⟧)",
      "print(⟦c0:summer_sale⟧(⟦a1:100⟧))",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4],
        flights: [{ from: "n0", to: "obj_k_disc", text: "class Discount", kind: BLUE, at: 0.2 }],
        heaps: [K("k_disc", "class Discount", "parent", [M("disc___init__", "__init__", BLUE), M("disc___call__", "__call__", GREEN)])],
        note: "A Discount remembers a percentage and can also be called with a price.",
      },
      {
        label: "Create",
        active: [6, 1, 2],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "a0", to: "p0", text: "20", kind: GREEN, at: 0.7 },
          { from: "p0", to: "u0", text: "20", kind: GREEN, at: 1.5 },
          { from: "u0", to: "o1_percent", text: "20", kind: GREEN, at: 2.3 },
          { from: "obj_o1", to: "m_sale", text: "<Discount #1>", kind: "ref", at: 3.0 },
        ],
        swap: { p0: { text: "20", kind: GREEN, cap: "percent" }, u0: { text: "20", kind: GREEN } },
        heaps: [OBJ("o1", "Discount #1", [R("o1_percent", "percent", "20")])],
        globals: [N("m_sale", "summer_sale", "<Discount #1>")],
        note: "The object stores its configuration, a 20 percent discount.",
      },
      {
        label: "Call",
        active: [7, 3],
        hot: ["c0"],
        flights: [
          { from: "c0", to: "disc___call__", text: "() calls __call__", kind: GREEN, at: 0.2 },
          { from: "a1", to: "p1", text: "100", kind: GREEN, at: 0.8 },
        ],
        swap: { p1: { text: "100", kind: GREEN, cap: "price" } },
        note: "summer_sale(100) becomes summer_sale.__call__(100). The object is used like a function.",
      },
      {
        label: "Return",
        active: [4],
        flights: [
          { from: "p1", to: "u1", text: "100", kind: GREEN, at: 0.2 },
          { from: "o1_percent", to: "u2", text: "20", kind: GREEN, at: 0.6 },
          { from: "u1", to: "cons", text: "80.0", kind: "ret", at: 1.6 },
        ],
        swap: { u1: { text: "100", kind: GREEN }, u2: { text: "20", kind: GREEN } },
        out: ["80.0"],
        note: "The method combines the price it received with the percentage the object remembers: 100 x 0.8 = 80.0.",
      },
    ],
  },
  /* 7 context manager ------------------------------------------------------------ */
  {
    eyebrow: "__enter__ and __exit__",
    title: "A with block sets up and cleans up for you",
    consoleRows: 4,
    lines: [
      "class ⟦n0:SimpleContext⟧:",
      "    def __enter__(self):",
      '        print(⟦q0:"Entering"⟧)',
      "        return self",
      "    def __exit__(self, exc_type, exc_value, traceback):",
      '        print(⟦q1:"Exiting"⟧)',
      "",
      "⟦c0:with⟧ ⟦cc0:SimpleContext()⟧:",
      '    print(⟦q2:"Inside with block"⟧)',
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5],
        flights: [{ from: "n0", to: "obj_k_ctx", text: "class SimpleContext", kind: BLUE, at: 0.2 }],
        heaps: [K("k_ctx", "class SimpleContext", "parent", [M("ctx___enter__", "__enter__", GREEN), M("ctx___exit__", "__exit__", VIOLET)])],
        note: "Two special methods mark the start and the end of a block.",
      },
      {
        label: "With",
        active: [7],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "c0", to: "ctx___enter__", text: "block starts", kind: GREEN, at: 0.9 },
        ],
        heaps: [OBJ("o1", "SimpleContext #1", [])],
        note: "The with statement creates the object and immediately calls its __enter__() method.",
      },
      {
        label: "Enter",
        active: [1, 2, 3],
        flights: [{ from: "q0", to: "cons", text: "Entering", kind: "ret", at: 0.2 }],
        out: ["Entering"],
        note: "__enter__() runs first. It can prepare a resource, such as opening a file.",
      },
      {
        label: "Body",
        active: [8],
        flights: [{ from: "q2", to: "cons", text: "Inside with block", kind: "ret", at: 0.2 }],
        out: ["Inside with block"],
        note: "Now your own code in the with block runs.",
      },
      {
        label: "Exit",
        active: [4, 5],
        flights: [
          { from: "c0", to: "ctx___exit__", text: "block ends", kind: VIOLET, at: 0.2 },
          { from: "q1", to: "cons", text: "Exiting", kind: "ret", at: 1.1 },
        ],
        out: ["Exiting"],
        note: "__exit__() always runs when the block ends, even if an error happened inside it. It is the place for cleanup.",
      },
    ],
  },
  /* 8 iterator ------------------------------------------------------------------- */
  {
    eyebrow: "__iter__ and __next__",
    title: "A for loop keeps asking the object for the next value",
    dense: true,
    consoleRows: 4,
    lines: [
      "class ⟦n0:CountUpTo⟧:",
      "    def __init__(self, limit):",
      "        self.current, self.limit = 1, limit",
      "    def __iter__(self): return self",
      "    def __next__(self):",
      "        if ⟦c1:self.current > self.limit⟧: raise StopIteration",
      "        self.current += 1",
      "        return ⟦u0:self.current - 1⟧",
      "",
      "⟦c2:for⟧ ⟦v:number⟧ in ⟦cc0:CountUpTo(3)⟧:",
      "    print(⟦g0:number⟧)",
    ],
    steps: [
      {
        label: "Define",
        active: [0, 1, 2, 3, 4, 5, 6, 7],
        flights: [{ from: "n0", to: "obj_k_cnt", text: "class CountUpTo", kind: BLUE, at: 0.2 }],
        heaps: [
          K("k_cnt", "class CountUpTo", "parent", [
            M("cnt___init__", "__init__", BLUE),
            M("cnt___iter__", "__iter__", GREEN),
            M("cnt___next__", "__next__", VIOLET),
          ]),
        ],
        note: "Two methods make an iterator: __iter__() hands back the iterator, and __next__() produces one value at a time.",
      },
      {
        label: "Start",
        active: [9, 1, 2, 3],
        flights: [
          { from: "cc0", to: "obj_o1", text: "new object", kind: "ref", at: 0.2 },
          { from: "cc0", to: "o1_current", text: "1", kind: GREEN, at: 0.7 },
          { from: "cc0", to: "o1_limit", text: "3", kind: GREEN, at: 1.0 },
          { from: "c2", to: "cnt___iter__", text: "for asks __iter__", kind: GREEN, at: 1.8 },
        ],
        heaps: [OBJ("o1", "CountUpTo #1", [R("o1_current", "current", "1"), R("o1_limit", "limit", "3")])],
        note: "The object counts from 1 up to 3. The for loop first asks it for an iterator, and __iter__() returns the object itself.",
      },
      {
        label: "Next 1",
        active: [9, 4, 5, 6, 7, 10],
        hot: ["c2"],
        flights: [
          { from: "c2", to: "cnt___next__", text: "next", kind: VIOLET, at: 0.2 },
          { from: "o1_current", to: "u0", text: "1", kind: GREEN, at: 0.9 },
          { from: "u0", to: "m_number", text: "1", kind: GREEN, at: 1.6 },
          { from: "m_number", to: "g0", text: "1", kind: GREEN, at: 2.3 },
          { from: "g0", to: "cons", text: "1", kind: "ret", at: 3.0 },
        ],
        swap: { u0: { text: "1", kind: GREEN }, g0: { text: "1", kind: GREEN } },
        heaps: [OBJ("o1", "CountUpTo #1", [R("o1_current", "current", "2")])],
        globals: [N("m_number", "number", "1")],
        out: ["1"],
        note: "Each pass calls __next__(). It returns the current number and moves the counter forward.",
      },
      {
        label: "Next 2",
        active: [9, 4, 5, 6, 7, 10],
        hot: ["c2"],
        drop: ["u0", "g0"],
        flights: [
          { from: "c2", to: "cnt___next__", text: "next", kind: VIOLET, at: 0.2 },
          { from: "o1_current", to: "u0", text: "2", kind: GREEN, at: 0.9 },
          { from: "u0", to: "m_number", text: "2", kind: GREEN, at: 1.6 },
          { from: "m_number", to: "g0", text: "2", kind: GREEN, at: 2.3 },
          { from: "g0", to: "cons", text: "2", kind: "ret", at: 3.0 },
        ],
        swap: { u0: { text: "2", kind: GREEN }, g0: { text: "2", kind: GREEN } },
        heaps: [OBJ("o1", "CountUpTo #1", [R("o1_current", "current", "3")])],
        globals: [N("m_number", "number", "2")],
        out: ["2"],
        note: "The loop asks again, and the object answers with the next value.",
      },
      {
        label: "Next 3",
        active: [9, 4, 5, 6, 7, 10],
        hot: ["c2"],
        drop: ["u0", "g0"],
        flights: [
          { from: "c2", to: "cnt___next__", text: "next", kind: VIOLET, at: 0.2 },
          { from: "o1_current", to: "u0", text: "3", kind: GREEN, at: 0.9 },
          { from: "u0", to: "m_number", text: "3", kind: GREEN, at: 1.6 },
          { from: "m_number", to: "g0", text: "3", kind: GREEN, at: 2.3 },
          { from: "g0", to: "cons", text: "3", kind: "ret", at: 3.0 },
        ],
        swap: { u0: { text: "3", kind: GREEN }, g0: { text: "3", kind: GREEN } },
        heaps: [OBJ("o1", "CountUpTo #1", [R("o1_current", "current", "4")])],
        globals: [N("m_number", "number", "3")],
        out: ["3"],
        note: "The third value is the last one the object is willing to give.",
      },
      {
        label: "Stop",
        active: [9, 4, 5],
        hot: ["c2"],
        drop: ["u0", "g0"],
        flights: [
          { from: "c2", to: "cnt___next__", text: "next", kind: VIOLET, at: 0.2 },
          { from: "o1_current", to: "c1", text: "4", kind: GREEN, at: 0.9 },
          { from: "o1_limit", to: "c1", text: "3", kind: GREEN, at: 1.3 },
          { from: "c1", to: "cnt___next__", text: "StopIteration", kind: ROSE, at: 2.0 },
        ],
        note: "Now current is 4, which is greater than limit 3. __next__() raises StopIteration, and the for loop ends quietly.",
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

const KEYWORDS = new Set(["def", "class", "return", "if", "else", "raise", "pass", "for", "in", "from", "import", "with", "not"]);
const DECORATORS = new Set(["classmethod", "staticmethod", "property", "abstractmethod"]);
const BUILTIN_NAMES = new Set(["print", "len", "str", "repr", "isinstance", "NotImplemented", "StopIteration"]);

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
/* Step 1: the translation engine                                              */
/* -------------------------------------------------------------------------- */

const TRANSLATIONS: { syntax: string; method: string; note: string; tone: Tone }[] = [
  { syntax: "Product(...)", method: "__init__()", note: "sets up the new object", tone: "parent" },
  { syntax: "print(product)", method: "__str__()", note: "readable text", tone: "own" },
  { syntax: "repr(product)", method: "__repr__()", note: "developer text", tone: "other" },
  { syntax: "len(cart)", method: "__len__()", note: "the size", tone: "child" },
  { syntax: "a + b", method: "__add__()", note: "combine two objects", tone: "bad" },
  { syntax: "a == b", method: "__eq__()", note: "equality test", tone: "parent" },
];
const TR_START = 1.2;
const TR_SPAN = 1.6;

function TranslateScene({ t }: { t: number }) {
  const idx = t < TR_START ? -1 : Math.min(TRANSLATIONS.length - 1, Math.floor((t - TR_START) / TR_SPAN));
  const cur = idx >= 0 ? TRANSLATIONS[idx] : null;
  const curLocal = idx >= 0 ? t - TR_START - idx * TR_SPAN : 0;
  const engineOn = cur !== null && curLocal >= 0.5 && curLocal < 1.4;
  return (
    <Backdrop>
      <p className="absolute text-[11px] tracking-wider text-slate-500" style={{ left: 24, top: 28 }}>
        YOU WRITE
      </p>
      <p className="absolute text-[11px] tracking-wider text-slate-500" style={{ left: 540, top: 28 }}>
        PYTHON CALLS
      </p>

      <motion.div
        animate={{ opacity: t >= 0.2 ? 1 : 0, y: t >= 0.2 ? 0 : 10 }}
        className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${engineOn && cur ? TONE[cur.tone].box : "border-white/25"}`}
        style={{ left: 300, top: 50, width: 200, height: 366 }}
      >
        <span className="absolute flex size-12 items-center justify-center rounded-xl border border-white/20 bg-white/5" style={{ left: 76, top: 18 }}>
          <Cpu className="size-6 text-slate-200" />
        </span>
        <p className="absolute inset-x-0 text-center text-[16px] font-medium text-white" style={{ top: 78 }}>
          Python
        </p>
        <p className="absolute inset-x-0 text-center text-[11px] text-slate-500" style={{ top: 100 }}>
          translates syntax
        </p>
        {cur && curLocal >= 0.3 && (
          <motion.div key={cur.method} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-3 rounded-xl border border-white/15 bg-slate-950 p-3 text-center" style={{ top: 140 }}>
            <p className="font-mono text-[12px] text-white">{cur.syntax}</p>
            <p className={`my-1 text-[14px] ${TONE[cur.tone].text}`}>becomes</p>
            <p className={`font-mono text-[13px] font-semibold ${TONE[cur.tone].text}`}>{cur.method}</p>
          </motion.div>
        )}
        <p className="absolute inset-x-4 text-center text-[11px] leading-4 text-slate-500" style={{ bottom: 18 }}>
          You rarely call these methods yourself
        </p>
      </motion.div>

      {TRANSLATIONS.map((r, i) => {
        const t0 = TR_START + i * TR_SPAN;
        const local = t - t0;
        const y = 64 + i * 58;
        const lit = local >= 0 && local < 1.4;
        const filled = local >= 1.3;
        const tone = TONE[r.tone];
        return (
          <div key={r.method}>
            <motion.div
              animate={{ opacity: t >= 0.2 + i * 0.08 ? 1 : 0, x: t >= 0.2 + i * 0.08 ? 0 : -10 }}
              className={`absolute flex items-center rounded-xl border bg-slate-900 px-3 transition-colors duration-300 ${lit ? tone.box : "border-white/20"}`}
              style={{ left: 24, top: y, width: 244, height: 44 }}
            >
              <span className="font-mono text-[13px] text-white">{r.syntax}</span>
            </motion.div>
            <div
              className={`absolute flex items-center justify-between rounded-xl border-2 border-dashed px-3 transition-colors duration-300 ${filled ? `${tone.box} bg-slate-900` : "border-white/15"}`}
              style={{ left: 532, top: y, width: 244, height: 44 }}
            >
              {filled ? (
                <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full items-center justify-between gap-2">
                  <span className={`font-mono text-[13px] font-semibold ${tone.text}`}>{r.method}</span>
                  <span className="text-[11px] text-slate-400">{r.note}</span>
                </motion.span>
              ) : (
                <span className="text-[11px] text-slate-600">waiting</span>
              )}
            </div>
            <Fly t={t} start={t0} dur={0.6} from={[44, y + 12]} to={[320, y + 12]} kind="ret" text={r.syntax.length > 14 ? "syntax" : r.syntax} />
            <Fly t={t} start={t0 + 0.7} dur={0.6} from={[388, y + 12]} to={[552, y + 12]} kind={tone.chip} text={r.method} />
          </div>
        );
      })}
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2: one object, two descriptions                                        */
/* -------------------------------------------------------------------------- */

function StringsScene({ t }: { t: number }) {
  const callA = t >= 0.8 && t < 3.6;
  const callB = t >= 4.2 && t < 7.0;
  const objTone = callA ? TONE.own.box : callB ? TONE.other.box : "border-white/25";
  return (
    <Backdrop>
      <motion.div animate={{ opacity: t >= 0.2 ? 1 : 0 }} className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${objTone}`} style={{ left: 300, top: 140, width: 200, height: 170 }}>
        <span className="absolute flex items-center gap-2.5" style={{ left: 14, top: 14 }}>
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/5">
            <Package className="size-5 text-slate-200" />
          </span>
          <span className="font-mono text-[15px] font-semibold text-white">product</span>
        </span>
        <p className="absolute font-mono text-[12px] text-slate-300" style={{ left: 16, top: 70 }}>
          name: "Laptop"
        </p>
        <p className="absolute font-mono text-[12px] text-slate-300" style={{ left: 16, top: 96 }}>
          price: 900
        </p>
        <p className="absolute text-[11px] text-slate-500" style={{ left: 16, top: 130 }}>
          one object, asked two ways
        </p>
      </motion.div>

      {[
        { y: 118, call: "print(product)", method: "__str__()", out: "Laptop - $900", who: "For people", icon: User, tone: "own" as Tone, at: 0.8 },
        { y: 262, call: "repr(product)", method: "__repr__()", out: "Product('Laptop', 900)", who: "For developers", icon: Terminal, tone: "other" as Tone, at: 4.2 },
      ].map((r) => {
        const Icon = r.icon;
        const tone = TONE[r.tone];
        const local = t - r.at;
        const lit = local >= 0 && local < 2.8;
        const shown = local >= 2.2;
        return (
          <div key={r.method}>
            <motion.div
              animate={{ opacity: t >= 0.3 ? 1 : 0 }}
              className={`absolute flex items-center rounded-xl border bg-slate-900 px-4 transition-colors duration-300 ${lit ? tone.box : "border-white/20"}`}
              style={{ left: 24, top: r.y, width: 232, height: 56 }}
            >
              <span className="font-mono text-[14px] text-white">{r.call}</span>
            </motion.div>
            <motion.div
              animate={{ opacity: t >= 0.5 ? 1 : 0 }}
              className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${shown ? tone.box : "border-white/20"}`}
              style={{ left: 544, top: r.y - 22, width: 232, height: 100 }}
            >
              <span className="absolute flex items-center gap-2" style={{ left: 14, top: 12 }}>
                <Icon className={`size-4 ${tone.text}`} />
                <span className="text-[12px] font-medium text-white">{r.who}</span>
                <Pill tone={r.tone}>{r.method}</Pill>
              </span>
              {shown ? (
                <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`absolute font-mono text-[13px] ${tone.text}`} style={{ left: 14, top: 56 }}>
                  {r.out}
                </motion.p>
              ) : (
                <p className="absolute text-[12px] text-slate-600" style={{ left: 14, top: 58 }}>
                  waiting for the answer
                </p>
              )}
            </motion.div>
            <Fly t={t} start={r.at + 0.2} dur={0.7} from={[40, r.y + 18]} to={[322, 214]} kind={tone.chip} text={r.method} />
            <Fly t={t} start={r.at + 1.4} dur={0.7} from={[440, 214]} to={[560, r.y + 22]} kind={tone.chip} text={r.out.length > 14 ? "text" : r.out} />
          </div>
        );
      })}

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <line x1={258} y1={146} x2={292} y2={190} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[298, 198]} deg={50} color="rgba(148,163,184,0.85)" />
        <line x1={258} y1={290} x2={292} y2={256} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[298, 250]} deg={-40} color="rgba(148,163,184,0.85)" />
        <line x1={502} y1={190} x2={536} y2={146} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[542, 138]} deg={-52} color="rgba(148,163,184,0.85)" />
        <line x1={502} y1={256} x2={536} y2={290} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[542, 296]} deg={50} color="rgba(148,163,184,0.85)" />
      </svg>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 3: size and truthiness                                                 */
/* -------------------------------------------------------------------------- */

const CARTS: { x: number; name: string; items: string[]; len: number; truthy: boolean; lenAt: number; boolAt: number }[] = [
  { x: 40, name: "cart", items: ["Laptop", "Mouse"], len: 2, truthy: true, lenAt: 1.8, boolAt: 3.4 },
  { x: 420, name: "empty_cart", items: [], len: 0, truthy: false, lenAt: 5.0, boolAt: 6.4 },
];

function SizeTruthScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      {CARTS.map((c, ci) => (
        <div key={c.name}>
          <motion.div animate={fade(t >= 0.3 + ci * 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: c.x, top: 24, width: 340, height: 190 }}>
            <span className="absolute flex items-center gap-2.5" style={{ left: 16, top: 14 }}>
              <span className="flex size-9 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-400/10">
                <ShoppingCart className="size-5 text-sky-300" />
              </span>
              <span className="font-mono text-[15px] font-semibold text-white">{c.name}</span>
            </span>
            <div className="absolute rounded-xl border-2 border-dashed border-white/15" style={{ left: 16, top: 70, width: 308, height: 100 }}>
              {c.items.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-[12px] text-slate-600">no items</span>}
              {c.items.map((it, k) =>
                t >= 0.6 + k * 0.4 ? (
                  <motion.div key={it} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="absolute" style={{ left: 14 + k * 108, top: 38 }}>
                    <Chip kind="ref">{it}</Chip>
                  </motion.div>
                ) : null,
              )}
            </div>
          </motion.div>

          {/* len(...) row */}
          <motion.div animate={fade(t >= 0.8)} className={`absolute flex items-center gap-3 rounded-xl border bg-slate-900 px-3 transition-colors duration-300 ${t - c.lenAt >= 0 && t - c.lenAt < 1.8 ? TONE.child.box : "border-white/20"}`} style={{ left: c.x, top: 232, width: 340, height: 64 }}>
            <Chip kind="ret">{ci === 0 ? "len(cart)" : "len(empty_cart)"}</Chip>
            <Pill tone="child">__len__()</Pill>
            <span className="ml-auto flex h-11 w-20 items-center justify-center rounded-lg border border-white/20 bg-slate-950 font-mono text-[24px] font-semibold text-mint">
              {t - c.lenAt >= 0.8 ? c.len : "?"}
            </span>
          </motion.div>
          {/* if ...: row */}
          <motion.div animate={fade(t >= 0.8)} className={`absolute flex items-center gap-3 rounded-xl border bg-slate-900 px-3 transition-colors duration-300 ${t - c.boolAt >= 0 && t - c.boolAt < 1.8 ? (c.truthy ? TONE.child.box : TONE.bad.box) : "border-white/20"}`} style={{ left: c.x, top: 304, width: 340, height: 64 }}>
            <Chip kind="ret">{ci === 0 ? "if cart:" : "if empty_cart:"}</Chip>
            <Pill tone="other">__bool__()</Pill>
            <span className={`ml-auto flex h-11 w-24 items-center justify-center gap-1.5 rounded-lg border bg-slate-950 font-mono text-[14px] font-semibold ${t - c.boolAt >= 0.8 ? (c.truthy ? "border-mint/40 text-mint" : "border-rose-400/40 text-rose-300") : "border-white/20 text-slate-600"}`}>
              {t - c.boolAt >= 0.8 ? (
                <>
                  {c.truthy ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {c.truthy ? "True" : "False"}
                </>
              ) : (
                "?"
              )}
            </span>
          </motion.div>

          <Fly t={t} start={c.lenAt} dur={0.7} from={[c.x + 16, 250]} to={[c.x + 120, 120]} kind="ret" text="len?" />
          <Fly t={t} start={c.boolAt} dur={0.7} from={[c.x + 16, 322]} to={[c.x + 120, 130]} kind="ret" text="truthy?" />
        </div>
      ))}

      <motion.div animate={fade(t >= 7.8)} className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 40, top: 388, width: 720, height: 44 }}>
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">Without __bool__(), Python falls back to __len__(): zero means falsey.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4: operators                                                           */
/* -------------------------------------------------------------------------- */

const OPS: {
  method: string;
  op: string;
  title: string;
  sub: string;
  tone: Tone;
  a: [string, string];
  b: [string, string];
  res: { text: string; tone: Tone }[];
}[] = [
    {
      method: "__add__()",
      op: "+",
      title: "Add",
      sub: "joins two carts",
      tone: "bad",
      a: ["cart_a", "Laptop, Mouse"],
      b: ["cart_b", "Keyboard"],
      res: [
        { text: "Laptop, Mouse,", tone: "parent" },
        { text: " Keyboard", tone: "child" },
      ],
    },
    { method: "__eq__()", op: "==", title: "Equal?", sub: "compares the SKU", tone: "parent", a: ["product1", "SKU100"], b: ["product2", "SKU100"], res: [{ text: "True", tone: "child" }] },
    { method: "__lt__()", op: "<", title: "Less than?", sub: "compares the marks", tone: "other", a: ["aman", "85"], b: ["riya", "92"], res: [{ text: "True", tone: "child" }] },
  ];

function OpsScene({ t }: { t: number }) {
  return (
    <Backdrop>
      {OPS.map((o, i) => {
        const t0 = 0.4 + i * 3.2;
        const local = t - t0;
        const started = local >= -0.2;
        const merged = local >= 0.9;
        const done = local >= 1.9;
        const pulse = local >= 0.5 && local < 1.6;
        return (
          <motion.div key={o.method} animate={{ opacity: started ? 1 : 0.4 }} transition={{ duration: 0.3 }} className="absolute inset-x-0" style={{ top: 10 + i * 130, height: 120 }}>
            <div className="absolute" style={{ left: 20, top: 22, width: 150 }}>
              <Pill tone={o.tone}>{o.method}</Pill>
              <p className="mt-1.5 text-[16px] font-medium leading-5 text-white">{o.title}</p>
              <p className="mt-0.5 text-[12px] leading-4 text-slate-400">{o.sub}</p>
            </div>

            <motion.div animate={{ x: merged ? 6 : 0, opacity: done ? 0.5 : 1 }} className={`absolute flex flex-col items-center justify-center rounded-2xl border bg-slate-900 ${TONE.parent.box}`} style={{ left: 184, top: 26, width: 130, height: 68 }}>
              <span className="font-mono text-[14px] text-white">{o.a[0]}</span>
              <span className="text-[11px] text-slate-400">{o.a[1]}</span>
            </motion.div>

            <div className="absolute flex items-center justify-center rounded-full border-2 border-white/40 bg-slate-900 font-mono text-[16px] font-semibold text-white" style={{ left: 328, top: 38, width: 46, height: 46 }}>
              {o.op}
            </div>
            {pulse && (
              <motion.span key="pulse" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.9 }} className="absolute rounded-full border-2" style={{ left: 328, top: 38, width: 46, height: 46, borderColor: TONE[o.tone].hex }} />
            )}

            <motion.div animate={{ x: merged ? -6 : 0, opacity: done ? 0.5 : 1 }} className={`absolute flex flex-col items-center justify-center rounded-2xl border bg-slate-900 ${TONE.child.box}`} style={{ left: 388, top: 26, width: 130, height: 68 }}>
              <span className="font-mono text-[14px] text-white">{o.b[0]}</span>
              <span className="text-[11px] text-slate-400">{o.b[1]}</span>
            </motion.div>

            <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={120} viewBox={`0 0 ${DESIGN_W} 120`}>
              <line x1={532} y1={60} x2={566} y2={60} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
              <Head at={[578, 60]} deg={0} color="rgba(148,163,184,0.85)" />
            </svg>

            <Fly t={local} start={1.0} dur={0.8} from={[200, 50]} to={[606, 50]} kind="ref" text={o.a[0]} />
            <Fly t={local} start={1.15} dur={0.8} from={[404, 50]} to={[690, 50]} kind="val" text={o.b[0]} />

            <motion.div animate={{ opacity: done ? 1 : 0.3, scale: done ? 1 : 0.96 }} className={`absolute flex items-center justify-center rounded-2xl border bg-slate-900 font-mono text-[12.5px] ${done ? TONE.own.box : "border-white/15"}`} style={{ left: 586, top: 26, width: 198, height: 68 }}>
              {done && (
                <span className="whitespace-pre">
                  {o.res.map((seg) => (
                    <span key={seg.text} className={TONE[seg.tone].text}>
                      {seg.text}
                    </span>
                  ))}
                </span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
      <motion.div animate={{ opacity: t >= 10.4 ? 1 : 0, y: t >= 10.4 ? 0 : 10 }} className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 24, top: 398, width: 752, height: 40 }}>
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">Unsupported operand? Return NotImplemented and Python tries the other side or raises TypeError.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 5: with blocks and for loops                                           */
/* -------------------------------------------------------------------------- */

const WITH_STEPS: { title: string; method: string | null; text: string; tone: Tone; line: string; at: number }[] = [
  { title: "Block starts", method: "__enter__()", text: "setup runs first", tone: "child", line: "Entering", at: 1.0 },
  { title: "Your block runs", method: null, text: "your own code", tone: "parent", line: "Inside with block", at: 2.8 },
  { title: "Block ends", method: "__exit__()", text: "cleanup, even after an error", tone: "other", line: "Exiting", at: 4.6 },
];
const NEXTS: { value: string; at: number; ok: boolean }[] = [
  { value: "1", at: 2.0, ok: true },
  { value: "2", at: 3.2, ok: true },
  { value: "3", at: 4.4, ok: true },
  { value: "StopIteration", at: 5.6, ok: false },
];

function ProtocolScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const latest = [...NEXTS].reverse().find((n) => n.ok && t >= n.at + 0.9);
  return (
    <Backdrop>
      {/* with */}
      <motion.div animate={fade(t >= 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 16, top: 16, width: 368, height: 418 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          with
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          Setup and cleanup around a block
        </p>
      </motion.div>
      {WITH_STEPS.map((w, i) => {
        const tone = TONE[w.tone];
        const lit = t >= w.at && t < w.at + 1.8;
        return (
          <motion.div key={w.title} animate={fade(t >= 0.5 + i * 0.1)} className={`absolute flex items-center gap-3 rounded-xl border bg-slate-950 px-3 transition-colors duration-300 ${lit ? tone.box : "border-white/20"}`} style={{ left: 36, top: 84 + i * 80, width: 328, height: 60 }}>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-white">{w.title}</span>
              <span className="text-[11px] text-slate-400">{w.text}</span>
            </div>
            {w.method && <span className="ml-auto"><Pill tone={w.tone}>{w.method}</Pill></span>}
          </motion.div>
        );
      })}
      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={200} y1={146 + i * 80} x2={200} y2={156 + i * 80} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
            <Head at={[200, 164 + i * 80]} deg={90} color="rgba(148,163,184,0.8)" />
          </g>
        ))}
      </svg>
      <div className="absolute rounded-xl border border-white/20 bg-slate-950" style={{ left: 36, top: 322, width: 328, height: 100 }}>
        <p className="absolute text-[10px] tracking-wider text-slate-500" style={{ left: 12, top: 8 }}>
          output
        </p>
        <div className="absolute flex flex-col" style={{ left: 12, top: 24 }}>
          {WITH_STEPS.map((w) =>
            t >= w.at + 0.5 ? (
              <motion.p key={w.line} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`font-mono text-[12px] leading-5 ${TONE[w.tone].text}`}>
                {w.line}
              </motion.p>
            ) : null,
          )}
        </div>
      </div>

      {/* for */}
      <motion.div animate={fade(t >= 0.4)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 416, top: 16, width: 368, height: 418 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          for
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          A loop keeps asking for the next value
        </p>
      </motion.div>
      <motion.div animate={fade(t >= 0.8)} className={`absolute flex items-center gap-3 rounded-xl border bg-slate-950 px-3 ${TONE.parent.box}`} style={{ left: 436, top: 76, width: 328, height: 54 }}>
        <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/40 bg-sky-400/10">
          <Repeat className="size-[18px] text-sky-300" />
        </span>
        <span className="font-mono text-[14px] font-semibold text-white">CountUpTo(3)</span>
        <span className="ml-auto text-[11px] text-slate-400">an iterator</span>
      </motion.div>
      {NEXTS.map((n, i) => {
        const lit = t >= n.at && t < n.at + 1.2;
        const got = t >= n.at + 0.7;
        return (
          <motion.div key={n.value} animate={fade(t >= 1.4)} className={`absolute flex items-center gap-3 rounded-xl border bg-slate-950 px-3 transition-colors duration-300 ${lit ? (n.ok ? TONE.other.box : TONE.bad.box) : "border-white/20"}`} style={{ left: 436, top: 144 + i * 50, width: 328, height: 42 }}>
            <Pill tone="other">__next__()</Pill>
            <span className="text-[12px] text-slate-500">returns</span>
            {got ? (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="ml-auto">
                <Chip kind={n.ok ? "val" : "no"}>{n.value}</Chip>
              </motion.span>
            ) : (
              <span className="ml-auto text-[12px] text-slate-600">?</span>
            )}
          </motion.div>
        );
      })}
      <motion.div animate={fade(t >= 1.4)} className="absolute flex items-center justify-between rounded-xl border border-white/20 bg-slate-950 px-4" style={{ left: 436, top: 352, width: 328, height: 64 }}>
        <span className="font-mono text-[14px] text-white">number</span>
        <span className="font-mono text-[28px] font-semibold text-mint">{latest ? latest.value : "-"}</span>
        {t >= 6.4 && <span className="absolute text-[11px] text-rose-300" style={{ left: 120, top: 22 }}>loop ends</span>}
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Intro 1: built-in objects feel natural, and your classes can too            */
/* -------------------------------------------------------------------------- */

const SAME_STYLE: { left: string; leftSub: string; right: string; rightSub: string }[] = [
  { left: "len(items)", leftSub: "a list", right: "len(cart)", rightSub: "your ShoppingCart" },
  { left: "price1 + price2", leftSub: "two numbers", right: "money1 + money2", rightSub: "your Money" },
  { left: "user1 == user2", leftSub: "two strings", right: "product1 == product2", rightSub: "your Product" },
  { left: "print(text)", leftSub: "a string", right: "print(product)", rightSub: "your Product" },
];

function SameStyleScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.2)} className="absolute rounded-2xl border border-white/20 bg-slate-900" style={{ left: 16, top: 16, width: 368, height: 366 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          Built-in objects
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          Natural to use
        </p>
      </motion.div>
      <motion.div animate={fade(t >= 2.2)} className={`absolute rounded-2xl border bg-slate-900 ${TONE.child.box}`} style={{ left: 416, top: 16, width: 368, height: 366 }}>
        <p className="absolute text-[17px] font-medium text-white" style={{ left: 20, top: 16 }}>
          Your own classes
        </p>
        <p className="absolute text-[12px] text-slate-400" style={{ left: 20, top: 40 }}>
          The same style of code
        </p>
      </motion.div>

      {SAME_STYLE.map((r, i) => {
        const y = 84 + i * 76;
        const leftAt = 0.6 + i * 0.4;
        const flyAt = 2.8 + i * 0.7;
        return (
          <div key={r.left}>
            <motion.div animate={fade(t >= leftAt)} className="absolute flex items-center justify-between rounded-xl border border-white/20 bg-slate-950 px-4" style={{ left: 36, top: y, width: 328, height: 58 }}>
              <div className="flex flex-col">
                <span className="font-mono text-[14px] text-white">{r.left}</span>
                <span className="text-[11px] text-slate-500">{r.leftSub}</span>
              </div>
              {t >= leftAt + 0.4 && <CheckCircle2 className="size-5 text-mint" />}
            </motion.div>
            <motion.div animate={fade(t >= flyAt + 0.7)} className={`absolute flex items-center justify-between rounded-xl border bg-slate-950 px-4 ${TONE.child.box}`} style={{ left: 436, top: y, width: 328, height: 58 }}>
              <div className="flex flex-col">
                <span className="font-mono text-[14px] text-white">{r.right}</span>
                <span className="text-[11px] text-slate-500">{r.rightSub}</span>
              </div>
              {t >= flyAt + 1.0 && <CheckCircle2 className="size-5 text-mint" />}
            </motion.div>
            <Fly t={t} start={flyAt} dur={0.7} from={[200, y + 18]} to={[480, y + 18]} kind="val" text="same style" />
          </div>
        );
      })}

      <motion.div animate={fade(t >= 6.6)} className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 24, top: 394, width: 752, height: 40 }}>
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">Python does this through special methods, also called dunder methods.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Intro 2: what "dunder" means                                                */
/* -------------------------------------------------------------------------- */

const DUNDER_NAMES: { name: string; note: string; tone: Tone }[] = [
  { name: "__init__()", note: "sets up a new object", tone: "parent" },
  { name: "__str__()", note: "readable text", tone: "own" },
  { name: "__repr__()", note: "developer text", tone: "other" },
  { name: "__len__()", note: "the size", tone: "child" },
  { name: "__add__()", note: "the + operator", tone: "bad" },
  { name: "__eq__()", note: "the == operator", tone: "parent" },
];

function DunderNameScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.3)} className="absolute flex items-center justify-center gap-3" style={{ left: 0, top: 22, width: DESIGN_W }}>
        <Pill tone="parent">special method</Pill>
        <span className="font-mono text-[14px] text-slate-400">=</span>
        <Pill tone="own">dunder method</Pill>
      </motion.div>

      <div className="absolute flex items-center justify-center font-mono text-[52px] font-semibold" style={{ left: 0, top: 62, width: DESIGN_W, height: 80 }}>
        <motion.span animate={{ opacity: t >= 1.0 ? 1 : 0, x: t >= 1.0 ? 0 : -90 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-amber">
          __
        </motion.span>
        <motion.span animate={{ opacity: t >= 0.6 ? 1 : 0 }} className="text-white">
          str
        </motion.span>
        <motion.span animate={{ opacity: t >= 1.0 ? 1 : 0, x: t >= 1.0 ? 0 : 90 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-amber">
          __
        </motion.span>
        <motion.span animate={{ opacity: t >= 2.4 ? 1 : 0 }} className="text-mint">
          ()
        </motion.span>
      </div>

      <motion.p animate={fade(t >= 2.0)} className="absolute text-center text-[15px] text-slate-300" style={{ left: 0, top: 150, width: DESIGN_W }}>
        <span className="text-amber">d</span>ouble <span className="text-amber">under</span>score at each end of the name
      </motion.p>
      <motion.p animate={fade(t >= 2.8)} className="absolute text-center text-[12px] text-slate-500" style={{ left: 0, top: 178, width: DESIGN_W }}>
        You will meet many of them:
      </motion.p>

      {DUNDER_NAMES.map((d, i) => {
        const tone = TONE[d.tone];
        const at = 3.2 + i * 0.4;
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <motion.div
            key={d.name}
            animate={fade(t >= at)}
            className={`absolute flex flex-col justify-center rounded-xl border bg-slate-900 px-4 ${tone.box}`}
            style={{ left: 24 + col * 252, top: 216 + row * 86, width: 232, height: 70 }}
          >
            <span className={`font-mono text-[15px] font-semibold ${tone.text}`}>{d.name}</span>
            <span className="text-[12px] text-slate-400">{d.note}</span>
          </motion.div>
        );
      })}
      <motion.p animate={fade(t >= 6.2)} className="absolute text-center text-[13px] text-slate-300" style={{ left: 0, top: 400, width: DESIGN_W }}>
        A name that begins and ends with double underscores marks a method Python knows about.
      </motion.p>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Intro 3: Python calls them, you rarely do                                   */
/* -------------------------------------------------------------------------- */

const CALL_LANES: { y: number; syntax: string; direct: boolean; at: number }[] = [
  { y: 56, syntax: "len(cart)", direct: false, at: 1.2 },
  { y: 226, syntax: "cart.__len__()", direct: true, at: 4.6 },
];

function PythonCallsScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  return (
    <Backdrop>
      {CALL_LANES.map((l, i) => {
        const local = t - l.at;
        const active = local >= 0 && local < 2.6;
        const engineOn = !l.direct && local >= 0.6 && local < 1.8;
        const answered = local >= (l.direct ? 1.0 : 1.9);
        const tone = l.direct ? TONE.bad : TONE.child;
        return (
          <div key={l.syntax}>
            <motion.div animate={fade(t >= 0.3 + i * 0.2)} className={`absolute flex flex-col justify-center rounded-xl border bg-slate-900 px-4 transition-colors duration-300 ${active ? tone.box : "border-white/20"}`} style={{ left: 24, top: l.y, width: 244, height: 66 }}>
              <span className="font-mono text-[14px] text-white">{l.syntax}</span>
              <span className={`text-[11px] ${l.direct ? "text-rose-300" : "text-mint"}`}>{l.direct ? "calling the method yourself" : "normal Python syntax"}</span>
            </motion.div>

            <motion.div
              animate={{ ...fade(t >= 0.5 + i * 0.2), opacity: t >= 0.5 + i * 0.2 ? (l.direct ? 0.35 : 1) : 0 }}
              className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${engineOn ? TONE.parent.box : "border-white/20"}`}
              style={{ left: 310, top: l.y - 6, width: 180, height: 78 }}
            >
              <span className="absolute flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/5" style={{ left: 14, top: 14 }}>
                <Cpu className="size-5 text-slate-200" />
              </span>
              <span className="absolute text-[14px] font-medium text-white" style={{ left: 60, top: 14 }}>
                Python
              </span>
              <span className="absolute text-[11px] text-slate-400" style={{ left: 60, top: 36 }}>
                {l.direct ? "skipped" : "makes the call"}
              </span>
            </motion.div>

            <motion.div animate={fade(t >= 0.7 + i * 0.2)} className={`absolute flex flex-col justify-center rounded-xl border bg-slate-900 px-4 transition-colors duration-300 ${answered ? tone.box : "border-white/20"}`} style={{ left: 536, top: l.y, width: 240, height: 66 }}>
              <span className={`font-mono text-[14px] font-semibold ${answered ? tone.text : "text-white"}`}>__len__()</span>
              <span className="text-[11px] text-slate-400">{answered ? "returns 3" : "waiting"}</span>
            </motion.div>

            {l.direct ? (
              <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
                {t >= l.at && <path d={`M 270 ${l.y + 33} L 530 ${l.y + 33}`} stroke="#fb7185" strokeWidth={3} strokeDasharray="7 6" fill="none" />}
                {t >= l.at + 0.9 && <Head at={[536, l.y + 33]} deg={0} color="#fb7185" />}
              </svg>
            ) : (
              <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
                <line x1={270} y1={l.y + 33} x2={302} y2={l.y + 33} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
                <Head at={[308, l.y + 33]} deg={0} color="rgba(148,163,184,0.85)" />
                <line x1={492} y1={l.y + 33} x2={528} y2={l.y + 33} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
                <Head at={[534, l.y + 33]} deg={0} color="rgba(148,163,184,0.85)" />
              </svg>
            )}

            {l.direct ? (
              <Fly t={t} start={l.at} dur={0.9} from={[44, l.y + 24]} to={[560, l.y + 24]} kind="no" text="direct call" />
            ) : (
              <>
                <Fly t={t} start={l.at} dur={0.6} from={[44, l.y + 24]} to={[334, l.y + 24]} kind="ret" text="len(cart)" />
                <Fly t={t} start={l.at + 1.0} dur={0.6} from={[430, l.y + 24]} to={[556, l.y + 24]} kind="val" text="__len__()" />
              </>
            )}

            <motion.span animate={{ opacity: t >= l.at + 2.0 ? 1 : 0 }} className="absolute" style={{ left: 24, top: l.y + 76 }}>
              <Pill tone={l.direct ? "bad" : "child"}>{l.direct ? "usually avoid" : "prefer this"}</Pill>
            </motion.span>
          </div>
        );
      })}

      <motion.div animate={fade(t >= 7.6)} className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 24, top: 394, width: 752, height: 40 }}>
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">You usually do not call dunder methods yourself. Python calls them when you use normal syntax.</p>
      </motion.div>
    </Backdrop>
  );
}

/* -------------------------------------------------------------------------- */
/* Intro 4: defining one teaches a class a new trick                           */
/* -------------------------------------------------------------------------- */

function TeachClassScene({ t }: { t: number }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, y: on ? 0 : 10 });
  const defined = t >= 4.8;
  const failing = t >= 2.3 && t < 5.4;
  const works = t >= 6.7;
  return (
    <Backdrop>
      <motion.div animate={fade(t >= 0.8)} className="absolute flex flex-col justify-center rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 24, top: 154, width: 214, height: 70 }}>
        <span className="font-mono text-[14px] text-white">money_a + money_b</span>
        <span className="text-[11px] text-slate-500">two Money objects</span>
      </motion.div>

      <motion.div
        animate={{ ...fade(t >= 0.4), x: failing && t < 2.9 ? [0, -9, 9, -6, 6, 0] : 0 }}
        transition={{ duration: 0.5 }}
        className={`absolute rounded-2xl border bg-slate-900 transition-colors duration-300 ${failing ? TONE.bad.box : defined ? TONE.child.box : "border-white/25"}`}
        style={{ left: 290, top: 110, width: 270, height: 170 }}
      >
        <span className="absolute flex items-center gap-2.5" style={{ left: 16, top: 14 }}>
          <span className="flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/5">
            <Package className="size-5 text-slate-200" />
          </span>
          <span className="font-mono text-[16px] font-semibold text-white">Money</span>
          <Pill tone="parent">class</Pill>
        </span>
        <div className={`absolute flex items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-300 ${defined ? `${TONE.child.box} bg-white/5` : "border-white/20"}`} style={{ left: 16, top: 70, width: 238, height: 62 }}>
          {defined ? (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <Chip kind="val">__add__()</Chip>
              <span className="mt-1 text-[11px] text-slate-400">tells Python what + means</span>
            </motion.span>
          ) : (
            <span className="text-[12px] text-slate-500">no __add__() yet</span>
          )}
        </div>
      </motion.div>

      <svg className="pointer-events-none absolute left-0 top-0" width={DESIGN_W} height={BODY_H} viewBox={`0 0 ${DESIGN_W} ${BODY_H}`}>
        <line x1={240} y1={189} x2={282} y2={189} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[288, 189]} deg={0} color="rgba(148,163,184,0.85)" />
        <line x1={562} y1={189} x2={602} y2={189} stroke="rgba(148,163,184,0.5)" strokeWidth={3} />
        <Head at={[608, 189]} deg={0} color="rgba(148,163,184,0.85)" />
      </svg>

      <Fly t={t} start={1.6} dur={0.7} from={[44, 170]} to={[320, 178]} kind="ret" text="+" />
      <Fly t={t} start={5.8} dur={0.7} from={[44, 170]} to={[320, 178]} kind="ret" text="+" />

      {failing && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-xl border bg-slate-900 p-3 ${TONE.bad.box}`} style={{ left: 614, top: 142, width: 162, height: 96 }}>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-rose-300">
            <XCircle className="size-4" /> TypeError
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">Python does not know what + means for Money.</p>
        </motion.div>
      )}
      {works && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`absolute rounded-xl border bg-slate-900 p-3 ${TONE.child.box}`} style={{ left: 614, top: 142, width: 162, height: 96 }}>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-mint">
            <CheckCircle2 className="size-4" /> It works
          </p>
          <p className="mt-1 font-mono text-[13px] text-white">Money(150)</p>
        </motion.div>
      )}

      <motion.div animate={fade(t >= 3.4 && !defined)} className="absolute rounded-xl border border-dashed border-white/25 bg-slate-900 p-3" style={{ left: 560, top: 300, width: 216, height: 70 }}>
        <p className="text-[11px] text-slate-500">you write it inside the class</p>
        <span className="mt-1.5 inline-block">
          <Chip kind="val">__add__()</Chip>
        </span>
      </motion.div>
      <Fly t={t} start={4.0} dur={0.8} from={[576, 330]} to={[370, 196]} kind="val" text="__add__()" />

      <motion.div animate={fade(t >= 7.6)} className="absolute flex items-center gap-3 rounded-xl border border-white/20 bg-slate-900 px-4" style={{ left: 24, top: 394, width: 752, height: 40 }}>
        <CheckCircle2 className="size-5 shrink-0 text-mint" />
        <p className="text-[13px] text-white">Defining __add__() lets a class decide how + behaves for its objects.</p>
      </motion.div>
    </Backdrop>
  );
}

function OverviewScene({ id, step, reduce, running }: { id: "intro" | "map"; step: number; reduce: boolean; running: boolean }) {
  // The clock restarts whenever the step changes, including when two overviews both start at step 0.
  const t = useClock(step + (id === "intro" ? 100 : 0), reduce, running);
  return (
    <div className="relative" style={{ width: DESIGN_W, height: BODY_H }}>
      <AnimatePresence mode="wait">
        {id === "intro" && step === 0 && <SameStyleScene key="i0" t={t} />}
        {id === "intro" && step === 1 && <DunderNameScene key="i1" t={t} />}
        {id === "intro" && step === 2 && <PythonCallsScene key="i2" t={t} />}
        {id === "intro" && step === 3 && <TeachClassScene key="i3" t={t} />}
        {id === "map" && step === 0 && <TranslateScene key="translate" t={t} />}
        {id === "map" && step === 1 && <StringsScene key="strings" t={t} />}
        {id === "map" && step === 2 && <SizeTruthScene key="sizetruth" t={t} />}
        {id === "map" && step === 3 && <OpsScene key="ops" t={t} />}
        {id === "map" && step === 4 && <ProtocolScene key="protocol" t={t} />}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Entries: the overview first, then the code slides                           */
/* -------------------------------------------------------------------------- */

type OvStep = { label: string; note: string; ms: number };
type Overview = { kind: "overview"; id: "intro" | "map"; eyebrow: string; title: string; steps: OvStep[] };
type CodeEntry = Slide & { kind: "code" };
type Entry = Overview | CodeEntry;

const OVERVIEW: Overview = {
  kind: "overview",
  id: "map",
  eyebrow: "The big picture",
  title: "The dunder translation engine",
  steps: [
    {
      label: "Translation",
      ms: 13600,
      note: "Python turns familiar syntax into calls to special methods. You write len(cart) and Python calls cart.__len__() for you.",
    },
    {
      label: "str and repr",
      ms: 9400,
      note: "__str__() gives a readable description for print(). __repr__() gives an exact one for developers and debugging.",
    },
    {
      label: "Size and truth",
      ms: 10200,
      note: "len(cart) calls __len__(), and if cart: calls __bool__(). Without __bool__(), a length of zero makes an object falsey.",
    },
    {
      label: "Operators",
      ms: 12400,
      note: "Operators map to methods: + calls __add__(), == calls __eq__(), < calls __lt__(). Return NotImplemented for operands you do not support.",
    },
    {
      label: "with and for",
      ms: 9400,
      note: "A with block calls __enter__() and __exit__(). A for loop calls __next__() until StopIteration says there are no values left.",
    },
  ],
};

const INTRO: Overview = {
  kind: "overview",
  id: "intro",
  eyebrow: "What are special methods?",
  title: "Making your classes feel like built-ins",
  steps: [
    {
      label: "Built-in feel",
      ms: 9200,
      note: "Built-in objects are natural to use: len(items), price1 + price2, user1 == user2, print(product). Your own classes can support the same style of code.",
    },
    {
      label: "What is dunder?",
      ms: 9400,
      note: "Special methods are commonly called dunder methods, short for double underscore, because their names begin and end with two underscores.",
    },
    {
      label: "Python calls them",
      ms: 10400,
      note: "You usually do not call these methods directly. Python calls them for you when you use normal syntax, so prefer len(cart) over cart.__len__().",
    },
    {
      label: "Teach a class",
      ms: 9800,
      note: "Python's data model connects syntax to your classes. Defining __add__() lets a class decide how the + operator behaves for its objects.",
    },
  ],
};

const ENTRIES: Entry[] = [INTRO, OVERVIEW, ...slides.map((s): Entry => ({ kind: "code", ...s }))];

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

export function SpecialMethodsCustomAnimation() {
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
                <OverviewScene id={entry.id} step={at} reduce={reduce} running={!frozen} />
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

// The lesson page may still register the earlier component name.
export const DunderMethodsCustomAnimation = SpecialMethodsCustomAnimation;