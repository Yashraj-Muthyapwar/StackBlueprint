import type { Row, Stage, StageStep, RowState, Tone } from "@/components/sql/MultiStage";

/**
 * Declarative stage registry for all SQL animation variants.
 * Each variant breaks down ONE lesson into 3–4 concept stages so learners
 * see each idea in isolation before the combined finale.
 */

// ---------- Tiny DSL ----------

const r = (key: string | number, ...cells: (string | number | null)[]): Row => ({ key, cells });

const st = (
  activeLines: number[],
  rowState: ((row: Row, i: number) => RowState | undefined) | RowState,
  note: string,
  extra: Partial<StageStep> = {},
): StageStep => ({
  activeLines,
  note,
  rowState: typeof rowState === "function" ? rowState : () => rowState,
  ...extra,
});

const pass = (predicate: (row: Row, i: number) => boolean | null) =>
  (row: Row, i: number): RowState | undefined => {
    const p = predicate(row, i);
    return p === null ? "pending" : p ? "kept" : "dropped";
  };

// ============================================================
// QUERYING — Module 1: Filtering & Predicates
// ============================================================

// ----- q-bool: AND, OR, NOT, combined -----
const PRODUCTS: Row[] = [
  r(1, 1, "Pen",      3,   "true",  "office"),
  r(2, 2, "Notebook", 25,  "true",  "office"),
  r(3, 3, "Keyboard", 120, "false", "tech"),
  r(4, 4, "Monitor",  320, "true",  "tech"),
  r(5, 5, "Sticker",  2,   "true",  "sale"),
  r(6, 6, "Mouse",    45,  "false", "tech"),
];
const PCOLS = ["id", "name", "price", "stock", "cat"];

const boolStages: Stage[] = [
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
      st([0,1], "pending", "Source table — 6 rows enter the WHERE operator."),
      st([2], pass((r) => Number(r.cells[2]) > 50), "price > 50 keeps 3 rows. price is a scalar predicate — short, no NULLs here.", { highlightCols: [2] }),
      st([2,3], pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "AND short-circuits: Mouse already failed price; Keyboard now fails stock=false. 2 survivors.", { highlightCols: [2,3] }),
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
      st([0,1], "pending", "Same source rows; we replace the predicate."),
      st([2], pass((r) => Number(r.cells[2]) < 10), "price < 10 alone — only Pen and Sticker qualify.", { highlightCols: [2] }),
      st([2,3], pass((r) => Number(r.cells[2]) < 10 || r.cells[4] === "sale"),
        "Add OR cat='sale'. Sticker was already in; nothing new is added — overlap demonstrates UNION-like semantics.", { highlightCols: [2,4] }),
    ],
  },
  {
    name: "NOT",
    blurb: "Negation flips TRUE↔FALSE (and UNKNOWN stays UNKNOWN)",
    sql: [
      "SELECT id, name, cat",
      "FROM   products",
      "WHERE  NOT cat = 'tech'",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0,1], "pending", "All 6 rows pre-filter."),
      st([2], pass((r) => r.cells[4] !== "tech"),
        "NOT cat='tech' = (cat <> 'tech'). 3 tech rows fall away. Important: if cat were NULL, NOT NULL is still UNKNOWN — row would drop.", { highlightCols: [4], noteTone: "amber" }),
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
      st([2], pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "Inner AND first: Monitor passes (320 & true). Keyboard fails (stock). 1 row.", { highlightCols: [2,3] }),
      st([3], pass((r) => (Number(r.cells[2]) > 50 && r.cells[3] === "true") || r.cells[4] === "sale"),
        "OR cat='sale' rescues Sticker even though it failed the AND. Final: 2 rows.", { highlightCols: [2,3,4] }),
      st([2,3], pass((r) => Number(r.cells[2]) > 50 && r.cells[3] === "true"),
        "Drop the parens and SQL evaluates as price>50 AND (stock=true OR cat='sale') — totally different result. Always parenthesise mixed AND/OR.",
        { noteTone: "rose" }),
    ],
  },
];

// ----- q-range: IN, BETWEEN, NOT IN, combined -----
const ORDERS_R: Row[] = [
  r(1, 101, "Ada",   45,  "paid"),
  r(2, 102, "Linus", 120, "paid"),
  r(3, 103, "Grace", 8,   "pending"),
  r(4, 104, "Bob",   75,  "shipped"),
  r(5, 105, "Alan",  250, "refund"),
  r(6, 106, "Eve",   180, "shipped"),
];
const RCOLS = ["id", "customer", "total", "status"];

const rangeStages: Stage[] = [
  {
    name: "IN list",
    blurb: "Membership test — equivalent to chained OR",
    sql: ["SELECT id, customer, status", "FROM   orders", "WHERE  status IN ('paid','shipped')"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st([0,1], "pending", "Raw orders table."),
      st([2], pass((r) => ["paid","shipped"].includes(String(r.cells[3]))),
        "IN compiles to a hash probe for >5 elements. Grace (pending) and Alan (refund) fall away.", { highlightCols: [3] }),
    ],
  },
  {
    name: "BETWEEN",
    blurb: "Inclusive range — equivalent to total >= a AND total <= b",
    sql: ["SELECT id, customer, total", "FROM   orders", "WHERE  total BETWEEN 50 AND 200"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st([2], pass((r) => Number(r.cells[2]) >= 50 && Number(r.cells[2]) <= 200),
        "BETWEEN is INCLUSIVE on BOTH ends. Use a B-Tree range scan when total is indexed.", { highlightCols: [2] }),
      st([2], pass((r) => Number(r.cells[2]) >= 50 && Number(r.cells[2]) <= 200),
        "Watch out: BETWEEN with dates is a classic bug — '2026-06-30' excludes anything after midnight that day. Prefer half-open ranges (>= a AND < b).",
        { noteTone: "amber" }),
    ],
  },
  {
    name: "NOT IN (NULL trap)",
    blurb: "NULL inside the list silently empties the result",
    sql: ["SELECT id, customer, status", "FROM   orders", "WHERE  status NOT IN ('refund', NULL)"],
    table: { name: "orders", cols: RCOLS, rows: ORDERS_R },
    steps: [
      st([2], () => "dropped" as RowState,
        "NOT IN expands to status<>'refund' AND status<>NULL. The second comparison is UNKNOWN for every row → 3VL drops everything. ZERO rows returned.",
        { highlightCols: [3], noteTone: "rose" }),
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
      st([2,3], pass((r) => r.cells[3] !== "refund" && r.cells[3] !== null),
        "Now the predicate is TRUE/FALSE — never UNKNOWN. 5 rows survive; only Alan (refund) drops.",
        { highlightCols: [3], noteTone: "mint" }),
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
      st([2,3], pass((r) => Number(r.cells[2]) >= 50 && Number(r.cells[2]) <= 200 && ["paid","shipped"].includes(String(r.cells[3]))),
        "Range + set together. Optimiser picks the more selective predicate first; here status IN (2 of 4 values) wins.", { highlightCols: [2,3] }),
    ],
  },
];

// ----- q-like: %, _, ILIKE, anchored -----
const USERS_L: Row[] = [
  r(1, 1, "Alice",   "alice@gmail.com"),
  r(2, 2, "alex",    "alex@yahoo.com"),
  r(3, 3, "Bob",     "bob@gmail.com"),
  r(4, 4, "Aria",    "aria@outlook.com"),
  r(5, 5, "Charlie", "charlie@gmail.com"),
  r(6, 6, "amber",   "amber@protonmail.io"),
];
const LCOLS = ["id", "name", "email"];

const likeStages: Stage[] = [
  {
    name: "% wildcard (any sequence)",
    sql: ["SELECT id, name, email", "FROM   users", "WHERE  email LIKE '%@gmail.com'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st([0,1], "pending", "Raw users table."),
      st([2], pass((r) => String(r.cells[2]).endsWith("@gmail.com")),
        "LEADING % defeats any B-Tree index on email — full scan required.", { highlightCols: [2], noteTone: "amber" }),
    ],
  },
  {
    name: "_ wildcard (single char)",
    sql: ["SELECT id, name", "FROM   users", "WHERE  name LIKE 'A_i%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st([2], pass((r) => /^A.i/.test(String(r.cells[1]))),
        "_ matches exactly one character. 'Alice' (A-l-i…) and 'Aria' (A-r-i…) match; 'Alex' (lowercase a) does not.", { highlightCols: [1] }),
    ],
  },
  {
    name: "ILIKE (case-insensitive)",
    sql: ["SELECT id, name", "FROM   users", "WHERE  name ILIKE 'a%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st([2], pass((r) => String(r.cells[1]).toLowerCase().startsWith("a")),
        "ILIKE upper-cases both sides before matching. Postgres-only; portable equivalent: LOWER(col) LIKE 'a%' (but kills B-Tree unless you index LOWER(col)).", { highlightCols: [1] }),
    ],
  },
  {
    name: "Anchored vs scan",
    blurb: "Index uses depend on wildcard position",
    sql: ["SELECT id, email", "FROM   users", "WHERE  email LIKE 'a%'"],
    table: { name: "users", cols: LCOLS, rows: USERS_L },
    steps: [
      st([2], pass((r) => String(r.cells[2]).startsWith("a")),
        "TRAILING %, no leading wildcard → B-Tree range scan: WHERE email >= 'a' AND email < 'b'. Fast even on huge tables.",
        { highlightCols: [2], noteTone: "mint" }),
    ],
  },
];

// ----- q-null3vl: = NULL fails, IS NULL, NOT IN NULL, COALESCE -----
const EMP_N: Row[] = [
  r(1, 1, "Ada",   0),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", null),
  r(4, 4, "Bob",   2),
  r(5, 5, "Eve",   null),
];
const NCOLS = ["id", "name", "manager_id"];

const null3vlStages: Stage[] = [
  {
    name: "= NULL silently fails",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id = NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st([2], () => "dropped" as RowState,
        "Every comparison with NULL returns UNKNOWN — never TRUE. ZERO rows. Beginners' #1 surprise.",
        { highlightCols: [2], noteTone: "rose" }),
    ],
  },
  {
    name: "IS NULL is the only test",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id IS NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st([2], pass((r) => r.cells[2] === null),
        "IS NULL / IS NOT NULL return TRUE/FALSE — never UNKNOWN. Grace and Eve surface.", { highlightCols: [2], noteTone: "mint" }),
    ],
  },
  {
    name: "<> 1 hides NULL rows",
    sql: ["SELECT id, name, manager_id", "FROM   employees", "WHERE  manager_id <> 1"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st([2], pass((r) => r.cells[2] === null ? false : r.cells[2] !== 1),
        "manager_id<>1 evaluates UNKNOWN for NULL rows → dropped. Grace and Eve vanish silently — usually a bug.",
        { highlightCols: [2], noteTone: "amber" }),
      st([2,3], pass((r) => r.cells[2] === null ? true : r.cells[2] !== 1),
        "Add OR manager_id IS NULL — now NULL rows are explicitly included.",
        { highlightCols: [2], rowsOverride: EMP_N, noteTone: "mint" }),
    ],
  },
  {
    name: "COALESCE in SELECT",
    sql: [
      "SELECT id, name,",
      "       COALESCE(manager_id, -1) AS mgr",
      "FROM   employees",
    ],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st([1], "added",
        "COALESCE returns the first non-NULL argument. NULL manager_ids become -1 — useful for reports and ORDER BY (NULLs sort to extremes).",
        { rowsOverride: EMP_N.map((row) => r(row.key, row.cells[0]!, row.cells[1]!, row.cells[2] === null ? -1 : row.cells[2]!)), colsOverride: ["id","name","mgr"] }),
    ],
  },
];

