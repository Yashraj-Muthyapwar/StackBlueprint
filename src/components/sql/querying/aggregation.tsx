import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
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
        {
          highlightCols: [3],
          side: sumPanel("COUNT(DISTINCT country)", "6 countries"),
          noteTone: "violet",
        },
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
        {
          highlightCols: [1],
          side: sumPanel("all 30 product prices", "Σ $32,515 · avg $1,083.83 · $28 to $5,400"),
        },
      ),
    ],
  },
];

// ----- q-grpby: Cycle Depot status and channel summaries -----
// This is a small, labelled preview of real orders. Aggregate output below uses
// the full 142-row Cycle Depot orders table.
const GROUP_ORDER_PREVIEW: Row[] = [
  r("order-1", 1, 1, "shipped"),
  r("order-2", 2, 1, "delivered"),
  r("order-3", 3, 1, "delivered"),
  r("order-6", 6, 2, "shipped"),
];
const GROUP_ORDER_COLS = ["id", "customer_id", "status"];

const STATUS_COUNTS: Row[] = [
  r("cancelled", "cancelled", 9),
  r("delivered", "delivered", 84),
  r("pending", "pending", 13),
  r("returned", "returned", 4),
  r("shipped", "shipped", 32),
];

const DISTINCT_STATUSES: Row[] = [
  r("cancelled", "cancelled"),
  r("delivered", "delivered"),
  r("pending", "pending"),
  r("returned", "returned"),
  r("shipped", "shipped"),
];

const GROUP_CUSTOMER_PREVIEW: Row[] = [
  r("customer-1", 1, "Zane Novak", "Austin", "USA"),
  r("customer-2", 2, "Boris Alvarez", "Bristol", "UK"),
  r("customer-5", 5, "Omar Doyle", null, "Germany"),
  r("customer-6", 6, "Sami Mensah", "Portland", "USA"),
];
const GROUP_CUSTOMER_COLS = ["id", "name", "city", "country"];

const STATUS_CHANNEL_PREVIEW: Row[] = [
  r("cancelled-store", "cancelled", "store", 1),
  r("cancelled-web", "cancelled", "web", 8),
  r("delivered-partner", "delivered", "partner", 8),
  r("delivered-store", "delivered", "store", 25),
  r("delivered-web", "delivered", "web", 51),
];

const splitPanel = () => (
  <div className="grid gap-2">
    <div className="rounded-md border border-mint/40 bg-mint/10 px-3 py-2 font-mono text-[12px]">
      <div className="text-mint">delivered bucket</div>
      <div className="mt-1 text-foreground/80">orders 2, 3</div>
    </div>
    <div className="rounded-md border border-violet/40 bg-violet/5 px-3 py-2 font-mono text-[12px]">
      <div className="text-violet">shipped bucket</div>
      <div className="mt-1 text-foreground/80">orders 1, 6</div>
    </div>
  </div>
);

const nullGroupPanel = () => (
  <div className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2 font-mono text-[12px]">
    <div className="text-amber">NULL city bucket</div>
    <div className="mt-1 text-foreground/80">5 customers in the full dataset</div>
  </div>
);

