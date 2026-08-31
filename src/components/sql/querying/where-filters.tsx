import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- q-bool: AND, OR, NOT, combined -----
const PRODUCTS: Row[] = [
  r(2, 2, "Trailhead 29 Carbon", "Mountain Bikes", 2450, 113),
  r(4, 4, "Switchback Enduro", "Mountain Bikes", 4150, 10),
  r(6, 6, "Meridian Road Carbon", "Road Bikes", 2890, 65),
  r(7, 7, "Aero Sprint Pro", "Road Bikes", 5400, 99),
  r(8, 8, "Gravel Runner GX", "Road Bikes", 1980, 122),
];
const PCOLS = ["id", "name", "category", "price", "in_stock"];

export const boolStages: Stage[] = [
  {
    name: "AND",
    blurb: "Both predicates must be TRUE",
    sql: [
      "SELECT name, price, in_stock",
      "FROM   products",
      "WHERE  category = 'Road Bikes'",
      "       AND in_stock >= 90",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Five real Cycle Depot products enter the WHERE filter."),
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes"),
        "The category check keeps the three Road Bikes. The other two rows do not pass this condition.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90),
        "AND asks for both conditions. Aero Sprint Pro and Gravel Runner GX are Road Bikes with at least 90 units in stock.",
        { highlightCols: [2, 4] },
      ),
    ],
  },
  {
    name: "OR",
    blurb: "Either predicate TRUE keeps the row",
    sql: [
      "SELECT name, category, price",
      "FROM   products",
      "WHERE  category = 'Road Bikes'",
      "       OR price >= 4000",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Start with the same five Cycle Depot products."),
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes"),
        "The first branch keeps the three Road Bikes.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => r.cells[2] === "Road Bikes" || Number(r.cells[3]) >= 4000),
        "OR needs only one true branch. Switchback Enduro joins the result because its price is at least 4000.",
        { highlightCols: [2, 3] },
      ),
    ],
  },
  {
    name: "NOT",
    blurb: "Negation excludes matching rows",
    sql: ["SELECT name, category", "FROM   products", "WHERE  NOT category = 'Road Bikes'"],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "All five products are candidates before negation."),
      st(
        [2],
        pass((r) => r.cells[2] !== "Road Bikes"),
        "NOT reverses the category test. The two Mountain Bikes remain; every Road Bike is excluded.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Combined precedence",
    blurb: "Parentheses make mixed logic explicit",
    sql: [
      "SELECT name, category, price, in_stock",
      "FROM   products",
      "WHERE  (category = 'Road Bikes' AND in_stock >= 90)",
      "       OR (NOT category = 'Road Bikes' AND price >= 4000)",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90),
        "First group: Road Bikes with at least 90 units. Aero Sprint Pro and Gravel Runner GX pass.",
        { highlightCols: [2, 4] },
      ),
      st(
        [3],
        pass((r) => (r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90) || (r.cells[2] !== "Road Bikes" && Number(r.cells[3]) >= 4000)),
        "Second group: non-Road Bikes priced at least 4000. Switchback Enduro passes, so the final result has three products.",
        { highlightCols: [2, 3, 4] },
      ),
      st(
        [2, 3],
        pass((r) => (r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90) || (r.cells[2] !== "Road Bikes" && Number(r.cells[3]) >= 4000)),
        "SQL gives NOT priority, then AND, then OR. The parentheses show the business rule clearly, which makes mixed conditions safer to review and change.",
        { noteTone: "violet" },
      ),
    ],
  },
];

// ----- q-range: IN, BETWEEN, NOT IN, combined -----
const ORDERS_R: Row[] = [
  r(1, 101, "Ada", 45, "paid"),
  r(2, 102, "Linus", 120, "paid"),
  r(3, 103, "Grace", 8, "pending"),
  r(4, 104, "Bob", 75, "shipped"),
  r(5, 105, "Alan", 250, "refund"),
  r(6, 106, "Eve", 180, "shipped"),
];
const RCOLS = ["id", "customer", "total", "status"];