// ============================================================
// Module 2: Aggregations
// ============================================================

// ----- q-aggr: COUNT(*), COUNT(col), SUM/AVG, MIN/MAX -----
const SALES_A: Row[] = [
  r(1, 1, "EU",   40),
  r(2, 2, "US",   null),
  r(3, 3, "EU",   25),
  r(4, 4, "APAC", 90),
  r(5, 5, "US",   110),
  r(6, 6, "EU",   null),
];
const ACOLS = ["id", "region", "amount"];

const sumPanel = (label: string, value: string) => (
  <div className="rounded-lg border border-mint/40 bg-mint/10 p-3">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mint">{label}</div>
    <div className="mt-1 font-mono text-2xl text-mint">= {value}</div>
  </div>
);

const aggrStages: Stage[] = [
  {
    name: "COUNT(*) — every row",
    sql: ["SELECT COUNT(*) AS n", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st([0], () => "kept" as RowState,
        "COUNT(*) counts ROWS, not values. NULLs are NOT skipped — 6 rows total.",
        { side: sumPanel("COUNT(*)", "6") }),
    ],
  },
  {
    name: "COUNT(col) — skips NULL",
    sql: ["SELECT COUNT(amount) AS n", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st([0], (row) => row.cells[2] === null ? "dropped" as RowState : "kept" as RowState,
        "COUNT(col) counts non-NULL VALUES of that column. The two NULL amounts are skipped → 4.",
        { highlightCols: [2], side: sumPanel("COUNT(amount)", "4") }),
    ],
  },
  {
    name: "SUM / AVG — beware NULL",
    sql: [
      "SELECT SUM(amount) AS total,",
      "       AVG(amount) AS mean",
      "FROM   sales",
    ],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st([0], (row) => row.cells[2] === null ? "dropped" as RowState : "kept" as RowState,
        "SUM/AVG ignore NULLs. AVG = SUM/COUNT(col), NOT COUNT(*) — different denominator! 265/4 = 66.25, not 265/6.",
        { highlightCols: [2], side: sumPanel("SUM / AVG", "$265 / $66.25"), noteTone: "amber" }),
    ],
  },
  {
    name: "MIN / MAX",
    sql: ["SELECT MIN(amount), MAX(amount)", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st([0], (row) => row.cells[2] === null ? "dropped" as RowState : "kept" as RowState,
        "Extremes over non-NULL values. MIN/MAX use an index endpoint if one exists — O(log n), not O(n).",
        { highlightCols: [2], side: sumPanel("MIN / MAX", "$25 / $110") }),
    ],
  },
];

// ----- q-grpby: single key, multi key, with aggregate -----
const SALES_G: Row[] = [
  r(1, 1, "EU",   "Q1", 40),
  r(2, 2, "EU",   "Q2", 25),
  r(3, 3, "US",   "Q1", 90),
  r(4, 4, "US",   "Q2", 110),
  r(5, 5, "APAC", "Q1", 60),
  r(6, 6, "EU",   "Q1", 55),
];
const GCOLS = ["id", "region", "quarter", "amount"];

const bucketPanel = (groups: { k: string; sum: number }[]) => (
  <div className="grid gap-2">
    {groups.map((g) => (
      <div key={g.k} className="flex items-center justify-between rounded-md border border-violet/40 bg-violet/5 px-3 py-2 font-mono text-[12px]">
        <span className="text-violet">{g.k}</span>
        <span className="text-mint">Σ = ${g.sum}</span>
      </div>
    ))}
  </div>
);

const grpStages: Stage[] = [
  {
    name: "Single-key bucketing",
    sql: ["SELECT region, SUM(amount) AS total", "FROM   sales", "GROUP  BY region"],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st([2], () => "kept" as RowState,
        "Hash each row on region → 3 buckets (EU, US, APAC).",
        { highlightCols: [1] }),
      st([0,2], () => "kept" as RowState,
        "Reduce each bucket: SUM(amount). One output row per group.",
        { highlightCols: [1,3], side: bucketPanel([{k:"EU",sum:120},{k:"US",sum:200},{k:"APAC",sum:60}]) }),
    ],
  },
  {
    name: "Multi-key bucketing",
    sql: ["SELECT region, quarter, SUM(amount)", "FROM   sales", "GROUP  BY region, quarter"],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st([2], () => "kept" as RowState,
        "Composite key (region, quarter). EU+Q1 has two rows; EU+Q2 one — 5 buckets.",
        { highlightCols: [1,2] }),
      st([0,2], () => "kept" as RowState,
        "Multi-dim grouping. Output cardinality = distinct(region,quarter) tuples.",
        { side: bucketPanel([{k:"EU·Q1",sum:95},{k:"EU·Q2",sum:25},{k:"US·Q1",sum:90},{k:"US·Q2",sum:110},{k:"APAC·Q1",sum:60}]) }),
    ],
  },
  {
    name: "Every non-aggregated column must be in GROUP BY",
    sql: [
      "SELECT region, quarter, amount  -- ERROR",
      "FROM   sales",
      "GROUP  BY region",
    ],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st([0], () => "dropped" as RowState,
        "Standard-SQL error: 'quarter' / 'amount' not in GROUP BY and not aggregated. Postgres/Oracle reject; MySQL ONLY_FULL_GROUP_BY off picks an arbitrary row — silent data corruption.",
        { highlightCols: [2,3], noteTone: "rose" }),
    ],
  },
];

// ----- q-having: WHERE only, GROUP BY, HAVING, combined -----
const ORD_H: Row[] = [
  r(1, 1, "Ada",   45,  "paid"),
  r(2, 2, "Linus", 120, "paid"),
  r(3, 3, "Grace", 30,  "pending"),
  r(4, 4, "Ada",   80,  "paid"),
  r(5, 5, "Bob",   50,  "paid"),
  r(6, 6, "Linus", 75,  "paid"),
];
const HCOLS = ["id", "customer", "total", "status"];

const havingStages: Stage[] = [
  {
    name: "WHERE filters rows",
    sql: ["SELECT id, customer, total, status", "FROM   orders", "WHERE  status = 'paid'"],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([2], pass((r) => r.cells[3] === "paid"),
        "WHERE runs BEFORE grouping — operates on raw rows. Grace's pending order drops here.",
        { highlightCols: [3] }),
    ],
  },
  {
    name: "GROUP BY collapses",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([3], pass((r) => r.cells[3] === "paid"),
        "Surviving rows bucket by customer. Aggregates compute per bucket.",
        { highlightCols: [1], side: bucketPanel([{k:"Ada",sum:125},{k:"Linus",sum:195},{k:"Bob",sum:50}]) }),
      st([0,3], "added",
        "Final projection: only customer and SUM(total) AS revenue leave the operator — 3 rows.",
        { rowsOverride: [r("ada","Ada",125), r("lin","Linus",195), r("bob","Bob",50)],
          colsOverride: ["customer","revenue"], noteTone: "violet" }),
    ],
  },
  {
    name: "HAVING filters GROUPS",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
      "HAVING SUM(total) >= 100",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([4], pass((r) => r.cells[3] === "paid"),
        "HAVING is WHERE for groups — runs AFTER aggregation. Bob's $50 bucket falls below threshold and is dropped.",
        { side: bucketPanel([{k:"Ada ✓",sum:125},{k:"Linus ✓",sum:195},{k:"Bob ✗",sum:50}]) }),
      st([0,4], "added",
        "Result projection — exactly the columns named in SELECT.",
        { rowsOverride: [r("ada","Ada",125), r("lin","Linus",195)],
          colsOverride: ["customer","revenue"], noteTone: "violet" }),
    ],
  },
  {
    name: "Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT",
    sql: [
      "SELECT customer, SUM(total) AS revenue  -- 5",
      "FROM   orders                           -- 1",
      "WHERE  status = 'paid'                  -- 2",
      "GROUP  BY customer                      -- 3",
      "HAVING SUM(total) >= 100                -- 4",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([1], "pending", "Step 1 — FROM resolves the source relation.",
        { noteTone: "neutral" }),
      st([2], pass((r) => r.cells[3] === "paid"),
        "Step 2 — WHERE filters raw rows. Grace (pending) drops.", { highlightCols: [3] }),
      st([3], pass((r) => r.cells[3] === "paid"),
        "Step 3 — GROUP BY hashes survivors by customer (Ada, Linus, Bob).",
        { highlightCols: [1], side: bucketPanel([{k:"Ada",sum:125},{k:"Linus",sum:195},{k:"Bob",sum:50}]) }),
      st([4], pass((r) => r.cells[3] === "paid" && r.cells[1] !== "Bob"),
        "Step 4 — HAVING drops Bob's bucket (50 < 100).",
        { side: bucketPanel([{k:"Ada ✓",sum:125},{k:"Linus ✓",sum:195}]) }),
      st([0], "added",
        "Step 5 — SELECT runs LAST. Only the projected columns reach the client; that's why aliases declared here are invisible to WHERE / GROUP BY.",
        { rowsOverride: [r("ada","Ada",125), r("lin","Linus",195)],
          colsOverride: ["customer","revenue"], noteTone: "violet" }),
    ],
  },
];

// ----- q-cube: GROUPING SETS, ROLLUP, CUBE -----
const cubeData: Row[] = [
  r(1, "EU",   "Q1", 100),
  r(2, "EU",   "Q2", 80),
  r(3, "US",   "Q1", 200),
  r(4, "US",   "Q2", 150),
];
const cubeCols = ["region", "quarter", "amount"];

const cubeStages: Stage[] = [
  {
    name: "GROUPING SETS — explicit",
    sql: [
      "SELECT region, quarter, SUM(amount)",
      "FROM   sales",
      "GROUP  BY GROUPING SETS ((region), (quarter), ())",
    ],
    table: { name: "sales", cols: cubeCols, rows: cubeData },
    steps: [
      st([2], "added",
        "Multiple grouping dimensions in ONE pass. () = grand total. NULL appears in the dimension columns of the totals row.",
        { rowsOverride: [
          r("eu", "EU", null, 180),
          r("us", "US", null, 350),
          r("q1", null, "Q1", 300),
          r("q2", null, "Q2", 230),
          r("all", null, null, 530),
        ], colsOverride: cubeCols }),
    ],
  },
  {
    name: "ROLLUP — hierarchical",
    sql: [
      "SELECT region, quarter, SUM(amount)",
      "FROM   sales",
      "GROUP  BY ROLLUP(region, quarter)",
    ],
    table: { name: "sales", cols: cubeCols, rows: cubeData },
    steps: [
      st([2], "added",
        "ROLLUP(a,b) = GROUPING SETS ((a,b),(a),()). One subtotal per prefix → great for hierarchies like (year, quarter, month).",
        { rowsOverride: [
          r(1, "EU", "Q1", 100), r(2, "EU", "Q2", 80), r("eu", "EU", null, 180),
          r(3, "US", "Q1", 200), r(4, "US", "Q2", 150), r("us", "US", null, 350),
          r("all", null, null, 530),
        ] }),
    ],
  },
  {
    name: "CUBE — all combinations",
    sql: [
      "SELECT region, quarter, SUM(amount)",
      "FROM   sales",
      "GROUP  BY CUBE(region, quarter)",
    ],
    table: { name: "sales", cols: cubeCols, rows: cubeData },
    steps: [
      st([2], "added",
        "CUBE(a,b) = power set of grouping columns: (a,b),(a),(b),(). 2^N output partitions — explodes with each dim. Use sparingly.",
        { noteTone: "amber",
          rowsOverride: [
            r(1,"EU","Q1",100), r(2,"EU","Q2",80),  r(3,"US","Q1",200), r(4,"US","Q2",150),
            r("eu","EU",null,180), r("us","US",null,350),
            r("q1",null,"Q1",300), r("q2",null,"Q2",230),
            r("all",null,null,530),
          ] }),
    ],
  },
];

