import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { pass, r, st } from "../animation-shared";

// ----- q-aggr: Cycle Depot aggregates -----
// The full generated dataset has 142 orders, 60 customers, and 30 products.
// Each animation table is intentionally a labelled preview of that real data.
const ORDER_PREVIEW: Row[] = [
  r(1, 1, 1, "2023-08-25", "shipped"),
  r(2, 2, 1, "2023-09-09", "delivered"),
  r(3, 3, 1, "2024-10-16", "delivered"),
  r(4, 4, 1, "2024-08-29", "delivered"),
  r(5, 5, 2, "2025-06-04", "delivered"),
  r(6, 6, 2, "2023-09-25", "shipped"),
];
const ORDER_COLS = ["id", "customer_id", "order_date", "status"];

const CUSTOMER_PREVIEW: Row[] = [
  r(1, 1, "Zane Novak", "Austin", "USA"),
  r(2, 2, "Boris Alvarez", "Bristol", "UK"),
  r(3, 3, "Priya Doyle", "Manchester", "UK"),
  r(4, 4, "Ugo Mensah", "Dallas", "USA"),
  r(5, 5, "Omar Doyle", null, "Germany"),
  r(6, 6, "Sami Mensah", "Portland", "USA"),
];
const CUSTOMER_COLS = ["id", "name", "city", "country"];

const PRODUCT_PREVIEW: Row[] = [
  r(1, "Trailhead 29 Hardtail", 1299),
  r(5, "Meridian Road Alloy", 1150),
  r(7, "Aero Sprint Pro", 5400),
  r(13, "Shellcap Road Helmet", 129),
  r(26, "Frame Pump", 39),
];
const PRODUCT_COLS = ["name", "price"];

const sumPanel = (label: string, value: string) => (
  <div className="rounded-lg border border-mint/40 bg-mint/10 p-3">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mint">{label}</div>
    <div className="mt-1 font-mono text-2xl text-mint">= {value}</div>
  </div>
);

export const aggrStages: Stage[] = [
  {
    name: "COUNT(*) counts rows",
    canvasMinHeight: 570,
    sql: ["SELECT COUNT(*) AS order_count", "FROM   orders"],
    table: { name: "orders preview", cols: ORDER_COLS, rows: ORDER_PREVIEW },
    steps: [
      st(
        [0],
        () => "kept" as RowState,
        "COUNT(*) counts every row. The preview shows 6 rows, but the full Cycle Depot orders table contains 142 order rows.",
        { side: sumPanel("COUNT(*)", "142 orders") },
      ),
    ],
  },
  {
    name: "COUNT(column) skips NULL",
    sql: ["SELECT COUNT(city) AS customers_with_city", "FROM   customers"],
    table: { name: "customers preview", cols: CUSTOMER_COLS, rows: CUSTOMER_PREVIEW },
    steps: [
      st(
        [0],
        (row) => (row.cells[2] === null ? ("dropped" as RowState) : ("kept" as RowState)),
        "COUNT(city) ignores missing cities. Omar's NULL city is skipped, so the full dataset has 55 city values even though it has 60 customers.",
        { highlightCols: [2], side: sumPanel("COUNT(city)", "55 customers") },
      ),
    ],
  },
  {
    name: "COUNT(DISTINCT) removes repeats",
    sql: ["SELECT COUNT(DISTINCT country) AS country_count", "FROM   customers"],
    table: { name: "customers preview", cols: CUSTOMER_COLS, rows: CUSTOMER_PREVIEW },
    steps: [
      st(
        [0],
        () => "kept" as RowState,
        "USA and UK appear more than once in this preview, but DISTINCT keeps each country value once. Across all customers, Cycle Depot has 6 distinct countries.",
        { highlightCols: [3], side: sumPanel("COUNT(DISTINCT country)", "6 countries"), noteTone: "violet" },
      ),
    ],
  },
  {
    name: "SUM, AVG, MIN, and MAX",
    sql: ["SELECT SUM(price), AVG(price),", "       MIN(price), MAX(price)", "FROM   products"],
    table: { name: "products preview", cols: PRODUCT_COLS, rows: PRODUCT_PREVIEW },
    steps: [
      st(
        [0],
        () => "kept" as RowState,
        "These reducers answer different questions about the same price column: total, typical value, cheapest value, and most expensive value. They all ignore NULL inputs.",
        { highlightCols: [1], side: sumPanel("all 30 product prices", "Σ $32,515 · avg $1,083.83 · $28 to $5,400") },
      ),
    ],
  },
];

