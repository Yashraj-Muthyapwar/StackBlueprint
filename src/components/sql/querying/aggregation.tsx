import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { pass, r, st } from "../animation-shared";

// ----- q-aggr: COUNT(*), COUNT(col), SUM/AVG, MIN/MAX -----
const SALES_A: Row[] = [
  r(1, 1, "EU", 40),
  r(2, 2, "US", null),
  r(3, 3, "EU", 25),
  r(4, 4, "APAC", 90),
  r(5, 5, "US", 110),
  r(6, 6, "EU", null),
];
const ACOLS = ["id", "region", "amount"];

const sumPanel = (label: string, value: string) => (
  <div className="rounded-lg border border-mint/40 bg-mint/10 p-3">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mint">{label}</div>
    <div className="mt-1 font-mono text-2xl text-mint">= {value}</div>
  </div>
);

export const aggrStages: Stage[] = [
  {
    name: "COUNT(*) — every row",
    sql: ["SELECT COUNT(*) AS n", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st(
        [0],
        () => "kept" as RowState,
        "COUNT(*) counts ROWS, not values. NULLs are NOT skipped — 6 rows total.",
        { side: sumPanel("COUNT(*)", "6") },
      ),
    ],
  },
  {
    name: "COUNT(col) — skips NULL",
    sql: ["SELECT COUNT(amount) AS n", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st(
        [0],
        (row) => (row.cells[2] === null ? ("dropped" as RowState) : ("kept" as RowState)),
        "COUNT(col) counts non-NULL VALUES of that column. The two NULL amounts are skipped → 4.",
        { highlightCols: [2], side: sumPanel("COUNT(amount)", "4") },
      ),
    ],
  },
  {
    name: "SUM / AVG — beware NULL",
    sql: ["SELECT SUM(amount) AS total,", "       AVG(amount) AS mean", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st(
        [0],
        (row) => (row.cells[2] === null ? ("dropped" as RowState) : ("kept" as RowState)),
        "SUM/AVG ignore NULLs. AVG = SUM/COUNT(col), NOT COUNT(*) — different denominator! 265/4 = 66.25, not 265/6.",
        { highlightCols: [2], side: sumPanel("SUM / AVG", "$265 / $66.25"), noteTone: "amber" },
      ),
    ],
  },
  {
    name: "MIN / MAX",
    sql: ["SELECT MIN(amount), MAX(amount)", "FROM   sales"],
    table: { name: "sales", cols: ACOLS, rows: SALES_A },
    steps: [
      st(
        [0],
        (row) => (row.cells[2] === null ? ("dropped" as RowState) : ("kept" as RowState)),
        "Extremes over non-NULL values. MIN/MAX use an index endpoint if one exists — O(log n), not O(n).",
        { highlightCols: [2], side: sumPanel("MIN / MAX", "$25 / $110") },
      ),
    ],
  },
];

// ----- q-grpby: single key, multi key, with aggregate -----
const SALES_G: Row[] = [
  r(1, 1, "EU", "Q1", 40),
  r(2, 2, "EU", "Q2", 25),
  r(3, 3, "US", "Q1", 90),
  r(4, 4, "US", "Q2", 110),
  r(5, 5, "APAC", "Q1", 60),
  r(6, 6, "EU", "Q1", 55),
];
const GCOLS = ["id", "region", "quarter", "amount"];

const bucketPanel = (groups: { k: string; sum: number }[]) => (
  <div className="grid gap-2">
    {groups.map((g) => (
      <div
        key={g.k}
        className="flex items-center justify-between rounded-md border border-violet/40 bg-violet/5 px-3 py-2 font-mono text-[12px]"
      >
        <span className="text-violet">{g.k}</span>
        <span className="text-mint">Σ = ${g.sum}</span>
      </div>
    ))}
  </div>
);

