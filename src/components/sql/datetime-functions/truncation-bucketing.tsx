import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [r(1, "2017-10-02 10:56:33")];

const CALENDAR_ROWS: Row[] = [
  r(1, "2017-10-02 10:56:33", "2017-10-02 00:00:00", "2017-10-01 00:00:00"),
];

const HOUR_BIN_ROWS: Row[] = [r(1, "2017-10-02 10:56:33", "2017-10-02 10:00:00")];

/** Shows calendar truncation and fixed-width binning as two distinct operations on the same Olist timestamp. */
export const olistTruncationBucketingStages: Stage[] = [
  {
    name: "Snap to calendar boundaries",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       DATE_TRUNC('day', order_purchase_timestamp) AS purchase_day,",
      "       DATE_TRUNC('month', order_purchase_timestamp) AS purchase_month",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: { name: "orders", cols: ["order_purchase_timestamp (TIMESTAMP)"], rows: SOURCE_ROWS },
    steps: [
      st(
        [0, 3, 4],
        "kept",
        "The source value is one Olist purchase at 10:56:33. It stays unchanged in the stored table.",
      ),
      st(
        [1, 2],
        "kept",
        "DATE_TRUNC resets the smaller parts to a calendar boundary. The day starts at midnight on October 2; the month starts at midnight on October 1.",
        {
          rowsOverride: CALENDAR_ROWS,
          colsOverride: ["order_purchase_timestamp", "purchase_day", "purchase_month"],
          highlightCols: [1, 2],
        },
      ),
    ],
  },
  {
    name: "Place it in a fixed one-hour bin",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       DATE_BIN(INTERVAL '1 hour', order_purchase_timestamp,",
      "         TIMESTAMP '2000-01-01 00:00:00') AS purchase_hour_bin",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: { name: "orders", cols: ["order_purchase_timestamp (TIMESTAMP)"], rows: SOURCE_ROWS },
    steps: [
      st(
        [0, 3, 4],
        "kept",
        "The source is the same event. DATE_BIN will use the fixed, one-hour interval grid anchored at the chosen origin.",
      ),
      st(
        [1, 2],
        "kept",
        "10:56:33 belongs to the one-hour bin that begins at 10:00:00. The result names the bin start, not the source event's exact time.",
        {
          rowsOverride: HOUR_BIN_ROWS,
          colsOverride: ["order_purchase_timestamp", "purchase_hour_bin"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