export const grpStages: Stage[] = [
  {
    name: "Explore possible groups with DISTINCT",
    canvasMinHeight: 480,
    sql: ["SELECT DISTINCT status", "FROM   orders", "ORDER  BY status"],
    table: { name: "orders preview", cols: GROUP_ORDER_COLS, rows: GROUP_ORDER_PREVIEW },
    steps: [
      st(
        [0, 2],
        () => "kept" as RowState,
        "Before grouping, DISTINCT is a quick way to inspect the group values. The full orders table has five statuses.",
        {
          rowsOverride: DISTINCT_STATUSES,
          colsOverride: ["status"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "Split rows into status buckets",
    sql: ["SELECT status, COUNT(*) AS order_count", "FROM   orders", "GROUP  BY status"],
    table: { name: "orders preview", cols: GROUP_ORDER_COLS, rows: GROUP_ORDER_PREVIEW },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "Split: GROUP BY status places rows with the same status in the same bucket. This four-row preview shows the delivered and shipped buckets only.",
        { highlightCols: [2], side: splitPanel() },
      ),
    ],
  },
  {
    name: "Apply COUNT and combine the results",
    sql: [
      "SELECT status, COUNT(*) AS order_count",
      "FROM   orders",
      "GROUP  BY status",
      "ORDER  BY status",
    ],
    table: { name: "orders preview", cols: GROUP_ORDER_COLS, rows: GROUP_ORDER_PREVIEW },
    steps: [
      st(
        [0, 2, 3],
        () => "added" as RowState,
        "Apply and combine: COUNT(*) runs once inside each bucket, then SQL combines those answers into one summary table with one row per status.",
        {
          rowsOverride: STATUS_COUNTS,
          colsOverride: ["status", "order_count"],
          highlightCols: [0, 1],
        },
      ),
    ],
  },
  {
    name: "NULL values form one bucket",
    sql: ["SELECT city, COUNT(*) AS customer_count", "FROM   customers", "GROUP  BY city"],
    table: { name: "customers preview", cols: GROUP_CUSTOMER_COLS, rows: GROUP_CUSTOMER_PREVIEW },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "A NULL grouping value is not discarded. All rows with a missing city share one NULL city bucket. A city with zero customer rows would not appear at all.",
        { highlightCols: [2], side: nullGroupPanel(), noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Two columns make more detailed groups",
    sql: [
      "SELECT status, channel, COUNT(*) AS order_count",
      "FROM   orders",
      "GROUP  BY status, channel",
      "ORDER  BY status, channel",
    ],
    table: {
      name: "orders",
      cols: ["status", "channel", "order_count"],
      rows: STATUS_CHANNEL_PREVIEW,
    },
    steps: [
      st(
        [2],
        () => "kept" as RowState,
        "status and channel both identify each group, so both appear in SELECT and GROUP BY. Cycle Depot has 12 status-and-channel pairs; this is the first five after sorting.",
        { highlightCols: [0, 1] },
      ),
    ],
  },
];

// Shared compact rows retained for the subquery animation family.
export const ORD_H: Row[] = [
  r(1, 1, "Ada", 45, "paid"),
  r(2, 2, "Linus", 120, "paid"),
  r(3, 3, "Grace", 30, "pending"),
  r(4, 4, "Ada", 80, "paid"),
  r(5, 5, "Bob", 50, "paid"),
  r(6, 6, "Linus", 75, "paid"),
];
export const HCOLS = ["id", "customer", "total", "status"];

// ----- q-having: Cycle Depot row filters and group filters -----
const HAVING_ORDER_PREVIEW: Row[] = [
  r("order-1", 1, 1, "shipped", "store"),
  r("order-2", 2, 1, "delivered", "web"),
  r("order-3", 3, 1, "delivered", "web"),
  r("order-5", 5, 2, "delivered", "store"),
  r("order-9", 9, 5, "shipped", "web"),
  r("order-10", 10, 6, "delivered", "web"),
];
const HAVING_ORDER_COLS = ["id", "customer_id", "status", "channel"];

const WEB_STATUS_COUNTS: Row[] = [
  r("cancelled", "cancelled", 8),
  r("delivered", "delivered", 51),
  r("pending", "pending", 10),
  r("returned", "returned", 4),
  r("shipped", "shipped", 13),
];

export const havingStages: Stage[] = [
  {
    name: "WHERE filters individual order rows",
    canvasMinHeight: 500,
    sql: ["SELECT id, status, channel", "FROM   orders", "WHERE  channel = 'web'"],
    table: { name: "orders preview", cols: HAVING_ORDER_COLS, rows: HAVING_ORDER_PREVIEW },
    steps: [
      st(
        [2],
        pass((row) => row.cells[3] === "web"),
        "WHERE runs on individual rows. The web orders stay; the store orders are removed before any groups exist.",
        { highlightCols: [3] },
      ),
    ],
  },
  {
    name: "GROUP BY creates web-status summaries",
    sql: [
      "SELECT status, COUNT(*) AS order_count",
      "FROM   orders",
      "WHERE  channel = 'web'",
      "GROUP  BY status",
    ],
    table: { name: "orders preview", cols: HAVING_ORDER_COLS, rows: HAVING_ORDER_PREVIEW },
    steps: [
      st(
        [3],
        pass((row) => row.cells[3] === "web"),
        "GROUP BY runs after WHERE. It turns the surviving web orders into one count for each status.",
        { highlightCols: [2] },
      ),
      st(
        [0, 3],
        "added",
        "The full Cycle Depot dataset produces five web-status groups. These are now summaries, not individual orders.",
        {
          rowsOverride: WEB_STATUS_COUNTS,
          colsOverride: ["status", "order_count"],
          highlightCols: [0, 1],
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "HAVING filters the completed groups",
    sql: [
      "SELECT status, COUNT(*) AS order_count",
      "FROM   orders",
      "WHERE  channel = 'web'",
      "GROUP  BY status",
      "HAVING COUNT(*) >= 10",
    ],
    table: { name: "web-status groups", cols: ["status", "order_count"], rows: WEB_STATUS_COUNTS },
    steps: [
      st(
        [4],
        (row) => (Number(row.cells[1]) >= 10 ? ("kept" as RowState) : ("dropped" as RowState)),
        "HAVING runs after COUNT(*). It keeps the delivered, shipped, and pending groups, and removes the smaller cancelled and returned groups.",
        { highlightCols: [1] },
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
