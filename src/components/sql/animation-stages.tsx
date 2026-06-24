import type { Row, Stage, StageStep, RowState } from "@/components/sql/MultiStage";

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
        "NOT IN expands to status<>'refund' AND status<>NULL. The second compares to NULL → UNKNOWN → row drops. ZERO rows returned.",
        { highlightCols: [3], noteTone: "rose" }),
      st([2], pass((r) => r.cells[3] !== "refund"),
        "Fix: NOT IN (SELECT … WHERE x IS NOT NULL), or use NOT EXISTS which handles NULL correctly.",
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
        "HAVING is WHERE for groups — runs AFTER aggregation. Bob's $50 falls below threshold and the bucket is dropped.",
        { side: bucketPanel([{k:"Ada ✓",sum:125},{k:"Linus ✓",sum:195}]) }),
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
      st([0,1,2,3,4], pass((r) => r.cells[3] === "paid" && (r.cells[1] === "Ada" || r.cells[1] === "Linus")),
        "SELECT runs LAST — that's why you can't reference column aliases in WHERE or GROUP BY in standard SQL.",
        { noteTone: "violet" }),
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

// ----- q-venn: INNER, LEFT, RIGHT, FULL -----
const USERS_J: Row[] = [
  r(1, 1, "Ada"),
  r(2, 2, "Linus"),
  r(3, 3, "Grace"),
];
const ORDERS_J: Row[] = [
  r(11, 11, 1, "$45"),
  r(12, 12, 1, "$30"),
  r(13, 13, 2, "$120"),
  r(14, 14, 99, "$10"),  // orphan
];

const joinResult = (kind: "INNER"|"LEFT"|"RIGHT"|"FULL") => {
  const rows: Row[] = [];
  if (kind === "INNER" || kind === "LEFT" || kind === "FULL") {
    rows.push(r("a1", 1, "Ada", 11, "$45"));
    rows.push(r("a2", 1, "Ada", 12, "$30"));
    rows.push(r("l1", 2, "Linus", 13, "$120"));
  }
  if (kind === "LEFT" || kind === "FULL") rows.push(r("g", 3, "Grace", null, null));
  if (kind === "RIGHT" || kind === "FULL") rows.push(r("o", null, null, 14, "$10"));
  if (kind === "RIGHT") {
    rows.unshift(r("a1", 1, "Ada", 11, "$45"), r("a2", 1, "Ada", 12, "$30"), r("l1", 2, "Linus", 13, "$120"));
  }
  return rows;
};

const venn = (kind: "INNER"|"LEFT"|"RIGHT"|"FULL"): React.ReactNode => {
  const left = kind === "LEFT" || kind === "FULL";
  const right = kind === "RIGHT" || kind === "FULL";
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-surface-2/40 p-3">
      <div className={`h-16 w-16 rounded-full border-2 ${left ? "border-mint bg-mint/20" : "border-mint/40"} -mr-6`} />
      <div className="z-10 h-16 w-16 rounded-full border-2 border-mint bg-mint/40" />
      <div className={`h-16 w-16 rounded-full border-2 ${right ? "border-mint bg-mint/20" : "border-mint/40"} -ml-6`} />
    </div>
  );
};

const vennStages: Stage[] = [
  {
    name: "INNER JOIN — intersection",
    sql: [
      "SELECT u.id, u.name, o.id AS order_id, o.total",
      "FROM   users u",
      "INNER  JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["user_id","name","order_id","total"], rows: joinResult("INNER") },
    steps: [
      st([2], "added", "Only rows where the predicate u.id = o.user_id is TRUE. Grace (no orders) and the orphan order vanish.",
        { side: venn("INNER") }),
    ],
  },
  {
    name: "LEFT JOIN — keep all left rows",
    sql: [
      "SELECT u.id, u.name, o.id AS order_id, o.total",
      "FROM   users u",
      "LEFT   JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["user_id","name","order_id","total"], rows: joinResult("LEFT") },
    steps: [
      st([2], "added", "Every user appears at least once. No match? Right-side columns become NULL. Grace appears with NULL order.",
        { side: venn("LEFT") }),
    ],
  },
  {
    name: "RIGHT JOIN — keep all right rows",
    sql: [
      "SELECT u.id, u.name, o.id AS order_id, o.total",
      "FROM   users u",
      "RIGHT  JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["user_id","name","order_id","total"], rows: joinResult("RIGHT") },
    steps: [
      st([2], "added", "Mirror of LEFT. Orphan order 14 (user_id=99) surfaces with NULL user. Convention: prefer LEFT and reorder tables.",
        { side: venn("RIGHT") }),
    ],
  },
  {
    name: "FULL OUTER JOIN — union of both",
    sql: [
      "SELECT u.id, u.name, o.id AS order_id, o.total",
      "FROM   users u",
      "FULL   JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["user_id","name","order_id","total"], rows: joinResult("FULL") },
    steps: [
      st([2], "added", "Both unmatched sides preserved. Useful for reconciliation: 'who is on side A but not side B, and vice versa?'",
        { side: venn("FULL") }),
    ],
  },
];

// ----- q-self: alias, parent-child, hierarchy -----
const EMP_S: Row[] = [
  r(1, 1, "Ada",   null),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", 1),
  r(4, 4, "Bob",   2),
  r(5, 5, "Eve",   2),
];
const SCOLS = ["id", "name", "manager_id"];

const selfStages: Stage[] = [
  {
    name: "Alias the table twice",
    sql: [
      "SELECT e.name, m.name AS manager",
      "FROM   employees e, employees m",
      "WHERE  e.manager_id = m.id",
    ],
    table: { name: "employees", cols: SCOLS, rows: EMP_S },
    steps: [
      st([1], "kept",
        "The SAME table is referenced twice with two aliases — the engine treats them as independent relations.",
        { highlightCols: [0,1,2] }),
    ],
  },
  {
    name: "Parent-child match",
    sql: [
      "SELECT e.name AS emp, m.name AS manager",
      "FROM   employees e",
      "JOIN   employees m ON e.manager_id = m.id",
    ],
    table: { name: "(e ⨝ m)", cols: ["emp","manager"], rows: [
      r("lin","Linus","Ada"),
      r("gra","Grace","Ada"),
      r("bob","Bob","Linus"),
      r("eve","Eve","Linus"),
    ]},
    steps: [
      st([2], "added",
        "Each row is glued to its parent. Ada drops (no manager — NULL fails the equi-join, exactly like an INNER JOIN on a nullable FK).", { noteTone: "amber" }),
    ],
  },
  {
    name: "Keep the root with LEFT",
    sql: [
      "SELECT e.name AS emp,",
      "       COALESCE(m.name, '— root —') AS manager",
      "FROM   employees e",
      "LEFT   JOIN employees m ON e.manager_id = m.id",
    ],
    table: { name: "(e ⟕ m)", cols: ["emp","manager"], rows: [
      r("ada","Ada","— root —"),
      r("lin","Linus","Ada"),
      r("gra","Grace","Ada"),
      r("bob","Bob","Linus"),
      r("eve","Eve","Linus"),
    ]},
    steps: [
      st([3], "added",
        "LEFT JOIN preserves Ada. For arbitrary-depth trees use a recursive CTE — self-join only walks ONE level."),
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
  // Foundations
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
} as const;

export type AnyVariant = keyof typeof STAGES_REGISTRY;
