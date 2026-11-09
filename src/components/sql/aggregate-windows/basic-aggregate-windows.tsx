import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-aggregate-basic-windows: SUM, AVG and COUNT beside every order -----
const COLS = ["order_id", "customer_id", "amount"];
const STATS = ["customer_total", "customer_average", "customer_order_count"];
const TEMPLATE =
  "minmax(0,0.9fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.2fr) minmax(0,1.3fr) minmax(0,1.5fr)";

const ORDERS = [
  { id: 101, customer: "A", amount: 100 },
  { id: 102, customer: "A", amount: 200 },
  { id: 103, customer: "A", amount: 300 },
  { id: 104, customer: "B", amount: 400 },
  { id: 105, customer: "B", amount: 600 },
];
const STORED = [ORDERS[3], ORDERS[0], ORDERS[4], ORDERS[2], ORDERS[1]];

const TOTAL: Record<string, number> = { A: 600, B: 1000 };
const AVERAGE: Record<string, number> = { A: 200, B: 500 };
const COUNT: Record<string, number> = { A: 3, B: 2 };

const base = (list: typeof ORDERS): Row[] => list.map((o) => r(o.id, o.id, o.customer, o.amount));
const withStats = (n: number): Row[] =>
  ORDERS.map((o) => {
    const cells: (string | number)[] = [o.id, o.customer, o.amount, TOTAL[o.customer]];
    if (n >= 2) cells.push(AVERAGE[o.customer]);
    if (n >= 3) cells.push(COUNT[o.customer]);
    return r(o.id, ...cells);
  });
const colsFor = (n: number) => [...COLS, ...STATS.slice(0, n)];
const isA = (row: Row) => row.cells[1] === "A";

export const aggregateBasicStages: Stage[] = [
  {
    name: "Three window aggregates",
    blurb: "SUM, AVG and COUNT beside every order",
    sql: [
      "SELECT order_id, customer_id, amount,",
      "  SUM(amount) OVER (",
      "    PARTITION BY customer_id",
      "  ) AS customer_total,",
      "  AVG(amount) OVER (",
      "    PARTITION BY customer_id",
      "  ) AS customer_average,",
      "  COUNT(*) OVER (",
      "    PARTITION BY customer_id",
      "  ) AS customer_order_count",
      "FROM orders",
      "ORDER BY customer_id, order_id;",
    ],
    table: { name: "orders", cols: COLS, rows: base(STORED), columnTemplate: TEMPLATE },
    steps: [
      st([10], "pending", "FROM orders provides five rows. Every one of them will stay in the result.", {
        highlightCols: [1, 2],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: orders"], "neutral")}
            {sidePanel("Rows", ["5 orders"], "neutral")}
          </div>
        ),
      }),
      st(
        [2, 5, 8],
        (row) => (isA(row) ? "kept" : "added"),
        "PARTITION BY customer_id divides the rows into two partitions. Customer A has three orders and customer B has two. No row is removed.",
        {
          rowsOverride: base(ORDERS),
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Customer A", ["101, 102, 103"], "mint")}
              {sidePanel("Customer B", ["104, 105"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [1, 2, 3],
        (row) => (isA(row) ? "kept" : "added"),
        "SUM(amount) is calculated once for each partition: 100 + 200 + 300 = 600 for A, and 400 + 600 = 1000 for B. The result is attached to every order.",
        {
          rowsOverride: withStats(1),
          colsOverride: colsFor(1),
          highlightCols: [3],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Customer A", ["Total = 600"], "mint")}
              {sidePanel("Customer B", ["Total = 1000"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [4, 5, 6],
        (row) => (isA(row) ? "kept" : "added"),
        "AVG(amount) uses the same partitions: 600 / 3 = 200 for A, and 1000 / 2 = 500 for B.",
        {
          rowsOverride: withStats(2),
          colsOverride: colsFor(2),
          highlightCols: [4],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Customer A", ["Average = 200"], "mint")}
              {sidePanel("Customer B", ["Average = 500"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [7, 8, 9],
        (row) => (isA(row) ? "kept" : "added"),
        "COUNT(*) counts the rows in each partition: three for A and two for B.",
        {
          rowsOverride: withStats(3),
          colsOverride: colsFor(3),
          highlightCols: [5],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Customer A", ["Count = 3"], "mint")}
              {sidePanel("Customer B", ["Count = 2"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [11],
        "kept",
        "ORDER BY sorts the final output. The result has five rows, the same number that went in.",
        {
          rowsOverride: withStats(3),
          colsOverride: colsFor(3),
          noteTone: "mint",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
        },
      ),
    ],
  },
];
