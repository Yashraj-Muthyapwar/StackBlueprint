import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [r(1, "2017-10-02 10:56:33", "2017-10-10 21:25:13")];
const CALENDAR_ROWS: Row[] = [r(1, "2017-10-02", "2017-10-10", "8")];
const ELAPSED_ROWS: Row[] = [r(1, "2017-10-02 10:56:33", "2017-10-10 21:25:13", "8.44")];

/** Separates calendar-date distance from precise elapsed-duration calculation. */
export const olistDateArithmeticStages: Stage[] = [
  {
    name: "Count calendar-day distance",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp::date AS purchased_date,",
      "       order_delivered_customer_date::date AS delivered_date,",
      "       order_delivered_customer_date::date - order_purchase_timestamp::date",
      "         AS calendar_delivery_days",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp", "order_delivered_customer_date"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 4, 5],
        "kept",
        "The source order was purchased on October 2 and delivered on October 10. The time-of-day detail is still present before the calculation starts.",
      ),
      st(
        [1, 2, 3],
        "kept",
        "Casting both values to DATE intentionally removes time of day. Their subtraction returns the integer number of calendar days between the two dates.",
        {
          rowsOverride: CALENDAR_ROWS,
          colsOverride: ["purchased_date", "delivered_date", "calendar_delivery_days"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "Measure precise elapsed days",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_purchase_timestamp, order_delivered_customer_date,",
      "       ROUND(EXTRACT(EPOCH FROM order_delivered_customer_date",
      "         - order_purchase_timestamp) / 86400.0, 2) AS elapsed_delivery_days",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: {
      name: "orders",
      cols: ["order_purchase_timestamp", "order_delivered_customer_date"],
      rows: SOURCE_ROWS,
    },
    steps: [
      st(
        [0, 3, 4],
        "kept",
        "Start from the original timestamps when the report needs the exact duration, including the hours and minutes beyond complete calendar days.",
      ),
      st(
        [1, 2],
        "kept",
        "Timestamp subtraction creates an interval. EXTRACT(EPOCH) turns it into total seconds, then division by 86,400 converts that duration to fractional elapsed days.",
        {
          rowsOverride: ELAPSED_ROWS,
          colsOverride: ["purchased", "delivered", "elapsed_delivery_days"],
          highlightCols: [2],
        },
      ),
    ],
  },
];