// ============================================================
// Module 3: Joins
// ============================================================

// ----- q-venn: INNER, LEFT, RIGHT, FULL — dual-table step-by-step -----
// Source tables used by every join stage.
const USERS_J: Row[] = [
  r(1, 1, "Ada"),
  r(2, 2, "Linus"),
  r(3, 3, "Grace"),
];
const ORDERS_J: Row[] = [
  r(11, 11, 1,  "$45"),
  r(12, 12, 1,  "$30"),
  r(13, 13, 2,  "$120"),
  r(14, 14, 99, "$10"),  // orphan — no matching user
];
const USERS_COLS = ["id", "name"];
const ORDERS_COLS = ["id", "user_id", "total"];
const RES_COLS = ["u.id", "u.name", "o.id", "o.total"];

// Helpers to build per-row state arrays for the dual layout.
const mark = <T,>(arr: T[], idx: number[], state: RowState): (RowState | undefined)[] =>
  arr.map((_, i) => (idx.includes(i) ? state : undefined));

// Build result rows for a matched pair.
const pair = (u: Row, o: Row | null): Row =>
  o
    ? r(`${u.cells[0]}-${o.cells[0]}`, u.cells[0]!, u.cells[1]!, o.cells[0]!, o.cells[2]!)
    : r(`${u.cells[0]}-NULL`, u.cells[0]!, u.cells[1]!, null, null);
const orphanRight = (o: Row): Row =>
  r(`NULL-${o.cells[0]}`, null, null, o.cells[0]!, o.cells[2]!);

// Pre-compute matching result rows.
const ADA_45  = pair(USERS_J[0], ORDERS_J[0]);
const ADA_30  = pair(USERS_J[0], ORDERS_J[1]);
const LIN_120 = pair(USERS_J[1], ORDERS_J[2]);
const GRACE_NULL = pair(USERS_J[2], null);
const NULL_ORPHAN = orphanRight(ORDERS_J[3]);

