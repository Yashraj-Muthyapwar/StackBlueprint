import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-window-partition-by: OVER () vs OVER (PARTITION BY customer_id) -----
const COLS = ["order_id", "customer_id", "amount"];
const ORDERS: Row[] = [
  r(101, 101, "A", 100),
  r(102, 102, "A", 200),
  r(103, 103, "B", 150),
  r(104, 104, "B", 250),
  r(105, 105, "B", 100),
];
const TEMPLATE = "minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr) minmax(0,1.6fr)";
const isA = (row: Row) => row.cells[1] === "A";

const withTotal = (total: (row: Row) => number): Row[] =>
  ORDERS.map((row) => r(row.key, row.cells[0], row.cells[1], row.cells[2], total(row)));

// Both stages use four SQL lines, so the table below the query never moves
// when the animation changes stage. The control bar height is reserved by the player.
export const partitionByStages: Stage[] = [
  {
    name: "Without PARTITION BY",
    blurb: "one window holds all five orders",
    sql: [
      "SELECT order_id, customer_id, amount,",
      "       SUM(amount) OVER () AS total_amount",
      "FROM   customer_orders",
      "-- one window, five rows",
    ],
    table: { name: "customer_orders", cols: COLS, rows: ORDERS, columnTemplate: TEMPLATE },
    steps: [
      st(
        [2],
        "pending" as RowState,
        "FROM customer_orders provides five rows.",
        { highlightCols: [2] },
      ),
      st(
        [1],
        "kept" as RowState,
        "OVER () has no PARTITION BY, so all five rows sit in one window. 100 + 200 + 150 + 250 + 100 = 800.",
        { highlightCols: [2], side: sidePanel("One window", ["All five orders", "SUM(amount) = 800"], "violet") },
      ),
      st(
        [0, 1],
        "added" as RowState,
        "Every row receives the overall total: 800.",
        {
          rowsOverride: withTotal(() => 800),
          colsOverride: [...COLS, "total_amount"],
          noteTone: "violet",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "violet"),
        },
      ),
    ],
  },
  {
    name: "With PARTITION BY",
    blurb: "one window per customer",
    sql: [
      "SELECT order_id, customer_id, amount,",
      "       SUM(amount) OVER (PARTITION BY customer_id)",
      "         AS customer_total",
      "FROM   customer_orders",
    ],
    table: { name: "customer_orders", cols: COLS, rows: ORDERS, columnTemplate: TEMPLATE },
    steps: [
      st(
        [3],
        "pending" as RowState,
        "The same five rows come in.",
        { highlightCols: [1] },
      ),
      st(
        [1],
        (row) => (isA(row) ? ("kept" as RowState) : ("added" as RowState)),
        "PARTITION BY customer_id splits the rows into two partitions. Customer A has two orders, and customer B has three. No row is removed.",
        {
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Partition A", ["100 + 200", "SUM = 300"], "mint")}
              {sidePanel("Partition B", ["150 + 250 + 100", "SUM = 500"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [1, 2],
        (row) => (isA(row) ? ("kept" as RowState) : ("added" as RowState)),
        "SUM(amount) runs once per partition, and each order receives its own customer's total. Customer A rows get 300, and customer B rows get 500.",
        {
          rowsOverride: withTotal((row) => (isA(row) ? 300 : 500)),
          colsOverride: [...COLS, "customer_total"],
          noteTone: "mint",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
        },
      ),
    ],
  },
];
