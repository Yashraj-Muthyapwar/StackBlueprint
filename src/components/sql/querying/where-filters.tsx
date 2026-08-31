import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- q-bool: AND, OR, NOT, combined -----
const PRODUCTS: Row[] = [
  r(1, 1, "Pen", 3, "true", "office"),
  r(2, 2, "Notebook", 25, "true", "office"),
  r(3, 3, "Keyboard", 120, "false", "tech"),
  r(4, 4, "Monitor", 320, "true", "tech"),
  r(5, 5, "Sticker", 2, "true", "sale"),
  r(6, 6, "Mouse", 45, "false", "tech"),
];
const PCOLS = ["id", "name", "price", "stock", "cat"];

export const boolStages: Stage[] = [
  {
    name: "AND",
    blurb: "Both predicates must be TRUE",
    sql: [
      "SELECT id, name, price, stock",
      "FROM   products",
      "WHERE  price > 50",
      "       AND stock = true",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Source table — 6 rows enter the WHERE operator."),
      st(
        [2],
        pass((r) => Number(r.cells[2]) > 50),
        "price > 50 keeps 3 rows. price is a scalar predicate — short, no NULLs here.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "AND short-circuits: Mouse already failed price; Keyboard now fails stock=false. 2 survivors.",
        { highlightCols: [2, 3] },
      ),
    ],
  },
  {
    name: "OR",
    blurb: "Either predicate TRUE keeps the row",
    sql: [
      "SELECT id, name, price, cat",
      "FROM   products",
      "WHERE  price < 10",
      "       OR cat = 'sale'",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Same source rows; we replace the predicate."),
      st(
        [2],
        pass((r) => Number(r.cells[2]) < 10),
        "price < 10 alone — only Pen and Sticker qualify.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => Number(r.cells[2]) < 10 || r.cells[4] === "sale"),
        "Add OR cat='sale'. Sticker was already in; nothing new is added — overlap demonstrates UNION-like semantics.",
        { highlightCols: [2, 4] },
      ),
    ],
  },
  {
    name: "NOT",
    blurb: "Negation flips TRUE↔FALSE (and UNKNOWN stays UNKNOWN)",
    sql: ["SELECT id, name, cat", "FROM   products", "WHERE  NOT cat = 'tech'"],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "All 6 rows pre-filter."),
      st(
        [2],
        pass((r) => r.cells[4] !== "tech"),
        "NOT cat='tech' = (cat <> 'tech'). 3 tech rows fall away. Important: if cat were NULL, NOT NULL is still UNKNOWN — row would drop.",
        { highlightCols: [4], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Combined precedence",
    blurb: "AND binds tighter than OR — parenthesise!",
    sql: [
      "SELECT id, name, price, stock, cat",
      "FROM   products",
      "WHERE  (price > 50 AND stock = true)",
      "       OR cat = 'sale'",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "Inner AND first: Monitor passes (320 & true). Keyboard fails (stock). 1 row.",
        { highlightCols: [2, 3] },
      ),
      st(
        [3],
        pass((r) => (Number(r.cells[2]) > 50 && r.cells[3] === "true") || r.cells[4] === "sale"),
        "OR cat='sale' rescues Sticker even though it failed the AND. Final: 2 rows.",
        { highlightCols: [2, 3, 4] },
      ),
      st(
        [2, 3],
        pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "Drop the parens and SQL evaluates as price>50 AND (stock=true OR cat='sale') — totally different result. Always parenthesise mixed AND/OR.",
        { noteTone: "rose" },
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
