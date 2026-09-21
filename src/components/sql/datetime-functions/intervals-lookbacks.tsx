import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const ANCHOR_SOURCE_ROWS: Row[] = [
  r(1, "2018-09-29 09:13:03"),
  r(2, "2018-10-16 20:16:02"),
  r(3, "2018-10-17 17:30:18"),
];

const LOOKBACK_SOURCE_ROWS: Row[] = [
  r(1, "bd35b677…", "2018-09-17 17:21:16"),
  r(2, "ed3efbd3…", "2018-09-20 13:54:16"),
  r(3, "616fa7d4…", "2018-10-01 15:30:09"),
  r(4, "10a045cd…", "2018-10-17 17:30:18"),
];

const LOOKBACK_RESULT_ROWS: Row[] = [
  r(1, "ed3efbd3…", "2018-09-20 13:54:16"),
  r(2, "616fa7d4…", "2018-10-01 15:30:09"),
  r(3, "10a045cd…", "2018-10-17 17:30:18"),
];

const MONTH_BOUNDARY_ROWS: Row[] = [
  r(1, "392ed9af…", "2018-09-29 09:13:03"),
  r(2, "616fa7d4…", "2018-10-01 15:30:09"),
];

/** Anchors a reproducible Olist lookback before applying its interval predicate. */
export const olistIntervalsLookbacksStages: Stage[] = [
  {
    name: "Anchor the historical window",
    canvasMinHeight: 400,
    sql: ["SELECT MAX(order_purchase_timestamp) AS max_purchase", "FROM   orders"],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp"],
      rows: ANCHOR_SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 1],
        "kept",
        "Olist is historical data. A relative window based on NOW() would be empty today, so this report needs an endpoint from the dataset itself.",
      ),
      st(
        [2],
        "kept",
        "MAX reduces every purchase timestamp to one stable endpoint: 2018-10-17 17:30:18.",
        {
          rowsOverride: [r(1, "2018-10-17 17:30:18")],
          colsOverride: ["max_purchase"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "Apply the 30-day interval",
    canvasMinHeight: 400,
    sql: [
      "WITH bounds AS (",
      "  SELECT MAX(order_purchase_timestamp) AS max_purchase FROM orders",
      ")",
      "SELECT o.order_id, o.order_purchase_timestamp",
      "FROM   orders AS o CROSS JOIN bounds AS b",
      "WHERE  o.order_purchase_timestamp >= b.max_purchase - INTERVAL '30 days'",
      "  AND  o.order_purchase_timestamp <= b.max_purchase",
      "ORDER BY o.order_purchase_timestamp, o.order_id",
      "LIMIT  3",
    ],
    table: {
      name: "orders + bounds",
      cols: ["order_id", "order_purchase_timestamp"],
      rows: LOOKBACK_SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 1, 2],
        "pending",
        "These three lines create one-row bounds. CROSS JOIN attaches that same max_purchase value to every candidate order; it does not remove any rows.",
      ),
      st(
        [5, 6],
        (row) => (row.cells[0].startsWith("bd35") ? "dropped" : "kept"),
        "The WHERE clause performs the filtering. This order is nine minutes before max_purchase - INTERVAL '30 days', so it is excluded. The other three timestamps are inside the closed historical window.",
      ),
      st(
        [3, 4, 7, 8],
        "kept",
        "SELECT projects the two requested columns, then ORDER BY makes their sequence deterministic and LIMIT keeps this three-row teaching sample.",
        {
          rowsOverride: LOOKBACK_RESULT_ROWS,
          colsOverride: ["order_id", "order_purchase_timestamp"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "Keep adjacent months disjoint",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_id, order_purchase_timestamp",
      "FROM   orders",
      "WHERE  order_purchase_timestamp >= TIMESTAMP '2018-10-01 00:00:00'",
      "  AND  order_purchase_timestamp <  TIMESTAMP '2018-11-01 00:00:00'",
      "ORDER BY order_purchase_timestamp, order_id",
    ],
    table: {
      name: "orders",
      cols: ["order_id", "order_purchase_timestamp"],
      rows: MONTH_BOUNDARY_ROWS,
    },
    steps: [
      st(
        [2],
        (row) => (row.cells[1].startsWith("2018-09") ? "dropped" : "kept"),
        "The lower bound includes October 1 and later. September's purchase is excluded before the result is sorted.",
      ),
      st(
        [3],
        "kept",
        "The upper bound is excluded. A purchase exactly at 2018-11-01 00:00:00 would belong to November, never to both monthly reports.",
        { highlightCols: [1] },
      ),
    ],
  },
];
