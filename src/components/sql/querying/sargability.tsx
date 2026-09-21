import type { Row, Stage } from "@/components/lesson/MultiStage";
import { pass, r, sidePanel, st } from "../animation-shared";

// A small, real slice around March 2024. The rows come from the deterministic
// Cycle Depot seed, ordered by order_date so the range is easy to inspect.
const ORDERS: Row[] = [
  r(124, 124, "2024-02-16", "cancelled"),
  r(13, 13, "2024-02-20", "pending"),
  r(27, 27, "2024-02-21", "delivered"),
  r(139, 139, "2024-03-05", "delivered"),
  r(58, 58, "2024-03-07", "delivered"),
  r(39, 39, "2024-03-17", "returned"),
  r(128, 128, "2024-03-21", "pending"),
  r(83, 83, "2024-03-24", "cancelled"),
  r(131, 131, "2024-04-02", "returned"),
  r(16, 16, "2024-04-09", "shipped"),
];

const COLUMNS = ["id", "order_date", "status"];
const isMarch2024 = (row: Row) => {
  const date = String(row.cells[1]);
  return date >= "2024-03-01" && date < "2024-04-01";
};

/** Stages for Filtering 1.5: index-friendly WHERE predicates and date ranges. */
export const sargabilityStages: Stage[] = [
  {
    name: "Range search on the column",
    blurb: "Keep the indexed date column bare",
    sql: [
      "SELECT id, order_date, status",
      "FROM   orders",
      "WHERE  order_date >= DATE '2024-03-01'",
      "  AND  order_date <  DATE '2024-04-01'",
      "ORDER  BY order_date, id",
    ],
    table: { name: "orders · date-sorted sample", cols: COLUMNS, rows: ORDERS },
    steps: [
      st(
        [0, 1],
        "pending",
        "The orders are arranged by date in this small Cycle Depot sample. A real table may be stored differently, but an index on order_date is ordered this way.",
      ),
      st(
        [2, 3],
        pass(isMarch2024),
        "The two constant boundaries define March. The database can use an appropriate order_date index to seek to the first boundary and read the matching range when that plan is worthwhile.",
        {
          highlightCols: [1],
          side: sidePanel(
            "Sargable predicate",
            [
              "Bare column: order_date",
              "Constants define a tight range",
              "Possible index range scan",
            ],
            "mint",
          ),
        },
      ),
    ],
  },
  {
    name: "Function on the column",
    blurb: "Same answer, less useful to a normal date index",
    sql: [
      "SELECT id, order_date, status",
      "FROM   orders",
      "WHERE  DATE_TRUNC('month', order_date)",
      "       = DATE '2024-03-01'",
      "ORDER  BY order_date, id",
    ],
    table: { name: "orders · same March result", cols: COLUMNS, rows: ORDERS },
    steps: [
      st(
        [2, 3],
        pass(isMarch2024),
        "This returns the same five March orders, but the engine must first apply DATE_TRUNC to each candidate value. A normal index on order_date does not directly store DATE_TRUNC(order_date).",
        {
          highlightCols: [1],
          noteTone: "amber",
          side: sidePanel(
            "Non-sargable shape",
            [
              "Function wraps order_date",
              "Normal order_date index may not help",
              "Rewrite as a range instead",
            ],
            "amber",
          ),
        },
      ),
    ],
  },
  {
    name: "One exact day",
    blurb: "An equality predicate is a one-value range",
    sql: [
      "SELECT id, order_date, status",
      "FROM   orders",
      "WHERE  order_date = DATE '2024-03-17'",
    ],
    table: { name: "orders · March sample", cols: COLUMNS, rows: ORDERS },
    steps: [
      st(
        [2],
        pass((row) => row.cells[1] === "2024-03-17"),
        "For Cycle Depot's DATE column, equality is direct and clear. It finds order 39 on 2024-03-17. For a TIMESTAMP column, use a half-open day range instead so later times on that day are not missed.",
        {
          highlightCols: [1],
          side: sidePanel(
            "Date versus timestamp",
            [
              "DATE: equality is often right",
              "TIMESTAMP: >= start AND < next day",
              "Do not use a midnight end value",
            ],
            "violet",
          ),
        },
      ),
    ],
  },
];