const vennStages: Stage[] = [
  // ─────────────── INNER JOIN ───────────────
  {
    name: "INNER JOIN — matched pairs only",
    blurb: "Keep a row only when ON predicate is TRUE",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "INNER  JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u", cols: USERS_COLS, rows: USERS_J },
    rightTable:{ name: "orders o", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      { activeLines: [1,2], note: "Two source relations. The join walks every left row and probes the right side on o.user_id = u.id." },
      { activeLines: [2], leftStates: mark(USERS_J,[0],"kept"), rightStates: mark(ORDERS_J,[0,1],"kept"),
        resultRows: [ADA_45, ADA_30], resultCols: RES_COLS,
        note: "Probe u=Ada(id=1). Orders #11 and #12 carry user_id=1 → emit 2 paired rows." },
      { activeLines: [2], leftStates: mark(USERS_J,[1],"kept"), rightStates: mark(ORDERS_J,[2],"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Probe u=Linus(id=2). Order #13 matches → 1 more row." },
      { activeLines: [2], leftStates: mark(USERS_J,[2],"dropped"),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Probe u=Grace(id=3). No order has user_id=3 → Grace is DROPPED. INNER never invents NULLs.",
        noteTone: "amber" },
      { activeLines: [2], leftStates: USERS_J.map((_,i)=> i===2 ? "dropped" : "kept"),
        rightStates: ORDERS_J.map((_,i)=> i===3 ? "dropped" : "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Orphan order #14 (user_id=99) finds no user → also dropped. INNER keeps only the intersection." },
    ],
  },

  // ─────────────── LEFT JOIN ───────────────
  {
    name: "LEFT JOIN — keep every left row",
    blurb: "Unmatched left rows survive; right columns become NULL",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "LEFT   JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u  (preserved)", cols: USERS_COLS, rows: USERS_J },
    rightTable:{ name: "orders o", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      { activeLines: [1,2], note: "LEFT JOIN promises: every users row appears at least once in the output." },
      { activeLines: [2], leftStates: mark(USERS_J,[0],"kept"), rightStates: mark(ORDERS_J,[0,1],"kept"),
        resultRows: [ADA_45, ADA_30], resultCols: RES_COLS,
        note: "Ada matches → 2 rows, same as INNER." },
      { activeLines: [2], leftStates: mark(USERS_J,[1],"kept"), rightStates: mark(ORDERS_J,[2],"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Linus matches → 1 row." },
      { activeLines: [2], leftStates: mark(USERS_J,[2],"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL], resultCols: RES_COLS,
        note: "Grace has NO order. LEFT JOIN still emits her — with NULL for o.id and o.total.",
        noteTone: "mint" },
      { activeLines: [2], leftStates: USERS_J.map(()=>"kept"), rightStates: mark(ORDERS_J,[3],"dropped"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL], resultCols: RES_COLS,
        note: "Orphan order #14 is STILL dropped — only the LEFT side is preserved." },
    ],
  },

  // ─────────────── RIGHT JOIN ───────────────
  {
    name: "RIGHT JOIN — keep every right row",
    blurb: "Mirror of LEFT — orphan rows on the right survive",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "RIGHT  JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u", cols: USERS_COLS, rows: USERS_J },
    rightTable:{ name: "orders o  (preserved)", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      { activeLines: [1,2], note: "RIGHT JOIN promises every orders row appears at least once." },
      { activeLines: [2], leftStates: mark(USERS_J,[0],"kept"), rightStates: mark(ORDERS_J,[0,1],"kept"),
        resultRows: [ADA_45, ADA_30], resultCols: RES_COLS,
        note: "Orders #11 and #12 find Ada — 2 matched rows." },
      { activeLines: [2], leftStates: mark(USERS_J,[1],"kept"), rightStates: mark(ORDERS_J,[2],"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Order #13 finds Linus — 1 more row." },
      { activeLines: [2], leftStates: mark(USERS_J,[2],"dropped"), rightStates: mark(ORDERS_J,[3],"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, NULL_ORPHAN], resultCols: RES_COLS,
        note: "Orphan order #14 (user_id=99) is preserved with NULL user columns. Grace (no order) is dropped.",
        noteTone: "mint" },
      { activeLines: [2], note: "Convention: prefer LEFT and swap the operand order — it reads more naturally in code reviews." },
    ],
  },

  // ─────────────── FULL OUTER JOIN ───────────────
  {
    name: "FULL OUTER JOIN — keep BOTH sides",
    blurb: "Union of LEFT and RIGHT semantics — unmatched on either side survives",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "FULL   JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u  (preserved)", cols: USERS_COLS, rows: USERS_J },
    rightTable:{ name: "orders o  (preserved)", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      { activeLines: [1,2], note: "FULL = every row from EITHER side appears at least once. Use for reconciliation reports." },
      { activeLines: [2], leftStates: USERS_J.map((_,i)=> i<2 ? "kept" : undefined),
        rightStates: ORDERS_J.map((_,i)=> i<3 ? "kept" : undefined),
        resultRows: [ADA_45, ADA_30, LIN_120], resultCols: RES_COLS,
        note: "Matched portion first — same 3 rows as INNER." },
      { activeLines: [2], leftStates: USERS_J.map((_,i)=> i===2 ? "kept" : "kept"),
        rightStates: ORDERS_J.map((_,i)=> i<3 ? "kept" : undefined),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL], resultCols: RES_COLS,
        note: "Add unmatched left rows (Grace) padded with NULLs — exactly what LEFT contributes.",
        noteTone: "mint" },
      { activeLines: [2], leftStates: USERS_J.map(()=>"kept"), rightStates: ORDERS_J.map(()=>"kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL, NULL_ORPHAN], resultCols: RES_COLS,
        note: "Add unmatched right rows (orphan #14) padded with NULLs — what RIGHT contributes. 5 rows total.",
        noteTone: "mint" },
    ],
  },
];

// ----- q-self: SELF JOIN — same table twice -----
const EMP_S: Row[] = [
  r(1, 1, "Ada",   null),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", 1),
  r(4, 4, "Bob",   2),
  r(5, 5, "Eve",   2),
];
const SCOLS = ["id", "name", "manager_id"];
const SELF_RES_COLS = ["emp", "manager"];

const selfRow = (eIdx: number, mIdx: number | null) =>
  r(`${eIdx}-${mIdx ?? "x"}`,
    String(EMP_S[eIdx].cells[1]),
    mIdx === null ? null : String(EMP_S[mIdx].cells[1]));

const selfStages: Stage[] = [
  {
    name: "Same table, two aliases",
    blurb: "An employee row can play TWO roles: employee (e) and manager (m)",
    sql: [
      "SELECT e.name AS emp, m.name AS manager",
      "FROM   employees e",
      "JOIN   employees m ON e.manager_id = m.id",
    ],
    leftTable: { name: "employees  e  (each row = an employee)", cols: SCOLS, rows: EMP_S },
    rightTable:{ name: "employees  m  (same table, alias m = manager)", cols: SCOLS, rows: EMP_S },
    steps: [
      { activeLines: [1,2], note: "The engine reads employees TWICE — once as e, once as m. They are independent cursors over the same data." },
      { activeLines: [2], leftStates: mark(EMP_S,[0],"dropped"),
        resultRows: [], resultCols: SELF_RES_COLS,
        note: "Probe e=Ada. Ada.manager_id = NULL → ON-predicate UNKNOWN → drop. Roots fall out of an INNER self-join.",
        noteTone: "amber" },
      { activeLines: [2], leftStates: mark(EMP_S,[1],"kept"), rightStates: mark(EMP_S,[0],"kept"),
        resultRows: [selfRow(1,0)], resultCols: SELF_RES_COLS,
        note: "Probe e=Linus (manager_id=1). Find m where m.id=1 → Ada. Emit (Linus, Ada)." },
      { activeLines: [2], leftStates: mark(EMP_S,[2],"kept"), rightStates: mark(EMP_S,[0],"kept"),
        resultRows: [selfRow(1,0), selfRow(2,0)], resultCols: SELF_RES_COLS,
        note: "Probe e=Grace (manager_id=1). m=Ada again. Emit (Grace, Ada)." },
      { activeLines: [2], leftStates: mark(EMP_S,[3],"kept"), rightStates: mark(EMP_S,[1],"kept"),
        resultRows: [selfRow(1,0), selfRow(2,0), selfRow(3,1)], resultCols: SELF_RES_COLS,
        note: "Probe e=Bob (manager_id=2). m=Linus. Emit (Bob, Linus)." },
      { activeLines: [2], leftStates: mark(EMP_S,[4],"kept"), rightStates: mark(EMP_S,[1],"kept"),
        resultRows: [selfRow(1,0), selfRow(2,0), selfRow(3,1), selfRow(4,1)], resultCols: SELF_RES_COLS,
        note: "Probe e=Eve (manager_id=2). m=Linus. Done — 4 rows, Ada absent." },
    ],
  },
  {
    name: "Use LEFT JOIN to keep the root",
    blurb: "Same data — swap INNER for LEFT so the CEO survives",
    sql: [
      "SELECT e.name AS emp,",
      "       COALESCE(m.name, '— root —') AS manager",
      "FROM   employees e",
      "LEFT   JOIN employees m ON e.manager_id = m.id",
    ],
    leftTable: { name: "employees  e  (preserved)", cols: SCOLS, rows: EMP_S },
    rightTable:{ name: "employees  m", cols: SCOLS, rows: EMP_S },
    steps: [
      { activeLines: [3], leftStates: mark(EMP_S,[0],"kept"),
        resultRows: [r("ada-root","Ada","— root —")], resultCols: SELF_RES_COLS,
        note: "Ada has no manager — LEFT preserves her. COALESCE swaps the NULL for a friendly label.",
        noteTone: "mint" },
      { activeLines: [3], leftStates: mark(EMP_S,[1,2],"kept"), rightStates: mark(EMP_S,[0],"kept"),
        resultRows: [r("ada-root","Ada","— root —"), selfRow(1,0), selfRow(2,0)], resultCols: SELF_RES_COLS,
        note: "Linus and Grace match Ada." },
      { activeLines: [3], leftStates: mark(EMP_S,[3,4],"kept"), rightStates: mark(EMP_S,[1],"kept"),
        resultRows: [r("ada-root","Ada","— root —"), selfRow(1,0), selfRow(2,0), selfRow(3,1), selfRow(4,1)],
        resultCols: SELF_RES_COLS,
        note: "Bob and Eve match Linus. 5 rows — the full org chart, one level up." },
      { activeLines: [3], note: "Self-join walks ONE level. For arbitrary-depth hierarchies (org chart, threaded comments), use a recursive CTE." },
    ],
  },
];

// ----- q-semianti: EXISTS, NOT EXISTS -----
const semiStages: Stage[] = [
  {
    name: "Semi-join via EXISTS",
    sql: [
      "SELECT u.id, u.name",
      "FROM   users u",
      "WHERE  EXISTS (SELECT 1 FROM orders o",
      "               WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([2,3], pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "EXISTS stops at the FIRST match per outer row. Returns LEFT-side columns only — never duplicates the outer row. Ada has 2 orders but appears once.", { highlightCols: [0] }),
    ],
  },
  {
    name: "Anti-join via NOT EXISTS",
    sql: [
      "SELECT u.id, u.name",
      "FROM   users u",
      "WHERE  NOT EXISTS (SELECT 1 FROM orders o",
      "                   WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([2,3], pass((r) => r.cells[0] === 3),
        "NOT EXISTS = anti-join. Grace surfaces (no orders). Unlike NOT IN, this is NULL-safe.", { noteTone: "mint" }),
    ],
  },
  {
    name: "Why EXISTS beats JOIN+DISTINCT",
    sql: [
      "SELECT DISTINCT u.id, u.name      -- equivalent but slower",
      "FROM   users u",
      "JOIN   orders o ON o.user_id = u.id",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([0,2], pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "JOIN+DISTINCT materialises every match then deduplicates. EXISTS short-circuits at the first match — usually cheaper for selective predicates.",
        { noteTone: "violet" }),
    ],
  },
];

// ----- q-algos: Nested Loop, Hash, Sort-Merge -----
const algosRows = (lbl: string): Row[] => [
  r(lbl + "1", "Ada→#11", "$45"),
  r(lbl + "2", "Ada→#12", "$30"),
  r(lbl + "3", "Linus→#13", "$120"),
];

const algosStages: Stage[] = [
  {
    name: "Nested Loop",
    blurb: "O(N·M) — good when inner side has an index",
    sql: [
      "-- Pseudocode",
      "for u in users:",
      "  for o in orders where o.user_id = u.id:",
      "    emit (u, o)",
    ],
    table: { name: "result", cols: ["pair","total"], rows: algosRows("nl") },
    steps: [
      st([1,2], "added",
        "Optimiser picks this when one side is tiny (≤ a few thousand rows) OR the inner side has a B-Tree index on the join key — each inner lookup is O(log N)."),
    ],
  },
  {
    name: "Hash Join",
    blurb: "O(N+M) — build hash on smaller side, probe with bigger",
    sql: [
      "-- Phase 1: build hash(users)",
      "-- Phase 2: probe with orders.user_id",
      "SELECT u.name, o.total FROM users u",
      "JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["pair","total"], rows: algosRows("hj") },
    steps: [
      st([0], "added",
        "Build phase materialises the small side into a hash table in memory (work_mem). If too big → spills to disk in partitions. Best for equi-joins on large unindexed sides."),
    ],
  },
  {
    name: "Sort-Merge",
    blurb: "O((N+M)·log) — both sides already sorted? near-linear",
    sql: [
      "-- Sort users by id, sort orders by user_id",
      "-- Merge with twin cursors",
    ],
    table: { name: "result", cols: ["pair","total"], rows: algosRows("sm") },
    steps: [
      st([0,1], "added",
        "Wins on huge sorted inputs, on range joins (>=, BETWEEN), and when an ORDER BY downstream piggybacks on the merge order."),
    ],
  },
];

// ============================================================
// Module 4: Subqueries & Set Ops
// ============================================================

// ----- q-scalar -----
const scalarStages: Stage[] = [
  {
    name: "Scalar subquery (atomic value)",
    sql: [
      "SELECT id, customer, total,",
      "       (SELECT AVG(total) FROM orders) AS avg_all",
      "FROM   orders",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([1], "kept",
        "Subquery returns ONE row, ONE column → can sit anywhere a value is allowed. Computed ONCE and joined as a constant. Cost: 1 extra scan.",
        { highlightCols: [2] }),
    ],
  },
  {
    name: "Constant fold",
    sql: [
      "SELECT * FROM orders",
      "WHERE  total > (SELECT AVG(total) FROM orders)",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([1], pass((r) => Number(r.cells[2]) > 66.67),
        "Subquery → 66.67. Outer query filters once with that constant. SAME cost as WHERE total > 66.67.",
        { highlightCols: [2], noteTone: "mint" }),
    ],
  },
  {
    name: "Multi-row → ERROR",
    sql: [
      "SELECT *",
      "FROM   orders",
      "WHERE  customer = (SELECT customer FROM orders)  -- bad",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([2], () => "dropped" as RowState,
        "ERROR: 'more than one row returned by a subquery used as an expression'. Use IN, ANY, or ALL for set comparisons.",
        { noteTone: "rose" }),
    ],
  },
];

// ----- q-corr: correlated, O(N²), rewrite -----
const corrStages: Stage[] = [
  {
    name: "Naive correlated subquery",
    sql: [
      "SELECT o.id, o.customer, o.total,",
      "       (SELECT AVG(total) FROM orders o2",
      "        WHERE o2.customer = o.customer) AS cust_avg",
      "FROM   orders o",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([1,2,3], "kept",
        "The inner query references the outer row (o.customer). It re-executes ONCE PER OUTER ROW → O(N·M). 6 outer × 6 scans = 36 row reads here, 1M × 1M in production = catastrophic.",
        { noteTone: "rose" }),
    ],
  },
  {
    name: "Rewrite as JOIN to aggregated CTE",
    sql: [
      "WITH avgs AS (",
      "  SELECT customer, AVG(total) AS cust_avg",
      "  FROM orders GROUP BY customer)",
      "SELECT o.id, o.customer, o.total, a.cust_avg",
      "FROM   orders o",
      "JOIN   avgs   a ON a.customer = o.customer",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([0,1,2], "added",
        "Aggregate ONCE, then JOIN. O(N+M) instead of O(N·M). Same answer, orders of magnitude faster on real data.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "Window function — single pass",
    sql: [
      "SELECT id, customer, total,",
      "       AVG(total) OVER (PARTITION BY customer) AS cust_avg",
      "FROM   orders",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st([1], "kept",
        "Window functions compute per-partition aggregates without collapsing rows. One scan, one hash. Almost always the right answer for 'aggregate alongside detail'.",
        { noteTone: "mint" }),
    ],
  },
];

// ----- q-existsin: EXISTS, IN, NOT IN NULL trap -----
const existsStages: Stage[] = [
  {
    name: "IN — fine when subquery has no NULLs",
    sql: [
      "SELECT id, name FROM users",
      "WHERE  id IN (SELECT user_id FROM orders)",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([1], pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "Equivalent to a semi-join. Modern optimisers turn IN(subquery) into the same plan as EXISTS in most cases."),
    ],
  },
  {
    name: "EXISTS — short-circuit, NULL-safe",
    sql: [
      "SELECT id, name FROM users u",
      "WHERE  EXISTS (SELECT 1 FROM orders o",
      "               WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([1,2], pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "EXISTS stops at first match. Returns TRUE/FALSE — never UNKNOWN — so handles NULLs cleanly.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "NOT IN with NULL — silent zero",
    sql: [
      "SELECT id, name FROM users",
      "WHERE  id NOT IN (SELECT user_id FROM orders) -- orders.user_id has NULLs",
    ],
    table: { name: "users", cols: ["id","name"], rows: USERS_J },
    steps: [
      st([1], () => "dropped" as RowState,
        "If any subquery row is NULL, NOT IN returns UNKNOWN for every outer row → empty result. ALWAYS prefer NOT EXISTS.",
        { noteTone: "rose" }),
    ],
  },
];

// ----- q-setops: UNION ALL, UNION, INTERSECT, EXCEPT -----
const A_SET: Row[] = [r("a1",1,"alpha"), r("a2",2,"beta"), r("a3",3,"gamma")];
const B_SET: Row[] = [r("b1",2,"beta"), r("b2",3,"gamma"), r("b3",4,"delta")];

const setopsStages: Stage[] = [
  {
    name: "UNION ALL — append, no dedup",
    sql: ["SELECT id, name FROM a", "UNION ALL", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id","name"], rows: [...A_SET, ...B_SET] },
    steps: [
      st([1], "added",
        "Cheapest set op — pure stream-append. Use whenever you KNOW inputs are disjoint, or when duplicates are meaningful.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "UNION — append + deduplicate",
    sql: ["SELECT id, name FROM a", "UNION", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id","name"], rows: [
      r("a1",1,"alpha"), r("a2",2,"beta"), r("a3",3,"gamma"), r("b3",4,"delta"),
    ]},
    steps: [
      st([1], "added",
        "Implicit DISTINCT — hash or sort dedup. Adds O(N) memory and may spill. Don't pay that cost if you don't need it.",
        { noteTone: "amber" }),
    ],
  },
  {
    name: "INTERSECT — rows in BOTH",
    sql: ["SELECT id, name FROM a", "INTERSECT", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id","name"], rows: [r("i1",2,"beta"), r("i2",3,"gamma")] },
    steps: [
      st([1], "added", "Set intersection. NULLs compare equal here (unlike normal = NULL)."),
    ],
  },
  {
    name: "EXCEPT — rows in A but not B",
    sql: ["SELECT id, name FROM a", "EXCEPT", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id","name"], rows: [r("e1",1,"alpha")] },
    steps: [
      st([1], "added", "Anti-set. Equivalent to NOT EXISTS but operates on whole rows. Use for diff reports."),
    ],
  },
];

// ============================================================
// FOUNDATIONS — 7 variants
// ============================================================

// ----- pipeline -----
const pipeOrders: Row[] = [
  r(1, 1, "Ada",   45,  "2026-06-01"),
  r(2, 2, "Linus", 120, "2026-06-05"),
  r(3, 3, "Ada",   80,  "2026-06-10"),
  r(4, 4, "Grace", 30,  "2026-05-02"),
  r(5, 5, "Alan",  50,  "2026-06-18"),
  r(6, 6, "Linus", 75,  "2026-06-20"),
  r(7, 7, "Bob",   105, "2026-06-15"),
];
const pipeCols = ["id","customer","total","placed_at"];

const pipelineStages: Stage[] = [
  {
    name: "FROM",
    blurb: "Resolve the source relation",
    sql: ["SELECT customer, SUM(total) AS revenue", "FROM   orders"],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [ st([1], "pending", "Logical step 1: identify the source. No filtering yet — all 7 rows visible.") ],
  },
  {
    name: "WHERE",
    blurb: "Row-level predicate",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st([2], pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Grace's May order falls away. WHERE runs BEFORE grouping, so we save work later.",
        { highlightCols: [3] }),
    ],
  },
  {
    name: "GROUP BY",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
      "GROUP  BY customer",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st([3], pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Survivors collapse into buckets by customer.",
        { highlightCols: [1],
          side: bucketPanel([{k:"Ada",sum:125},{k:"Linus",sum:195},{k:"Alan",sum:50},{k:"Bob",sum:105}]) }),
    ],
  },
  {
    name: "HAVING",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
      "GROUP  BY customer",
      "HAVING SUM(total) >= 100",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st([4], pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Group-level filter — Alan's $50 bucket drops. HAVING is the only place aggregate predicates live.",
        { side: bucketPanel([{k:"Ada ✓",sum:125},{k:"Linus ✓",sum:195},{k:"Bob ✓",sum:105}]) }),
    ],
  },
  {
    name: "SELECT · ORDER BY · LIMIT",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders WHERE placed_at >= '2026-06-01'",
      "GROUP  BY customer HAVING SUM(total) >= 100",
      "ORDER  BY revenue DESC LIMIT 2",
    ],
    table: { name: "result", cols: ["customer","revenue"], rows: [
      r("lin","Linus",195), r("ada","Ada",125),
    ]},
    steps: [
      st([0,3], "added",
        "Projection → sort → cap. SELECT runs LAST in the logical pipeline (but you write it first).",
        { noteTone: "violet" }),
    ],
  },
];

// ----- select-projection -----
const usersP: Row[] = [
  r(1, 1, "ada@ex.com",   "2026-01-04", "0xa9…"),
  r(2, 2, "linus@ex.com", "2026-01-05", "0xc4…"),
  r(3, 3, "grace@ex.com", "2026-02-11", "0x18…"),
];
const pCols = ["id", "email", "created_at", "password_hash"];

const projStages: Stage[] = [
  {
    name: "SELECT * — everything",
    sql: ["SELECT * FROM users"],
    table: { name: "users", cols: pCols, rows: usersP },
    steps: [
      st([0], "kept", "All columns including password_hash travel over the wire — wasteful and a security smell.",
        { highlightCols: [0,1,2,3], noteTone: "amber" }),
    ],
  },
  {
    name: "Project specific columns",
    sql: ["SELECT id, email", "FROM   users"],
    table: { name: "users", cols: pCols, rows: usersP },
    steps: [
      st([0], "kept", "Narrow projection — smaller payload, can also enable index-only scans.", { highlightCols: [0,1] }),
    ],
  },
  {
    name: "Aliases for downstream code",
    sql: [
      "SELECT id        AS user_id,",
      "       email     AS email_addr,",
      "       created_at AS signup_at",
      "FROM   users",
    ],
    table: { name: "users", cols: pCols, rows: usersP },
    steps: [
      st([0,1,2], "kept",
        "AS renames columns in the result. Aliases are not visible in WHERE/GROUP BY (SELECT runs last) — only ORDER BY can reuse them.",
        { highlightCols: [0,1,2], noteTone: "violet" }),
    ],
  },
];

// ----- table-build -----
const usersTB: Row[] = [
  r(1, 1, "ada@ex.com"),
  r(2, 2, "linus@ex.com"),
  r(3, 3, "grace@ex.com"),
];
const tbCols = ["id", "email"];

const tableBuildStages: Stage[] = [
  {
    name: "CREATE TABLE — declare the shape",
    sql: [
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,",
      "  email TEXT      NOT NULL UNIQUE",
      ");",
    ],
    table: { name: "users", cols: tbCols, rows: [] },
    steps: [
      st([0,1,2,3], "pending",
        "Schema defined: 2 columns, 1 PK, 1 UNIQUE constraint. The table exists but holds zero rows."),
    ],
  },
  {
    name: "INSERT — populate",
    sql: [
      "INSERT INTO users (email) VALUES",
      "  ('ada@ex.com'),",
      "  ('linus@ex.com'),",
      "  ('grace@ex.com');",
    ],
    table: { name: "users", cols: tbCols, rows: usersTB },
    steps: [
      st([0,1,2,3], "added", "BIGSERIAL auto-fills id. Three rows now present."),
    ],
  },
  {
    name: "Constraint rejects duplicate",
    sql: ["INSERT INTO users (email)", "VALUES ('ada@ex.com');  -- duplicate"],
    table: { name: "users", cols: tbCols, rows: [...usersTB, r("dup", "—", "ada@ex.com")] },
    steps: [
      st([1], (row) => row.key === "dup" ? "dropped" as RowState : "kept" as RowState,
        "UNIQUE(email) enforced at COMMIT time. ERROR: duplicate key value violates unique constraint 'users_email_key'.",
        { noteTone: "rose" }),
    ],
  },
];

// ----- foreign-key -----
const parents: Row[] = [r(1,1,"Ada"), r(2,2,"Linus")];
const childOK: Row[] = [r(1,11,1,"$45"), r(2,12,2,"$120")];

const fkStages: Stage[] = [
  {
    name: "Parent table exists",
    sql: ["CREATE TABLE users (", "  id BIGSERIAL PRIMARY KEY,", "  name TEXT", ");"],
    table: { name: "users", cols: ["id","name"], rows: parents },
    steps: [ st([0,1,2,3], "kept", "Parent populated with two rows.") ],
  },
  {
    name: "Child with FOREIGN KEY",
    sql: [
      "CREATE TABLE orders (",
      "  id      BIGSERIAL PRIMARY KEY,",
      "  user_id BIGINT REFERENCES users(id),",
      "  total   NUMERIC",
      ");",
    ],
    table: { name: "orders", cols: ["id","user_id","total"], rows: childOK },
    steps: [
      st([2], "added",
        "REFERENCES creates a constraint that every order.user_id must match a users.id (or be NULL)."),
    ],
  },
  {
    name: "Orphan insert rejected",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (99, 10);  -- no such user"],
    table: { name: "orders", cols: ["id","user_id","total"], rows: [...childOK, r("orph",13,99,10)] },
    steps: [
      st([1], (row) => row.key === "orph" ? "dropped" as RowState : "kept" as RowState,
        "ERROR: insert violates foreign key constraint. Referential integrity is enforced at write time — your data can never be inconsistent.",
        { noteTone: "rose" }),
    ],
  },
];

// ----- null-truth -----
// Foundations version: focus on truth tables across IS NULL / = / boolean
const nullTruthStages = null3vlStages;  // identical pedagogy

// ----- type-sizes -----
const typesRows: Row[] = [
  r(1, "SMALLINT", "2 bytes", "−32 768 → 32 767", "page counts"),
  r(2, "INT",      "4 bytes", "≈ ±2.1 B",          "row ids ≤ 2 B"),
  r(3, "BIGINT",   "8 bytes", "≈ ±9.2 E18",        "ids, timestamps_ms"),
  r(4, "NUMERIC(p,s)", "var", "exact decimal",     "money — never FLOAT!"),
  r(5, "TEXT",     "var",     "unlimited",         "free-form strings"),
  r(6, "VARCHAR(n)", "var ≤ n", "bounded",          "where length cap matters"),
];
const typeCols = ["#","type","storage","range","when to use"];

const typeStages: Stage[] = [
  {
    name: "Integers — pick the smallest that holds your future max",
    sql: ["CREATE TABLE t (", "  small_count  SMALLINT,", "  row_id       INT,", "  ms_epoch     BIGINT", ");"],
    table: { name: "types", cols: typeCols, rows: typesRows.slice(0,3) },
    steps: [
      st([0,1,2,3], "kept",
        "INT covers 2.1 B — fine for many tables. Use BIGINT for ids if you might exceed 2 B; using BIGINT EVERYWHERE doubles index size.",
        { highlightCols: [2] }),
    ],
  },
  {
    name: "NUMERIC for money — never FLOAT",
    sql: [
      "-- WRONG",
      "price DOUBLE PRECISION",
      "-- RIGHT",
      "price NUMERIC(12,2)",
    ],
    table: { name: "types", cols: typeCols, rows: [typesRows[3]] },
    steps: [
      st([2,3], "kept",
        "FLOAT/DOUBLE are binary fractions: 0.1 + 0.2 = 0.30000000000000004. NUMERIC(precision, scale) is exact base-10 — required for finance.",
        { noteTone: "rose" }),
    ],
  },
  {
    name: "TEXT vs VARCHAR(n)",
    sql: [
      "name  TEXT,             -- unlimited",
      "code  VARCHAR(8),       -- enforced cap",
    ],
    table: { name: "types", cols: typeCols, rows: typesRows.slice(4) },
    steps: [
      st([0,1], "kept",
        "In Postgres TEXT and VARCHAR share storage — no perf difference. Use VARCHAR(n) only when n is a real business rule. Use TEXT otherwise.",
        { noteTone: "mint" }),
    ],
  },
];

// ============================================================
// FOUNDATIONS — extended pedagogical variants
// ============================================================

// ---------- table-anatomy: Database / Table / Column / Row ----------
const TA_USERS: Row[] = [
  r(1, 1, "ada@ex.com",   "2026-01-04"),
  r(2, 2, "linus@ex.com", "2026-01-05"),
  r(3, 3, "grace@ex.com", "2026-02-11"),
  r(4, 4, "alan@ex.com",  "2026-03-02"),
];
const TA_COLS = ["id", "email", "created_at"];

const dbBox = (highlight: "db" | "table" | "col" | "row" | null) => (
  <div className="space-y-2">
    <div className={`rounded-lg border px-3 py-2 transition-colors ${highlight==="db" ? "border-mint bg-mint/15" : "border-hairline bg-surface-2/40"}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">database</div>
      <div className="font-mono text-sm">app_db</div>
      <div className="mt-2 grid gap-1.5">
        {["users","orders","products"].map((t) => (
          <div key={t} className={`rounded-md border px-2 py-1 font-mono text-[12px] ${highlight==="table" && t==="users" ? "border-mint bg-mint/15 text-mint" : "border-hairline bg-surface text-muted-foreground"}`}>
            {t}
          </div>
        ))}
      </div>
    </div>
    <div className="text-[11px] text-muted-foreground">
      {highlight==="db" && "A database is a named container of related tables."}
      {highlight==="table" && "A table is one collection of rows with a fixed shape."}
      {highlight==="col" && "A column defines ONE attribute + its data type."}
      {highlight==="row" && "A row is ONE record — values for every column."}
    </div>
  </div>
);

const tableAnatomyStages: Stage[] = [
  {
    name: "Database — the outermost container",
    blurb: "Holds many tables, plus indexes, views, roles…",
    sql: ["-- One database can hold dozens of tables", "-- They share the same auth, backups, transactions"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st([], "pending", "A DATABASE is the top-level namespace. Inside it live tables, views, indexes, functions, and roles.", { side: dbBox("db") }),
    ],
  },
  {
    name: "Table — one shape of record",
    blurb: "A named collection of rows with identical structure",
    sql: ["CREATE TABLE users (", "  id BIGSERIAL PRIMARY KEY,", "  email TEXT,", "  created_at TIMESTAMPTZ", ");"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st([0,1,2,3,4], "kept", "A TABLE = a 2-D grid. Every row in it MUST follow the same column shape declared by CREATE TABLE.", { side: dbBox("table") }),
    ],
  },
  {
    name: "Column — one vertical attribute",
    blurb: "Same data type top to bottom",
    sql: ["SELECT email", "FROM   users"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st([0], "kept", "A COLUMN is a vertical slice. Every value in 'email' is TEXT — type is enforced.", { highlightCols: [1], side: dbBox("col") }),
      st([0], "kept", "Other columns highlighted in sequence — id (BIGINT), created_at (TIMESTAMPTZ). Type per column is non-negotiable.", { highlightCols: [0,2], side: dbBox("col") }),
    ],
  },
  {
    name: "Row — one horizontal record",
    blurb: "A complete tuple: one value per column",
    sql: ["SELECT *", "FROM   users", "WHERE  id = 2"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st([0,2], (row) => row.cells[0] === 2 ? "kept" : "dropped",
        "A ROW = ONE record. Here, row id=2 is the tuple (2, 'linus@ex.com', '2026-01-05').", { side: dbBox("row") }),
    ],
  },
  {
    name: "Putting it together",
    sql: ["-- database  →  table  →  rows × columns"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st([0], "kept",
        "Hierarchy: Database CONTAINS tables. Each table is a grid of columns (shape) × rows (data). Master this and the rest of SQL clicks.",
        { highlightCols: [0,1,2], noteTone: "mint" }),
    ],
  },
];

// ---------- pk-anatomy: PRIMARY KEY in motion ----------
const PK_ROWS: Row[] = [
  r(1, 1, "ada@ex.com"),
  r(2, 2, "linus@ex.com"),
];
const PK_COLS = ["id", "email"];

const pkStages: Stage[] = [
  {
    name: "Declaring a primary key",
    sql: [
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,",
      "  email TEXT NOT NULL UNIQUE",
      ");",
    ],
    table: { name: "users", cols: PK_COLS, rows: [] },
    steps: [
      st([0,1,2,3], "pending",
        "PRIMARY KEY on `id` means: every row MUST have an id, and no two ids may repeat. BIGSERIAL auto-generates the next integer.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "Inserts succeed — id auto-fills",
    sql: ["INSERT INTO users (email) VALUES", "  ('ada@ex.com'), ('linus@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: PK_ROWS },
    steps: [
      st([0,1], "added",
        "Two new rows — Postgres assigned id=1 then id=2 from the sequence. Identity is now permanent for these rows.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "NULL in a PK column → ERROR",
    sql: ["INSERT INTO users (id, email)", "VALUES (NULL, 'eve@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: [...PK_ROWS, r("nul", null, "eve@ex.com")] },
    steps: [
      st([0,1], (row) => row.key === "nul" ? "dropped" : "kept",
        "ERROR: null value in column 'id' violates not-null constraint. Primary key columns are IMPLICITLY NOT NULL.",
        { noteTone: "rose" }),
    ],
  },
  {
    name: "Duplicate PK value → ERROR",
    sql: ["INSERT INTO users (id, email)", "VALUES (1, 'bob@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: [...PK_ROWS, r("dup", 1, "bob@ex.com")] },
    steps: [
      st([0,1], (row) => row.key === "dup" ? "dropped" : "kept",
        "ERROR: duplicate key value violates unique constraint 'users_pkey'. id=1 already exists.",
        { noteTone: "rose" }),
    ],
  },
  {
    name: "Composite primary key — multi-column identity",
    sql: [
      "CREATE TABLE order_items (",
      "  order_id   BIGINT,",
      "  product_id BIGINT,",
      "  qty        INT NOT NULL,",
      "  PRIMARY KEY (order_id, product_id)",
      ");",
    ],
    table: { name: "order_items", cols: ["order_id","product_id","qty"], rows: [
      r(1, 101, 7, 2),
      r(2, 101, 9, 1),
      r(3, 102, 7, 5),
      r("dupck", 101, 7, 3),
    ]},
    steps: [
      st([4], (row) => row.key === "dupck" ? "dropped" : "kept",
        "PK = the PAIR (order_id, product_id). (101,7) and (101,9) are fine — different products. The second (101,7) duplicates the first → REJECTED.",
        { highlightCols: [0,1], noteTone: "rose" }),
    ],
  },
  {
    name: "Surrogate vs natural key",
    sql: [
      "-- NATURAL: use a real-world unique value",
      "CREATE TABLE countries (",
      "  iso2  CHAR(2) PRIMARY KEY,  -- 'US','DE','JP'",
      "  name  TEXT NOT NULL",
      ");",
      "",
      "-- SURROGATE: invent an opaque id",
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,  -- meaningless 1,2,3…",
      "  email TEXT UNIQUE NOT NULL    -- real identity, kept as UNIQUE",
      ");",
    ],
    table: { name: "users", cols: PK_COLS, rows: PK_ROWS },
    steps: [
      st([6,7,8,9,10], "kept",
        "Best practice for mutable entities: SURROGATE BIGSERIAL/UUID as PK + a UNIQUE on the natural key. Email can change; the surrogate id never does.",
        { noteTone: "violet" }),
    ],
  },
];

// ---------- fk-deep: FOREIGN KEY scenarios ----------
const FK_USERS: Row[] = [r(1,1,"Ada"), r(2,2,"Linus"), r(3,3,"Grace")];
const FK_ORDERS: Row[] = [r(11,11,1,45), r(12,12,1,30), r(13,13,2,120)];
const FK_UCOLS = ["id","name"];
const FK_OCOLS = ["id","user_id","total"];

const fkDeepStages: Stage[] = [
  {
    name: "Parent table comes first",
    blurb: "An FK can only point to an existing primary key",
    sql: ["CREATE TABLE users (", "  id   BIGSERIAL PRIMARY KEY,", "  name TEXT NOT NULL", ");"],
    table: { name: "users", cols: FK_UCOLS, rows: FK_USERS },
    steps: [
      st([0,1,2,3], "kept", "Parent table 'users' has 3 rows. Each id is unique — the candidates a foreign key may point to.",
        { highlightCols: [0] }),
    ],
  },
  {
    name: "Declare REFERENCES on the child",
    sql: [
      "CREATE TABLE orders (",
      "  id      BIGSERIAL PRIMARY KEY,",
      "  user_id BIGINT NOT NULL",
      "          REFERENCES users(id),",
      "  total   NUMERIC NOT NULL",
      ");",
    ],
    table: { name: "orders", cols: FK_OCOLS, rows: [] },
    steps: [
      st([2,3], "pending",
        "user_id is now a FOREIGN KEY → every value MUST match some users.id. The engine will enforce this on every INSERT and UPDATE.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "Valid inserts — user exists",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (1, 45), (1, 30), (2, 120);"],
    table: { name: "orders", cols: FK_OCOLS, rows: FK_ORDERS },
    steps: [
      st([0,1], "added",
        "Each user_id (1,1,2) finds a matching parent in users → all three rows accepted.",
        { highlightCols: [1], noteTone: "mint" }),
    ],
  },
  {
    name: "Orphan insert REJECTED",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (99, 10);"],
    table: { name: "orders", cols: FK_OCOLS, rows: [...FK_ORDERS, r("orph",14,99,10)] },
    steps: [
      st([0,1], (row) => row.key === "orph" ? "dropped" : "kept",
        "ERROR: insert violates foreign key constraint. user_id=99 has no parent in users → the engine refuses the write. Referential integrity preserved.",
        { highlightCols: [1], noteTone: "rose" }),
    ],
  },
  {
    name: "ON DELETE CASCADE — children follow parent",
    sql: [
      "CREATE TABLE orders (",
      "  ...",
      "  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE",
      ");",
      "",
      "DELETE FROM users WHERE id = 1;",
    ],
    table: { name: "orders", cols: FK_OCOLS, rows: FK_ORDERS },
    steps: [
      st([5], (row) => row.cells[1] === 1 ? "dropped" : "kept",
        "Deleting Ada (id=1) cascades into orders — her 2 child rows are auto-deleted in the SAME transaction.",
        { highlightCols: [1], noteTone: "amber" }),
    ],
  },
  {
    name: "ON DELETE SET NULL — keep history, drop the link",
    sql: [
      "...REFERENCES users(id) ON DELETE SET NULL",
      "",
      "DELETE FROM users WHERE id = 1;",
    ],
    table: { name: "orders", cols: FK_OCOLS, rows: [
      r(11,11,null,45), r(12,12,null,30), r(13,13,2,120),
    ]},
    steps: [
      st([2], (row) => row.cells[1] === null ? "added" : "kept",
        "user_id must be NULLABLE. Ada's two orders survive — their user_id becomes NULL. Useful when child rows are still meaningful without the parent.",
        { highlightCols: [1], noteTone: "violet" }),
    ],
  },
  {
    name: "ON DELETE RESTRICT (default) — block the delete",
    sql: ["DELETE FROM users WHERE id = 1;  -- with default RESTRICT"],
    table: { name: "users", cols: FK_UCOLS, rows: FK_USERS },
    steps: [
      st([0], () => "dropped",
        "ERROR: update or delete on 'users' violates foreign key constraint on 'orders'. The parent can't go away while children reference it. Safest default.",
        { noteTone: "rose" }),
    ],
  },
];

// ---------- normalization: 1NF → 5NF → Denormalize ----------
const UN_ROWS: Row[] = [
  r(1, 101, "Ada",   "ada@ex.com",   "Pen, Notebook"),
  r(2, 102, "Ada",   "ada@ex.com",   "Keyboard"),
  r(3, 103, "Linus", "linus@ex.com", "Pen"),
];
const UN_COLS = ["order_id","customer","email","items"];

const NF1_ROWS: Row[] = [
  r(1, 101, "Ada",   "ada@ex.com",   "Pen"),
  r(2, 101, "Ada",   "ada@ex.com",   "Notebook"),
  r(3, 102, "Ada",   "ada@ex.com",   "Keyboard"),
  r(4, 103, "Linus", "linus@ex.com", "Pen"),
];

const sidePanel = (title: string, lines: string[], tone: Tone = "violet") => {
  const colorMap: Record<Tone, string> = {
    mint: "border-mint/40 bg-mint/10 text-mint",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    amber: "border-amber/40 bg-amber/10 text-amber",
    violet: "border-violet/40 bg-violet/10 text-violet",
    neutral: "border-hairline bg-surface-2/40 text-muted-foreground",
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[tone]}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em]">{title}</div>
      {lines.map((l, i) => (
        <div key={i} className="mt-1 font-mono text-[12px] text-foreground/85">{l}</div>
      ))}
    </div>
  );
};

const normStages: Stage[] = [
  {
    name: "Unnormalized — the smell",
    blurb: "One wide table, repeating customer info + a multi-valued cell",
    sql: ["-- BEFORE: all-in-one fact table"],
    table: { name: "orders_flat", cols: UN_COLS, rows: UN_ROWS },
    steps: [
      st([0], () => "dropped",
        "Three problems: 'items' is a LIST in one cell (not atomic); Ada's email REPEATS on every row (update anomaly waiting to happen); no clean way to ask 'how many pens sold?'.",
        { highlightCols: [3], noteTone: "rose", side: sidePanel("Anomalies", ["• Update anomaly","• Insert anomaly","• Delete anomaly"], "rose") }),
    ],
  },
  {
    name: "1NF — atomic cells, no lists",
    blurb: "Split the comma list into separate rows",
    sql: ["-- 1NF: one value per cell"],
    table: { name: "orders_flat", cols: UN_COLS, rows: NF1_ROWS },
    steps: [
      st([0], "added",
        "Order 101 expanded into two rows — one per item. Every cell now holds a SINGLE atomic value. 1NF is the minimum bar.",
        { highlightCols: [3], noteTone: "mint" }),
    ],
  },
  {
    name: "2NF — split partial dependencies",
    blurb: "Non-key columns must depend on the WHOLE composite key",
    sql: [
      "-- Composite key was (order_id, item)",
      "-- 'customer' depends only on order_id  →  move it out",
      "CREATE TABLE orders     (order_id PK, customer, email);",
      "CREATE TABLE order_items(order_id, item, PK(order_id,item));",
    ],
    table: { name: "orders", cols: ["order_id","customer","email"], rows: [
      r(1,101,"Ada","ada@ex.com"), r(2,102,"Ada","ada@ex.com"), r(3,103,"Linus","linus@ex.com"),
    ]},
    steps: [
      st([2,3], "added",
        "Customer info now lives once per order, not per item. 'items' moves into its own table referencing order_id.",
        { side: sidePanel("order_items", ["(101, Pen)","(101, Notebook)","(102, Keyboard)","(103, Pen)"], "violet") }),
    ],
  },
  {
    name: "3NF — kill transitive dependencies",
    blurb: "Non-key columns must depend ONLY on the key",
    sql: [
      "-- order.email depends on order.customer (not directly on order_id)",
      "-- Move customer attributes into customers, reference by id",
      "CREATE TABLE customers (id PK, name, email);",
      "CREATE TABLE orders    (id PK, customer_id REFERENCES customers);",
    ],
    table: { name: "customers", cols: ["id","name","email"], rows: [
      r(1,1,"Ada","ada@ex.com"), r(2,2,"Linus","linus@ex.com"),
    ]},
    steps: [
      st([2,3], "added",
        "An email change touches ONE row in customers — no risk of drift. orders references customer_id. This is the canonical 3NF shape most teams target.",
        { noteTone: "mint", side: sidePanel("orders", ["(101, customer_id=1)","(102, customer_id=1)","(103, customer_id=2)"], "violet") }),
    ],
  },
  {
    name: "BCNF — every determinant is a key",
    blurb: "Stricter 3NF: no non-key column determines a key column",
    sql: [
      "-- Each instructor teaches exactly ONE course",
      "-- Then instructor → course (non-key determining a key part) violates BCNF",
      "CREATE TABLE instructor_course (instructor PK, course);",
      "CREATE TABLE enrollments       (student, instructor REFERENCES instructor_course);",
    ],
    table: { name: "instructor_course", cols: ["instructor","course"], rows: [
      r(1,"Prof. Knuth","Algorithms"),
      r(2,"Prof. Lamport","Distributed"),
    ]},
    steps: [
      st([2,3], "added",
        "BCNF = strict 3NF. Every functional dependency X → Y must have X as a superkey. Practically rare to need beyond 3NF — but useful for integrity.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "4NF — no multi-valued dependencies",
    blurb: "Independent multi-valued facts go in separate tables",
    sql: [
      "-- A teacher has many SUBJECTS and many CLASSROOMS — independently.",
      "-- WRONG: one table (teacher, subject, classroom) → cartesian explosion",
      "CREATE TABLE teacher_subject  (teacher, subject);",
      "CREATE TABLE teacher_classroom(teacher, classroom);",
    ],
    table: { name: "teacher_subject", cols: ["teacher","subject"], rows: [
      r(1,"Ada","Math"), r(2,"Ada","Physics"),
    ]},
    steps: [
      st([2,3], "added",
        "If two attributes are INDEPENDENT multi-valued facts about the same key, store them in SEPARATE tables — otherwise every combination is duplicated.",
        { noteTone: "violet", side: sidePanel("teacher_classroom", ["(Ada, Room 1)","(Ada, Room 2)"], "violet") }),
    ],
  },
  {
    name: "5NF — join-dependency decomposition",
    blurb: "When a 3-way relationship can't be split into 2-ways without loss",
    sql: [
      "-- Rare: Agent–Brand–Product where ALL three constrain each other",
      "-- 5NF decomposes into the smallest set of join-equivalent tables",
      "CREATE TABLE agent_brand   (agent, brand);",
      "CREATE TABLE brand_product (brand, product);",
      "CREATE TABLE agent_product (agent, product);",
    ],
    table: { name: "agent_brand", cols: ["agent","brand"], rows: [r(1,"Ada","Acme"), r(2,"Ada","BigCo")]},
    steps: [
      st([2,3,4], "added",
        "5NF (PJNF) = decompose until ONLY natural join can reconstruct the data. You'll rarely hit this in production — but it's the theoretical end of the line.",
        { noteTone: "neutral" }),
    ],
  },
  {
    name: "Denormalize — undo, deliberately",
    blurb: "Trade write integrity for read speed when measurements demand it",
    sql: [
      "-- Read path is hot: every order_view JOINs 5 tables",
      "-- Solution: pre-compute customer_name on orders",
      "ALTER TABLE orders ADD COLUMN customer_name TEXT;",
      "-- Maintained by trigger or app-layer write fan-out",
    ],
    table: { name: "orders", cols: ["id","customer_id","customer_name","total"], rows: [
      r(1,101,1,"Ada",45),  r(2,102,1,"Ada",30),  r(3,103,2,"Linus",120),
    ]},
    steps: [
      st([2,3], "added",
        "Denormalization REPEATS data so reads avoid joins. Cost: every rename triggers fan-out updates. Do this only when an EXPLAIN plan + load test prove the need.",
        { highlightCols: [2], noteTone: "amber" }),
    ],
  },
];

// ---------- INTRO variants ----------

const introWhatIs: Stage[] = [
  {
    name: "What is a database?",
    blurb: "A long-lived, queryable container for facts",
    sql: ["-- A database = structured storage + a query engine + concurrency control"],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(2,2,"linus@ex.com",90), r(3,3,"grace@ex.com",410),
    ]},
    steps: [
      st([0], "kept",
        "A DATABASE stores data so many users can READ and WRITE it concurrently, safely, and ask QUESTIONS over it in a high-level language. Files alone can't do that.",
        { side: sidePanel("Properties", ["• Persistent","• Concurrent","• Queryable","• Consistent"], "mint") }),
    ],
  },
  {
    name: "DBMS — the software around the data",
    sql: [
      "Client  ──SQL──▶  Database Engine  ──▶  Disk",
      "                  • Parser  • Planner  • Executor  • Storage",
    ],
    table: { name: "users", cols: ["id","email","balance"], rows: [r(1,1,"ada@ex.com",250)]},
    steps: [
      st([0,1], "kept",
        "A DBMS (Database Management System — PostgreSQL, MySQL, SQL Server…) turns SQL into actual file reads/writes and guarantees ACID, concurrency, and security.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "Why not just a spreadsheet?",
    sql: ["-- 1 million rows + 50 concurrent writers + crash safety + audit"],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(2,2,"linus@ex.com",90),
    ]},
    steps: [
      st([0], () => "dropped",
        "Spreadsheets break at scale: no concurrent writes, no integrity rules, no transactions, no indexes, no SQL. A real database solves ALL of those at once.",
        { noteTone: "rose" }),
    ],
  },
  {
    name: "Ask questions in SQL",
    sql: [
      "SELECT email, balance",
      "FROM   users",
      "WHERE  balance > 100",
      "ORDER  BY balance DESC;",
    ],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(2,2,"linus@ex.com",90), r(3,3,"grace@ex.com",410),
    ]},
    steps: [
      st([0,1,2,3], (row) => Number(row.cells[2]) > 100 ? "kept" : "dropped",
        "SQL is DECLARATIVE — describe WHAT you want, the engine figures out HOW. Here: 2 of 3 rows pass the filter, sorted by balance.",
        { highlightCols: [2], noteTone: "mint" }),
    ],
  },
];

const introTypes: Stage[] = [
  {
    name: "Relational (SQL) — the workhorse",
    sql: ["-- PostgreSQL, MySQL, SQL Server, Oracle, SQLite"],
    table: { name: "orders", cols: ["id","user_id","total"], rows: [
      r(1,11,1,45), r(2,12,1,30), r(3,13,2,120),
    ]},
    steps: [
      st([0], "kept",
        "RELATIONAL: tables + foreign keys + SQL. Strongest integrity guarantees, mature optimisers. Default choice for transactional systems.",
        { side: sidePanel("Strengths", ["• ACID","• Joins","• Constraints","• SQL"], "mint") }),
    ],
  },
  {
    name: "Document — JSON-native",
    sql: ["// MongoDB, CouchDB, DynamoDB (with documents)"],
    table: { name: "events", cols: ["_id","payload"], rows: [
      r(1,"e1",'{"type":"signup","plan":"pro"}'),
      r(2,"e2",'{"type":"view","page":"/pricing"}'),
    ]},
    steps: [
      st([0], "kept",
        "DOCUMENT stores: each record is a nested JSON blob. Great for shape-varying data and rapid iteration. Weaker on cross-document joins and integrity.",
        { highlightCols: [1], noteTone: "violet" }),
    ],
  },
  {
    name: "Key-value — O(1) lookup",
    sql: ["// Redis, Memcached, etcd"],
    table: { name: "cache", cols: ["key","value"], rows: [
      r(1,"session:abc","{user:1}"), r(2,"cart:42","[3,7,9]"), r(3,"rate:ada","94"),
    ]},
    steps: [
      st([0], "kept",
        "KEY-VALUE: a hashmap, persisted. Single key → single value, microsecond reads. Used for caches, sessions, queues — not primary storage.",
        { highlightCols: [0], noteTone: "violet" }),
    ],
  },
  {
    name: "Graph — relationships are first-class",
    sql: ["// Neo4j, Memgraph; or graph extensions in Postgres / SQL Server"],
    table: { name: "edges", cols: ["from","rel","to"], rows: [
      r(1,"Ada","FOLLOWS","Linus"), r(2,"Linus","FOLLOWS","Grace"), r(3,"Ada","LIKES","Post#7"),
    ]},
    steps: [
      st([0], "kept",
        "GRAPH: nodes + edges. Traversals (friends-of-friends, fraud rings) are O(degree) instead of N joins. Use when relationships ARE the workload.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "Columnar / OLAP — analytics at scale",
    sql: ["-- ClickHouse, DuckDB, Snowflake, BigQuery, Redshift"],
    table: { name: "events_columnar", cols: ["day","country","revenue"], rows: [
      r(1,"2026-06-01","US",12000), r(2,"2026-06-01","DE",4500),
      r(3,"2026-06-02","US",13800),
    ]},
    steps: [
      st([0], "kept",
        "COLUMNAR stores each column contiguously → reading 2 columns from a 100-column table is 50× cheaper. Built for SUM/AVG over billions of rows, not row-level updates.",
        { highlightCols: [2], noteTone: "mint" }),
    ],
  },
];

const introHow: Stage[] = [
  {
    name: "1 — Client sends SQL",
    sql: ["psql> SELECT * FROM users WHERE id = 2;"],
    table: { name: "users", cols: ["id","email"], rows: [r(1,1,"ada@ex.com"), r(2,2,"linus@ex.com")]},
    steps: [
      st([0], "pending",
        "Your app opens a TCP connection to the DB. The SQL string travels over the wire as bytes — nothing has executed yet.",
        { side: sidePanel("Wire protocol", ["• TCP / TLS","• Auth handshake","• Send query"], "neutral") }),
    ],
  },
  {
    name: "2 — Parser builds an AST",
    sql: ["-- 'SELECT * FROM users WHERE id = 2'", "-- ↓ tokenize ↓ parse", "-- AST: SELECT(*, FROM=users, WHERE=Eq(id,2))"],
    table: { name: "users", cols: ["id","email"], rows: [r(1,1,"ada@ex.com"), r(2,2,"linus@ex.com")]},
    steps: [
      st([0,1,2], "pending",
        "The PARSER turns text into a tree the engine can reason about. Syntax errors die here.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "3 — Planner picks an execution plan",
    sql: ["-- Plan A: SeqScan users + filter id=2   (cost 100)", "-- Plan B: IndexScan users_pkey on id=2  (cost 1.5)", "-- ✓ Choose Plan B"],
    table: { name: "users", cols: ["id","email"], rows: [r(1,1,"ada@ex.com"), r(2,2,"linus@ex.com")]},
    steps: [
      st([0,1,2], "pending",
        "The PLANNER considers strategies (use an index? scan the whole table? join order?) and picks the cheapest based on statistics.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "4 — Executor runs the plan",
    sql: ["-- IndexScan(users_pkey): probe id=2 → page 42, slot 1 → fetch row"],
    table: { name: "users", cols: ["id","email"], rows: [r(1,1,"ada@ex.com"), r(2,2,"linus@ex.com")]},
    steps: [
      st([0], (row) => row.cells[0] === 2 ? "kept" : "dropped",
        "The EXECUTOR walks the chosen plan: read pages from disk (or buffer cache), apply filters, build result rows.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "5 — Result streamed back",
    sql: ["-- 1 row returned → serialised → TCP → client"],
    table: { name: "result", cols: ["id","email"], rows: [r(1,2,"linus@ex.com")]},
    steps: [
      st([0], "added",
        "Matching rows are formatted in the wire protocol and streamed to the client. Done.",
        { noteTone: "mint" }),
    ],
  },
];

const introQuerying: Stage[] = [
  {
    name: "Declarative vs imperative",
    sql: [
      "// IMPERATIVE (code):",
      "for (row in users) if (row.balance > 100) print(row);",
      "",
      "-- DECLARATIVE (SQL):",
      "SELECT * FROM users WHERE balance > 100;",
    ],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(2,2,"linus@ex.com",90), r(3,3,"grace@ex.com",410),
    ]},
    steps: [
      st([3,4], pass((row) => Number(row.cells[2]) > 100),
        "You describe WHAT you want; the engine chooses HOW. The same SQL stays correct as data grows from 100 rows to 100 million.",
        { highlightCols: [2], noteTone: "mint" }),
    ],
  },
  {
    name: "Filter — narrow the rows",
    sql: ["SELECT * FROM users WHERE balance > 100"],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(2,2,"linus@ex.com",90), r(3,3,"grace@ex.com",410),
    ]},
    steps: [
      st([0], pass((row) => Number(row.cells[2]) > 100),
        "WHERE filters row-by-row. Linus (balance=90) fails — dropped.", { highlightCols: [2] }),
    ],
  },
  {
    name: "Project — pick the columns",
    sql: ["SELECT email, balance FROM users WHERE balance > 100"],
    table: { name: "users", cols: ["id","email","balance"], rows: [
      r(1,1,"ada@ex.com",250), r(3,3,"grace@ex.com",410),
    ]},
    steps: [
      st([0], "kept",
        "SELECT names the columns you want. Smaller payload, faster wire transfer.", { highlightCols: [1,2] }),
    ],
  },
  {
    name: "Sort & limit",
    sql: ["SELECT email, balance FROM users", "WHERE  balance > 100", "ORDER  BY balance DESC", "LIMIT  1"],
    table: { name: "result", cols: ["email","balance"], rows: [r(1,"grace@ex.com",410)]},
    steps: [
      st([2,3], "added",
        "ORDER BY orders survivors; LIMIT caps the output. Together: 'top N' in one line.",
        { noteTone: "mint" }),
    ],
  },
  {
    name: "Aggregate — collapse many rows into a summary",
    sql: ["SELECT COUNT(*), AVG(balance) FROM users"],
    table: { name: "result", cols: ["count","avg_balance"], rows: [r(1,3,250)]},
    steps: [
      st([0], "added",
        "Aggregates reduce N rows to 1 summary row. GROUP BY does it per category. This is how SQL turns raw events into reports.",
        { noteTone: "violet" }),
    ],
  },
];

const introStorage: Stage[] = [
  {
    name: "Rows live inside fixed-size PAGES",
    sql: ["-- A table = an ordered file of 8 KB pages (Postgres default)", "-- Each page packs many rows + a small header"],
    table: { name: "page 42  (8 KB)", cols: ["slot","row"], rows: [
      r(1,"#1","(1, ada@ex.com)"),
      r(2,"#2","(2, linus@ex.com)"),
      r(3,"#3","(3, grace@ex.com)"),
      r(4,"…","free space"),
    ]},
    steps: [
      st([0,1], "kept",
        "The engine reads ENTIRE pages from disk — never single rows. Smaller rows = more rows/page = fewer page reads.",
        { noteTone: "violet" }),
    ],
  },
  {
    name: "Heap files are unordered",
    sql: ["-- New INSERTs go into the next page with free space"],
    table: { name: "heap (users)", cols: ["page","row"], rows: [
      r(1,"p41","(2, linus)"), r(2,"p41","(4, alan)"),
      r(3,"p42","(1, ada)"),   r(4,"p42","(3, grace)"),
    ]},
    steps: [
      st([0], "kept",
        "Rows are NOT sorted on disk. To find id=3 with no index, the engine must scan every page — a SEQUENTIAL SCAN.",
        { noteTone: "amber" }),
    ],
  },
  {
    name: "Indexes — a sorted shortcut",
    sql: ["CREATE INDEX idx_users_id ON users(id);  -- B-Tree by default"],
    table: { name: "idx_users_id  (B-Tree)", cols: ["key","ptr"], rows: [
      r(1,1,"p42·s1"), r(2,2,"p41·s1"), r(3,3,"p42·s2"), r(4,4,"p41·s2"),
    ]},
    steps: [
      st([0], "added",
        "A B-Tree index is a SORTED map: key → physical address (page + slot). Lookup becomes O(log n) instead of O(n).",
        { highlightCols: [0], noteTone: "mint" }),
    ],
  },
  {
    name: "Buffer cache + WAL — fast AND durable",
    sql: [
      "-- WRITE path:",
      "-- 1. modify row in shared buffer (RAM)",
      "-- 2. append change to WAL (write-ahead log, sequential on disk)",
      "-- 3. fsync WAL  →  COMMIT returns",
      "-- 4. dirty page flushed to heap later (background)",
    ],
    table: { name: "buffer cache", cols: ["page","state"], rows: [
      r(1,"p42","dirty"), r(2,"p41","clean"), r(3,"p38","dirty"),
    ]},
    steps: [
      st([0,1,2,3,4], "kept",
        "Two tricks: keep hot pages in RAM (buffer cache), and write to a SEQUENTIAL log first so COMMITs return fast even before random heap writes finish. Crash? Replay the WAL.",
        { noteTone: "mint" }),
    ],
  },
];

// ============================================================
// (Optional / unused) where-filter, group-by-agg, join-types, set-ops
// for the foundations variant union — alias to richer Querying stages.
// ============================================================

const whereFilterStages = boolStages;
const groupByAggStages = grpStages;
const joinTypesStages = vennStages;
const foundationsSetOpsStages = setopsStages;

// ============================================================
// REGISTRY
// ============================================================

export const STAGES_REGISTRY = {
  // Querying
  "q-bool":       boolStages,
  "q-range":      rangeStages,
  "q-like":       likeStages,
  "q-null3vl":    null3vlStages,
  "q-aggr":       aggrStages,
  "q-grpby":      grpStages,
  "q-having":     havingStages,
  "q-cube":       cubeStages,
  "q-venn":       vennStages,
  "q-self":       selfStages,
  "q-semianti":   semiStages,
  "q-algos":      algosStages,
  "q-scalar":     scalarStages,
  "q-corr":       corrStages,
  "q-existsin":   existsStages,
  "q-setops":     setopsStages,
  // Foundations — basics
  "pipeline":          pipelineStages,
  "select-projection": projStages,
  "table-build":       tableBuildStages,
  "foreign-key":       fkStages,
  "null-truth":        nullTruthStages,
  "type-sizes":        typeStages,
  "where-filter":      whereFilterStages,
  "group-by-agg":      groupByAggStages,
  "join-types":        joinTypesStages,
  "set-ops":           foundationsSetOpsStages,
  // Foundations — deep-dive pedagogical
  "table-anatomy":     tableAnatomyStages,
  "pk-anatomy":        pkStages,
  "fk-deep":           fkDeepStages,
  "normalization":     normStages,
  // Intro
  "intro-what-is-db":   introWhatIs,
  "intro-db-types":     introTypes,
  "intro-how-db-works": introHow,
  "intro-querying":     introQuerying,
  "intro-storage":      introStorage,
} as const;

export type AnyVariant = keyof typeof STAGES_REGISTRY;
