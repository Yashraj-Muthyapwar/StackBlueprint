import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [
  r(1, "2016-09-04 21:15:19"),
  r(2, "2016-09-05 00:15:34"),
  r(3, "2016-09-13 15:24:19"),
];

const INSTANT_ROWS: Row[] = [
  r(1, "2016-09-04 21:15:19", "2016-09-05 00:15:19+00"),
  r(2, "2016-09-05 00:15:34", "2016-09-05 03:15:34+00"),
  r(3, "2016-09-13 15:24:19", "2016-09-13 18:24:19+00"),
];

const NEW_YORK_ROWS: Row[] = [
  r(1, "2016-09-04 21:15:19", "2016-09-04 20:15:19"),
  r(2, "2016-09-05 00:15:34", "2016-09-04 23:15:34"),
  r(3, "2016-09-13 15:24:19", "2016-09-13 14:24:19"),
];

/** Olist timestamps are local wall-clock readings; this animation makes the two AT TIME ZONE directions explicit. */
export const olistTimeZoneStages: Stage[] = [
  {
    name: "Assign Olist's source zone",
    canvasMinHeight: 420,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       order_purchase_timestamp",
      "         AT TIME ZONE 'America/Sao_Paulo' AS purchase_instant",
      "FROM   orders",
      "ORDER  BY order_purchase_timestamp, order_id",
      "LIMIT  3",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp (TIMESTAMP)"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "These are real early Olist purchase values. TIMESTAMP records a wall-clock reading, so the database does not yet know where the clock was located.",
      ),
      st(
        [1, 2],
        "kept",
        "Assign America/Sao_Paulo first. Each row is now an instant. This preview formats the resulting TIMESTAMPTZ in UTC so the +00 offset is visible.",
        {
          rowsOverride: INSTANT_ROWS,
          colsOverride: ["stored wall time", "purchase_instant (TIMESTAMPTZ)"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "Render the same instant for New York",
    canvasMinHeight: 420,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       (order_purchase_timestamp AT TIME ZONE 'America/Sao_Paulo')",
      "         AT TIME ZONE 'America/New_York' AS purchase_new_york",
      "FROM   orders",
      "ORDER  BY order_purchase_timestamp, order_id",
      "LIMIT  3",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp (TIMESTAMP)"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "Start with the same source rows. The stored Brazilian clock readings do not change.",
      ),
      st(
        [1, 2],
        "kept",
        "The inner expression identifies the purchase instant. The outer AT TIME ZONE renders that instant as a New York wall-clock time. The second purchase crosses back into the previous local date.",
        {
          rowsOverride: NEW_YORK_ROWS,
          colsOverride: ["stored Sao Paulo wall time", "purchase_new_york (TIMESTAMP)"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
