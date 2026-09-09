import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SUNDAY_ORDER: Row[] = [r(1, "2e7a8482…", "2016-09-04 21:15:19")];
const WEEKDAY_ORDERS: Row[] = [
  r(1, "2e7a8482…", "2016-09-04 21:15:19"),
  r(2, "e5fa5a72…", "2016-09-05 00:15:34"),
];

/** Projects one Olist timestamp into independently useful calendar dimensions. */
export const olistCalendarPeriodStages: Stage[] = [
  {
    name: "Extract ISO reporting keys",
    canvasMinHeight: 400,
    sql: [
      "SELECT EXTRACT(ISOYEAR FROM order_purchase_timestamp) AS iso_year,",
      "       EXTRACT(WEEK FROM order_purchase_timestamp) AS iso_week",
      "FROM   orders",
      "WHERE  order_id = '2e7a8482f6fb09756ca50c10d7bfc047'",
    ],
    table: { name: "orders", cols: ["order_id", "order_purchase_timestamp"], rows: SUNDAY_ORDER },
    steps: [
      st([3], "kept", "The WHERE clause selects one real Sunday Olist purchase. It is only choosing the source row, not calculating a calendar value yet."),
      st([0, 1], "kept", "The two EXTRACT expressions turn that timestamp into the ISO key 2016 / week 35. Keep both pieces together when grouping weekly data.", { rowsOverride: [r(1, "2016", "35")], colsOverride: ["iso_year", "iso_week"], highlightCols: [0, 1] }),
    ],
  },
  {
    name: "Add quarter and weekday logic",
    canvasMinHeight: 400,
    sql: [
      "SELECT EXTRACT(QUARTER FROM order_purchase_timestamp) AS purchase_quarter,",
      "       EXTRACT(ISODOW FROM order_purchase_timestamp) AS iso_weekday,",
      "       TO_CHAR(order_purchase_timestamp, 'FMDay') AS purchase_weekday",
      "FROM   orders",
      "WHERE  order_id = '2e7a8482f6fb09756ca50c10d7bfc047'",
    ],
    table: { name: "orders", cols: ["order_id", "order_purchase_timestamp"], rows: SUNDAY_ORDER },
    steps: [
      st([4], "kept", "The same Olist purchase is the input again. This step locates the source row before projecting its reporting fields."),
      st([0, 1, 2], "kept", "The timestamp falls in quarter 3. ISODOW supplies the sortable value 7, while TO_CHAR supplies the reader-facing label Sunday.", { rowsOverride: [r(1, "3", "7", "Sunday")], colsOverride: ["purchase_quarter", "iso_weekday", "purchase_weekday"], highlightCols: [0, 1, 2] }),
    ],
  },
  {
    name: "Sort weekdays by the numeric key",
    canvasMinHeight: 400,
    sql: [
      "SELECT EXTRACT(ISODOW FROM order_purchase_timestamp) AS iso_weekday,",
      "       TO_CHAR(order_purchase_timestamp, 'FMDay') AS purchase_weekday",
      "FROM   orders",
      "WHERE  order_id IN ('2e7a8482f6fb09756ca50c10d7bfc047',",
      "                    'e5fa5a7210941f7d56d0208e4e071d35')",
      "ORDER BY iso_weekday",
    ],
    table: { name: "orders", cols: ["order_id", "order_purchase_timestamp"], rows: WEEKDAY_ORDERS },
    steps: [
      st([3, 4], "kept", "The WHERE clause selects a real Sunday and Monday purchase. Both rows remain before calendar fields are projected."),
      st([0, 1, 5], "kept", "ISODOW gives Monday the key 1 and Sunday the key 7, so ORDER BY produces business-week order. The formatted names remain display labels.", { rowsOverride: [r(1, "1", "Monday"), r(2, "7", "Sunday")], colsOverride: ["iso_weekday", "purchase_weekday"], highlightCols: [0, 1] }),
    ],
  },
];