// ----- q-grpby: Cycle Depot status and channel summaries -----
// This is a small, labelled preview of real orders. Aggregate output below uses
// the full 142-row Cycle Depot orders table.
const GROUP_ORDER_PREVIEW: Row[] = [
  r(1, 1, "shipped"),
  r(2, 1, "delivered"),
  r(3, 1, "delivered"),
  r(4, 1, "delivered"),
  r(5, 2, "delivered"),
  r(6, 2, "shipped"),
];
const GROUP_ORDER_COLS = ["id", "customer_id", "status"];

const STATUS_COUNTS: Row[] = [
  r("cancelled", "cancelled", 9),
  r("delivered", "delivered", 84),
  r("pending", "pending", 13),
  r("returned", "returned", 4),
  r("shipped", "shipped", 32),
];

const STATUS_CHANNEL_PREVIEW: Row[] = [
  r("cancelled-store", "cancelled", "store", 1),
  r("cancelled-web", "cancelled", "web", 8),
  r("delivered-partner", "delivered", "partner", 8),
  r("delivered-store", "delivered", "store", 25),
  r("delivered-web", "delivered", "web", 51),
  r("pending-partner", "pending", "partner", 1),
  r("pending-store", "pending", "store", 2),
];

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

const countPanel = (groups: { key: string; count: number }[]) => (
  <div className="grid gap-2">
    {groups.map((group) => (
      <div
        key={group.key}
        className="flex items-center justify-between rounded-md border border-violet/40 bg-violet/5 px-3 py-2 font-mono text-[12px]"
      >
        <span className="text-violet">{group.key}</span>
        <span className="text-mint">{group.count} orders</span>
      </div>
    ))}
  </div>
);

export const grpStages: Stage[] = [
  {
    name: "One total has no groups",
    canvasMinHeight: 536,
    sql: ["SELECT COUNT(*) AS order_count", "FROM   orders"],
    table: { name: "orders preview", cols: GROUP_ORDER_COLS, rows: GROUP_ORDER_PREVIEW },
    steps: [
      st(
        [0],
        () => "kept" as RowState,
        "COUNT(*) with no GROUP BY treats all 142 Cycle Depot orders as one collection, so it returns one summary row.",
        {
          side: countPanel([{ key: "all orders", count: 142 }]),
        },
      ),
    ],
  },
  {
    name: "GROUP BY status creates buckets",
    sql: ["SELECT status, COUNT(*) AS order_count", "FROM   orders", "GROUP  BY status", "ORDER  BY status"],
    table: { name: "orders preview", cols: GROUP_ORDER_COLS, rows: GROUP_ORDER_PREVIEW },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "GROUP BY status puts delivered rows together, shipped rows together, and does the same for every other status.",
        { highlightCols: [2] },
      ),
      st(
        [0, 2, 3],
        () => "added" as RowState,
        "COUNT(*) now runs once per status bucket. The full dataset produces five result rows, one for each status.",
        {
          rowsOverride: STATUS_COUNTS,
          colsOverride: ["status", "order_count"],
          highlightCols: [0, 1],
        },
      ),
    ],
  },
  {
    name: "Two columns make more detailed groups",
    sql: ["SELECT status, channel, COUNT(*) AS order_count", "FROM   orders", "GROUP  BY status, channel", "ORDER  BY status, channel"],
    table: { name: "orders", cols: ["status", "channel", "order_count"], rows: STATUS_CHANNEL_PREVIEW },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "GROUP BY status, channel creates one group for every distinct status-and-channel pair. Cycle Depot has 12 such pairs; this is the first seven after sorting.",
        { highlightCols: [0, 1] },
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
