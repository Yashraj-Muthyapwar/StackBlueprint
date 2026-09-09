import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SOURCE_ROWS: Row[] = [r(1, "2017-10-02", "2017-10-10", "2017-10-18")];

/** Makes the overlap question explicit after two date spans become range values. */
export const olistOverlappingRangesStages: Stage[] = [
  {
    name: "Build half-open range values",
    canvasMinHeight: 400,
    sql: [
      "SELECT daterange(order_purchase_timestamp::date,",
      "       order_delivered_customer_date::date + 1, '[)') AS actual_window,",
      "       daterange(order_purchase_timestamp::date,",
      "       order_estimated_delivery_date::date + 1, '[)') AS estimated_window",
      "FROM   orders",
      "WHERE  order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: { name: "orders", cols: ["purchased", "delivered", "estimated"], rows: SOURCE_ROWS },
    steps: [
      st([5], "kept", "The WHERE clause selects one real Olist order. Its delivery and estimated dates are the endpoints for the two ranges."),
      st([0, 1, 2, 3], "kept", "Adding one day creates [2017-10-02, 2017-10-11) and [2017-10-02, 2017-10-19). Each range includes its final business date but excludes the following day.", { rowsOverride: [r(1, "[2017-10-02, 2017-10-11)", "[2017-10-02, 2017-10-19)")], colsOverride: ["actual_window", "estimated_window"], highlightCols: [0, 1] }),
    ],
  },
  {
    name: "Test overlap and containment",
    canvasMinHeight: 400,
    sql: [
      "WITH delivery_windows AS (",
      "  SELECT daterange(order_purchase_timestamp::date, order_delivered_customer_date::date + 1, '[)') AS actual_window,",
      "         daterange(order_purchase_timestamp::date, order_estimated_delivery_date::date + 1, '[)') AS estimated_window",
      "  FROM orders WHERE order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
      ")",
      "SELECT actual_window && estimated_window AS overlaps,",
      "       actual_window @> DATE '2017-10-08' AS contains_date",
      "FROM delivery_windows",
    ],
    table: { name: "delivery ranges", cols: ["actual window", "estimated window"], rows: [r(1, "[2017-10-02, 2017-10-11)", "[2017-10-02, 2017-10-19)")] },
    steps: [
      st([0, 1, 2, 3, 4], "kept", "The CTE creates the two real range values. No relationship has been tested yet."),
      st([5, 6, 7], "kept", "The outer SELECT tests the relationship between those two values. The windows overlap, and the actual range contains October 8.", { rowsOverride: [r(1, "true", "true")], colsOverride: ["overlaps", "contains_date"], highlightCols: [0, 1] }),
    ],
  },
  {
    name: "Spot a late delivery",
    canvasMinHeight: 400,
    sql: [
      "SELECT order_delivered_customer_date::date >",
      "       order_estimated_delivery_date::date AS delivered_late",
      "FROM orders",
      "WHERE order_id = 'e481f51cbdc54678b7cc49136f2d6af7'",
    ],
    table: { name: "orders", cols: ["delivered date", "estimated date"], rows: [r(1, "2017-10-10", "2017-10-18")] },
    steps: [
      st([3], "kept", "The range representation is useful for intersections; this WHERE clause selects the same real Olist order for an endpoint comparison."),
      st([0, 1], "kept", "October 10 is not after October 18, so the direct comparison returns false for delivered_late.", { rowsOverride: [r(1, "false")], colsOverride: ["delivered_late"], highlightCols: [0] }),
    ],
  },
];
