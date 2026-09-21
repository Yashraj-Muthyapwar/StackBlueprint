import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [
  r(1, "2016-09-04"),
  r(2, "2016-09-05"),
  r(3, "2016-09-06"),
  r(4, "2016-09-07"),
  r(5, "2016-09-08"),
];

/** Preserves every generated reporting date while left joining Olist purchase facts. */
export const olistDateSpinesStages: Stage[] = [
  {
    name: "Generate every reporting date",
    canvasMinHeight: 400,
    sql: [
      "SELECT d.purchase_date::date AS purchase_date",
      "FROM   generate_series(DATE '2016-09-04', DATE '2016-09-08',",
      "                       INTERVAL '1 day') AS d(purchase_date)",
    ],
    table: { name: "date_spine", cols: ["purchase_date"], rows: SOURCE_ROWS },
    steps: [
      st(
        [1, 2],
        "pending",
        "GENERATE_SERIES is the row source in FROM. It produces one timestamp for each daily step.",
      ),
      st(
        [0],
        "kept",
        "SELECT casts those generated timestamps to dates. This is the completed date spine, including dates that may have no purchase.",
        { highlightCols: [0] },
      ),
    ],
  },
  {
    name: "LEFT JOIN each day to orders",
    canvasMinHeight: 400,
    sql: [
      "WITH date_spine AS (",
      "  SELECT d.purchase_date::date AS purchase_date",
      "  FROM generate_series(DATE '2016-09-04', DATE '2016-09-08',",
      "                       INTERVAL '1 day') AS d(purchase_date)",
      ")",
      "SELECT d.purchase_date, o.order_id FROM date_spine d",
      "LEFT JOIN orders AS o ON o.order_purchase_timestamp >= d.purchase_date",
      "  AND o.order_purchase_timestamp < d.purchase_date + INTERVAL '1 day'",
    ],
    table: {
      name: "date_spine + orders",
      cols: ["purchase_date", "matched order_id"],
      rows: [
        r(1, "2016-09-04", "order"),
        r(2, "2016-09-05", "order"),
        r(3, "2016-09-06", null),
        r(4, "2016-09-07", null),
        r(5, "2016-09-08", null),
      ],
    },
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "kept",
        "The CTE uses FROM generate_series to build the complete axis. The half-open ON predicate assigns any Olist timestamp to exactly one daily bucket.",
      ),
      st(
        [5, 6],
        "kept",
        "LEFT JOIN preserves the three unmatched spine dates. Their order_id is NULL, rather than the date disappearing.",
        { highlightCols: [1] },
      ),
    ],
  },
  {
    name: "Count facts, not spine rows",
    canvasMinHeight: 400,
    sql: [
      "WITH date_spine AS (",
      "  SELECT d.purchase_date::date AS purchase_date",
      "  FROM generate_series(DATE '2016-09-04', DATE '2016-09-08',",
      "                       INTERVAL '1 day') AS d(purchase_date)",
      ")",
      "SELECT d.purchase_date, COUNT(o.order_id) AS order_count",
      "FROM date_spine d LEFT JOIN orders o ON o.order_purchase_timestamp >= d.purchase_date",
      "  AND o.order_purchase_timestamp < d.purchase_date + INTERVAL '1 day'",
      "GROUP BY d.purchase_date ORDER BY d.purchase_date",
    ],
    table: {
      name: "joined rows",
      cols: ["purchase_date", "matched order_id"],
      rows: [
        r(1, "2016-09-04", "order"),
        r(2, "2016-09-05", "order"),
        r(3, "2016-09-06", null),
        r(4, "2016-09-07", null),
        r(5, "2016-09-08", null),
      ],
    },
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "kept",
        "The date spine is still the driving table, so the report has all five dates before it counts anything.",
      ),
      st(
        [5, 6, 7, 8],
        "kept",
        "COUNT(order_id) ignores unmatched NULL fact keys. The final result has a continuous axis and genuine zeroes for quiet days.",
        {
          rowsOverride: [
            r(1, "2016-09-04", 1),
            r(2, "2016-09-05", 1),
            r(3, "2016-09-06", 0),
            r(4, "2016-09-07", 0),
            r(5, "2016-09-08", 0),
          ],
          colsOverride: ["purchase_date", "order_count"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