export const grpStages: Stage[] = [
  {
    name: "Single-key bucketing",
    sql: ["SELECT region, SUM(amount) AS total", "FROM   sales", "GROUP  BY region"],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st([2], () => "kept" as RowState, "Hash each row on region → 3 buckets (EU, US, APAC).", {
        highlightCols: [1],
      }),
      st(
        [0, 2],
        () => "kept" as RowState,
        "Reduce each bucket: SUM(amount). One output row per group.",
        {
          highlightCols: [1, 3],
          side: bucketPanel([
            { k: "EU", sum: 120 },
            { k: "US", sum: 200 },
            { k: "APAC", sum: 60 },
          ]),
        },
      ),
    ],
  },
  {
    name: "Multi-key bucketing",
    sql: ["SELECT region, quarter, SUM(amount)", "FROM   sales", "GROUP  BY region, quarter"],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "Composite key (region, quarter). EU+Q1 has two rows; EU+Q2 one — 5 buckets.",
        { highlightCols: [1, 2] },
      ),
      st(
        [0, 2],
        () => "kept" as RowState,
        "Multi-dim grouping. Output cardinality = distinct(region,quarter) tuples.",
        {
          side: bucketPanel([
            { k: "EU·Q1", sum: 95 },
            { k: "EU·Q2", sum: 25 },
            { k: "US·Q1", sum: 90 },
            { k: "US·Q2", sum: 110 },
            { k: "APAC·Q1", sum: 60 },
          ]),
        },
      ),
    ],
  },
  {
    name: "Every non-aggregated column must be in GROUP BY",
    sql: ["SELECT region, quarter, amount  -- ERROR", "FROM   sales", "GROUP  BY region"],
    table: { name: "sales", cols: GCOLS, rows: SALES_G },
    steps: [
      st(
        [0],
        () => "dropped" as RowState,
        "Standard-SQL error: 'quarter' / 'amount' not in GROUP BY and not aggregated. Postgres/Oracle reject; MySQL ONLY_FULL_GROUP_BY off picks an arbitrary row — silent data corruption.",
        { highlightCols: [2, 3], noteTone: "rose" },
      ),
    ],
  },
];

// ----- q-having: WHERE only, GROUP BY, HAVING, combined -----
export const ORD_H: Row[] = [
  r(1, 1, "Ada", 45, "paid"),
  r(2, 2, "Linus", 120, "paid"),
  r(3, 3, "Grace", 30, "pending"),
  r(4, 4, "Ada", 80, "paid"),
  r(5, 5, "Bob", 50, "paid"),
  r(6, 6, "Linus", 75, "paid"),
];
export const HCOLS = ["id", "customer", "total", "status"];

export const havingStages: Stage[] = [
  {
    name: "WHERE filters rows",
    sql: ["SELECT id, customer, total, status", "FROM   orders", "WHERE  status = 'paid'"],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [2],
        pass((r) => r.cells[3] === "paid"),
        "WHERE runs BEFORE grouping — operates on raw rows. Grace's pending order drops here.",
        { highlightCols: [3] },
      ),
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
      st(
        [3],
        pass((r) => r.cells[3] === "paid"),
        "Surviving rows bucket by customer. Aggregates compute per bucket.",
        {
          highlightCols: [1],
          side: bucketPanel([
            { k: "Ada", sum: 125 },
            { k: "Linus", sum: 195 },
            { k: "Bob", sum: 50 },
          ]),
        },
      ),
      st(
        [0, 3],
        "added",
        "Final projection: only customer and SUM(total) AS revenue leave the operator — 3 rows.",
        {
          rowsOverride: [r("ada", "Ada", 125), r("lin", "Linus", 195), r("bob", "Bob", 50)],
          colsOverride: ["customer", "revenue"],
          noteTone: "violet",
        },
      ),
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
      st(
        [4],
        pass((r) => r.cells[3] === "paid"),
        "HAVING is WHERE for groups — runs AFTER aggregation. Bob's $50 bucket falls below threshold and is dropped.",
        {
          side: bucketPanel([
            { k: "Ada ✓", sum: 125 },
            { k: "Linus ✓", sum: 195 },
            { k: "Bob ✗", sum: 50 },
          ]),
        },
      ),
      st([0, 4], "added", "Result projection — exactly the columns named in SELECT.", {
        rowsOverride: [r("ada", "Ada", 125), r("lin", "Linus", 195)],
        colsOverride: ["customer", "revenue"],
        noteTone: "violet",
      }),
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
      st([1], "pending", "Step 1 — FROM resolves the source relation.", { noteTone: "neutral" }),
      st(
        [2],
        pass((r) => r.cells[3] === "paid"),
        "Step 2 — WHERE filters raw rows. Grace (pending) drops.",
        { highlightCols: [3] },
      ),
      st(
        [3],
        pass((r) => r.cells[3] === "paid"),
        "Step 3 — GROUP BY hashes survivors by customer (Ada, Linus, Bob).",
        {
          highlightCols: [1],
          side: bucketPanel([
            { k: "Ada", sum: 125 },
            { k: "Linus", sum: 195 },
            { k: "Bob", sum: 50 },
          ]),
        },
      ),
      st(
        [4],
        pass((r) => r.cells[3] === "paid" && r.cells[1] !== "Bob"),
        "Step 4 — HAVING drops Bob's bucket (50 < 100).",
        {
          side: bucketPanel([
            { k: "Ada ✓", sum: 125 },
            { k: "Linus ✓", sum: 195 },
          ]),
        },
      ),
      st(
        [0],
        "added",
        "Step 5 — SELECT runs LAST. Only the projected columns reach the client; that's why aliases declared here are invisible to WHERE / GROUP BY.",
        {
          rowsOverride: [r("ada", "Ada", 125), r("lin", "Linus", 195)],
          colsOverride: ["customer", "revenue"],
          noteTone: "violet",
        },
      ),
    ],
  },
];

