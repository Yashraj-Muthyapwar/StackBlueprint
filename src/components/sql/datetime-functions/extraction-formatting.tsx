import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [r(1, "2017-10-02 10:56:33")];

const EXTRACTED_ROWS: Row[] = [r(1, "2017-10-02 10:56:33", "2017", "10")];

const FORMATTED_ROWS: Row[] = [r(1, "2017-10-02 10:56:33", "Oct 02, 2017 at 10:56")];

/** Makes the type-changing difference between numeric extraction and text formatting tangible. */
export const olistExtractionFormattingStages: Stage[] = [
  {
    name: "Extract numeric pieces",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       EXTRACT(YEAR FROM order_purchase_timestamp) AS purchase_year,",
      "       DATE_PART('hour', order_purchase_timestamp) AS purchase_hour",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp (TIMESTAMP)"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 3, 4],
        "kept",
        "The source is one real Olist purchase timestamp. It remains available in full while the query derives additional result values.",
      ),
      st(
        [1, 2],
        "kept",
        "EXTRACT and DATE_PART each produce a numeric part. These values can still be grouped, compared, or used in later arithmetic.",
        {
          rowsOverride: EXTRACTED_ROWS,
          colsOverride: ["order_purchase_timestamp", "purchase_year", "purchase_hour"],
          highlightCols: [1, 2],
        },
      ),
    ],
  },
  {
    name: "Format a display label",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp,",
      "       TO_CHAR(order_purchase_timestamp,",
      "         'Mon DD, YYYY at HH24:MI') AS purchase_label",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp (TIMESTAMP)"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 3, 4],
        "kept",
        "The stored timestamp still carries the real date and time. Keep it in the query whenever later work needs a temporal value.",
      ),
      st(
        [1, 2],
        "kept",
        "TO_CHAR uses a pattern to make a human-readable label. Its result is text, so it is ideal for presentation rather than time arithmetic.",
        {
          rowsOverride: FORMATTED_ROWS,
          colsOverride: ["order_purchase_timestamp", "purchase_label (TEXT)"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