export const rangeStages: Stage[] = [
  {
    name: "IN list",
    blurb: "Membership test — equivalent to chained OR",
    sql: ["SELECT id, customer, status", "FROM   orders", "WHERE  status IN ('paid','shipped')"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st([0, 1], "pending", "Raw orders table."),
      st(
        [2],
        pass((r) => ["paid", "shipped"].includes(String(r.cells[3]))),
        "IN compiles to a hash probe for >5 elements. Grace (pending) and Alan (refund) fall away.",
        { highlightCols: [3] },
      ),
    ],
  },
  {
    name: "BETWEEN",
    blurb: "Inclusive range — equivalent to total >= a AND total <= b",
    sql: ["SELECT id, customer, total", "FROM   orders", "WHERE  total BETWEEN 50 AND 200"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st(
        [2],
        pass((r) => Number(r.cells[2]) >= 50 && Number(r.cells[2]) <= 200),
        "BETWEEN is INCLUSIVE on BOTH ends. Use a B-Tree range scan when total is indexed.",
        { highlightCols: [2] },
      ),
      st(
        [2],
        pass((r) => Number(r.cells[2]) >= 50 && Number(r.cells[2]) <= 200),
        "Watch out: BETWEEN with dates is a classic bug — '2026-06-30' excludes anything after midnight that day. Prefer half-open ranges (>= a AND < b).",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "NOT IN (NULL trap)",
    blurb: "NULL inside the list silently empties the result",
    sql: ["SELECT id, customer, status", "FROM   orders", "WHERE  status NOT IN ('refund', NULL)"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st(
        [2],
        () => "dropped" as RowState,
        "NOT IN expands to status<>'refund' AND status<>NULL. The second comparison is UNKNOWN for every row → 3VL drops everything. ZERO rows returned.",
        { highlightCols: [3], noteTone: "rose" },
      ),
    ],
  },
  {
    name: "Fix: filter NULLs first",
    blurb: "Rewrite with an explicit IS NOT NULL — or use NOT EXISTS",
    sql: [
      "SELECT id, customer, status",
      "FROM   orders",
      "WHERE  status <> 'refund'",
      "       AND status IS NOT NULL",
    ],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st(
        [2, 3],
        pass((r) => r.cells[3] !== "refund" && r.cells[3] !== null),
        "Now the predicate is TRUE/FALSE — never UNKNOWN. 5 rows survive; only Alan (refund) drops.",
        { highlightCols: [3], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Combined",
    blurb: "Both predicates in a real query",
    sql: [
      "SELECT id, customer, total, status",
      "FROM   orders",
      "WHERE  total BETWEEN 50 AND 200",
      "       AND status IN ('paid','shipped')",
    ],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st(
        [2, 3],
        pass(
          (r) =>
            Number(r.cells[2]) >= 50 &&
            Number(r.cells[2]) <= 200 &&
            ["paid", "shipped"].includes(String(r.cells[3])),
        ),
        "Range + set together. Optimiser picks the more selective predicate first; here status IN (2 of 4 values) wins.",
        { highlightCols: [2, 3] },
      ),
    ],
  },
];

// ----- q-like: %, _, ILIKE, anchored -----
const USERS_L: Row[] = [
  r(1, 1, "Alice", "alice@gmail.com"),
  r(2, 2, "alex", "alex@yahoo.com"),
  r(3, 3, "Bob", "bob@gmail.com"),
  r(4, 4, "Aria", "aria@outlook.com"),
  r(5, 5, "Charlie", "charlie@gmail.com"),
  r(6, 6, "amber", "amber@protonmail.io"),
];
const LCOLS = ["id", "name", "email"];

export const likeStages: Stage[] = [
  {
    name: "% wildcard (any sequence)",
    sql: ["SELECT id, name, email", "FROM   users", "WHERE  email LIKE '%@gmail.com'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st([0, 1], "pending", "Raw users table."),
      st(
        [2],
        pass((r) => String(r.cells[2]).endsWith("@gmail.com")),
        "LEADING % defeats any B-Tree index on email — full scan required.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "_ wildcard (single char)",
    sql: ["SELECT id, name", "FROM   users", "WHERE  name LIKE 'A_i%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st(
        [2],
        pass((r) => /^A.i/.test(String(r.cells[1]))),
        "_ matches exactly one character. 'Alice' (A-l-i…) and 'Aria' (A-r-i…) match; 'Alex' (lowercase a) does not.",
        { highlightCols: [1] },
      ),
    ],
  },
  {
    name: "ILIKE (case-insensitive)",
    sql: ["SELECT id, name", "FROM   users", "WHERE  name ILIKE 'a%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st(
        [2],
        pass((r) => String(r.cells[1]).toLowerCase().startsWith("a")),
        "ILIKE upper-cases both sides before matching. Postgres-only; portable equivalent: LOWER(col) LIKE 'a%' (but kills B-Tree unless you index LOWER(col)).",
        { highlightCols: [1] },
      ),
    ],
  },
  {
    name: "Anchored vs scan",
    blurb: "Index uses depend on wildcard position",
    sql: ["SELECT id, email", "FROM   users", "WHERE  email LIKE 'a%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st(
        [2],
        pass((r) => String(r.cells[2]).startsWith("a")),
        "TRAILING %, no leading wildcard → B-Tree range scan: WHERE email >= 'a' AND email < 'b'. Fast even on huge tables.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
];

// ----- q-null3vl: = NULL fails, IS NULL, NOT IN NULL, COALESCE -----
const EMP_N: Row[] = [
  r(1, 1, "Ada", 0),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", null),
  r(4, 4, "Bob", 2),
  r(5, 5, "Eve", null),
];
const NCOLS = ["id", "name", "manager_id"];

export const null3vlStages: Stage[] = [
  {
    name: "= NULL silently fails",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id = NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        () => "dropped" as RowState,
        "Every comparison with NULL returns UNKNOWN — never TRUE. ZERO rows. Beginners' #1 surprise.",
        { highlightCols: [2], noteTone: "rose" },
      ),
    ],
  },
  {
    name: "IS NULL is the only test",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id IS NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        pass((r) => r.cells[2] === null),
        "IS NULL / IS NOT NULL return TRUE/FALSE — never UNKNOWN. Grace and Eve surface.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "<> 1 hides NULL rows",
    sql: ["SELECT id, name, manager_id", "FROM   employees", "WHERE  manager_id <> 1"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        pass((r) => (r.cells[2] === null ? false : r.cells[2] !== 1)),
        "manager_id<>1 evaluates UNKNOWN for NULL rows → dropped. Grace and Eve vanish silently — usually a bug.",
        { highlightCols: [2], noteTone: "amber" },
      ),
      st(
        [2, 3],
        pass((r) => (r.cells[2] === null ? true : r.cells[2] !== 1)),
        "Add OR manager_id IS NULL — now NULL rows are explicitly included.",
        { highlightCols: [2], rowsOverride: EMP_N, noteTone: "mint" },
      ),
    ],
  },
  {
    name: "COALESCE in SELECT",
    sql: ["SELECT id, name,", "       COALESCE(manager_id, -1) AS mgr", "FROM   employees"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [1],
        "added",
        "COALESCE returns the first non-NULL argument. NULL manager_ids become -1 — useful for reports and ORDER BY (NULLs sort to extremes).",
        {
          rowsOverride: EMP_N.map((row) =>
            r(row.key, row.cells[0]!, row.cells[1]!, row.cells[2] === null ? -1 : row.cells[2]!),
          ),
          colsOverride: ["id", "name", "mgr"],
        },
      ),
    ],
  },
];

// ============================================================
// Module 2: Aggregations
// ============================================================