// ----- q-cube: GROUPING SETS, ROLLUP, CUBE -----
const cubeData: Row[] = [
  r(1, "EU", "Q1", 100),
  r(2, "EU", "Q2", 80),
  r(3, "US", "Q1", 200),
  r(4, "US", "Q2", 150),
];
const cubeCols = ["region", "quarter", "amount"];

export const cubeStages: Stage[] = [
  {
    name: "GROUPING SETS — explicit",
    sql: [
      "SELECT region, quarter, SUM(amount)",
      "FROM   sales",
      "GROUP  BY GROUPING SETS ((region), (quarter), ())",
    ],
    table: { name: "sales", cols: cubeCols, rows: cubeData },
    steps: [
      st(
        [2],
        "added",
        "Multiple grouping dimensions in ONE pass. () = grand total. NULL appears in the dimension columns of the totals row.",
        {
          rowsOverride: [
            r("eu", "EU", null, 180),
            r("us", "US", null, 350),
            r("q1", null, "Q1", 300),
            r("q2", null, "Q2", 230),
            r("all", null, null, 530),
          ],
          colsOverride: cubeCols,
        },
      ),
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
      st(
        [2],
        "added",
        "ROLLUP(a,b) = GROUPING SETS ((a,b),(a),()). One subtotal per prefix → great for hierarchies like (year, quarter, month).",
        {
          rowsOverride: [
            r(1, "EU", "Q1", 100),
            r(2, "EU", "Q2", 80),
            r("eu", "EU", null, 180),
            r(3, "US", "Q1", 200),
            r(4, "US", "Q2", 150),
            r("us", "US", null, 350),
            r("all", null, null, 530),
          ],
        },
      ),
    ],
  },
  {
    name: "CUBE — all combinations",
    sql: ["SELECT region, quarter, SUM(amount)", "FROM   sales", "GROUP  BY CUBE(region, quarter)"],
    table: { name: "sales", cols: cubeCols, rows: cubeData },
    steps: [
      st(
        [2],
        "added",
        "CUBE(a,b) = power set of grouping columns: (a,b),(a),(b),(). 2^N output partitions — explodes with each dim. Use sparingly.",
        {
          noteTone: "amber",
          rowsOverride: [
            r(1, "EU", "Q1", 100),
            r(2, "EU", "Q2", 80),
            r(3, "US", "Q1", 200),
            r(4, "US", "Q2", 150),
            r("eu", "EU", null, 180),
            r("us", "US", null, 350),
            r("q1", null, "Q1", 300),
            r("q2", null, "Q2", 230),
            r("all", null, null, 530),
          ],
        },
      ),
    ],
  },
];

// ============================================================
// Module 3: Joins
// ============================================================
