import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const CUSTOMERS: Row[] = [r(1, "797", "Priya"), r(2, "1600", "Miles"), r(3, "1619", "Hana")];

const ORDERS: Row[] = [r(1, "2", "797", "paid", "659.70"), r(2, "3", "1600", "pending", "377.61")];

const LEFT_RESULT: Row[] = [
  r(1, "797", "Priya", "2", "659.70"),
  r(2, "1600", "Miles", "3", "377.61"),
  r(3, "1619", "Hana", null, null),
];

const PAID_ON_RESULT: Row[] = [
  r(1, "797", "Priya", "2", "paid"),
  r(2, "1600", "Miles", null, null),
  r(3, "1619", "Hana", null, null),
];

const PAID_WHERE_RESULT: Row[] = [r(1, "797", "Priya", "2", "paid")];

const REPORT_IDS: Row[] = [r(1, "797"), r(2, "1600"), r(3, "1619")];
const RECENT_IDS: Row[] = [r(1, "797"), r(2, "1600"), r(3, "1261")];
const DIFF_RESULT: Row[] = [
  r(1, "797", "yes", "yes"),
  r(2, "1600", "yes", "yes"),
  r(3, "1619", "yes", null),
  r(4, "1261", null, "yes"),
];

/** Makes preservation, NULL padding, predicate placement, and full diffs visible. */
export const shopflowOuterJoinStages: Stage[] = [
  {
    name: "Preserve every customer with LEFT JOIN",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name, o.order_id, o.total_amount",
      "FROM customers AS c",
      "LEFT JOIN orders AS o",
      "  ON c.customer_id = o.customer_id",
      " AND o.order_id IN (2, 3)",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "ORDER BY c.customer_id",
    ],
    leftTable: {
      name: "customers",
      cols: ["customer_id", "first_name"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: {
      name: "orders",
      cols: ["order_id", "customer_id", "status", "total_amount"],
      rows: ORDERS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 5, 6],
        "pending",
        "The customers table is on the left, so every one of its rows has a place in the result. Hana is a real ShopFlow customer with no orders.",
        { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [2, 3, 4],
        "kept",
        "Two customer IDs match an order. Hana has no match, but LEFT JOIN preserves her row and pads the order columns with NULL.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept"],
          resultRows: LEFT_RESULT,
          resultCols: ["customer_id", "first_name", "order_id", "total_amount"],
          resultTitle: "LEFT JOIN result",
        },
      ),
    ],
  },
  {
    name: "RIGHT JOIN preserves the right table",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name, o.order_id, o.total_amount",
      "FROM orders AS o",
      "RIGHT JOIN customers AS c",
      "  ON c.customer_id = o.customer_id",
      " AND o.order_id IN (2, 3)",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "ORDER BY c.customer_id",
    ],
    leftTable: {
      name: "orders",
      cols: ["order_id", "customer_id", "status", "total_amount"],
      rows: ORDERS,
      accent: "violet",
    },
    rightTable: {
      name: "customers",
      cols: ["customer_id", "first_name"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    steps: [
      st(
        [0, 1, 5, 6],
        "pending",
        "RIGHT JOIN preserves the table written on the right. Here that is customers, so it describes the same business result as the prior LEFT JOIN.",
        { leftStates: ["pending", "pending"], rightStates: ["pending", "pending", "pending"] },
      ),
      st(
        [2, 3, 4],
        "kept",
        "Hana remains even though no order joins to her. Teams often rewrite this as customers LEFT JOIN orders so the preserved table is read first.",
        {
          leftStates: ["kept", "kept"],
          rightStates: ["kept", "kept", "kept"],
          resultRows: LEFT_RESULT,
          resultCols: ["customer_id", "first_name", "order_id", "total_amount"],
          resultTitle: "RIGHT JOIN result",
        },
      ),
    ],
  },
  {
    name: "Put optional-side filters in ON",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name, o.order_id, o.status",
      "FROM customers AS c",
      "LEFT JOIN orders AS o",
      "  ON c.customer_id = o.customer_id",
      " AND o.order_id IN (2, 3)",
      " AND o.status = 'paid'",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "ORDER BY c.customer_id",
    ],
    leftTable: {
      name: "customers",
      cols: ["customer_id", "first_name"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: {
      name: "orders",
      cols: ["order_id", "customer_id", "status", "total_amount"],
      rows: ORDERS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 6, 7],
        "pending",
        "We still want all selected customers, while asking for paid orders only. The paid condition belongs with the matching rule, not with the preserved-customer filter.",
        { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [3, 4, 5],
        "kept",
        "Priya's order is paid. Miles has a pending order and Hana has none, so both customers remain with NULL order fields instead of disappearing.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "dropped"],
          resultRows: PAID_ON_RESULT,
          resultCols: ["customer_id", "first_name", "order_id", "status"],
          resultTitle: "filter in ON",
        },
      ),
    ],
  },
  {
    name: "A right-side WHERE filter removes NULL rows",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name, o.order_id, o.status",
      "FROM customers AS c",
      "LEFT JOIN orders AS o",
      "  ON c.customer_id = o.customer_id",
      " AND o.order_id IN (2, 3)",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "  AND o.status = 'paid'",
      "ORDER BY c.customer_id",
    ],
    leftTable: {
      name: "customers",
      cols: ["customer_id", "first_name"],
      rows: CUSTOMERS,
      accent: "mint",
    },
    rightTable: {
      name: "orders",
      cols: ["order_id", "customer_id", "status", "total_amount"],
      rows: ORDERS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 3, 4, 5, 7],
        "pending",
        "This query begins as a LEFT JOIN, and the raw join would preserve all three customers.",
        { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [6],
        "dropped",
        "The WHERE predicate rejects NULL status values, so Hana disappears. It also removes Miles because his matching order is pending. This behaves like an inner filter for that condition.",
        {
          leftStates: ["kept", "dropped", "dropped"],
          rightStates: ["kept", "dropped"],
          resultRows: PAID_WHERE_RESULT,
          resultCols: ["customer_id", "first_name", "order_id", "status"],
          resultTitle: "filter in WHERE",
        },
      ),
    ],
  },
  {
    name: "FULL JOIN exposes both sides of a diff",
    canvasMinHeight: 500,
    sql: [
      "WITH report_customers(customer_id) AS (VALUES (797), (1600), (1619)),",
      "recent_order_customers(customer_id) AS (VALUES (797), (1600), (1261))",
      "SELECT COALESCE(r.customer_id, o.customer_id) AS customer_id,",
      "       r.customer_id IS NOT NULL AS in_report,",
      "       o.customer_id IS NOT NULL AS in_recent_orders",
      "FROM report_customers AS r",
      "FULL OUTER JOIN recent_order_customers AS o",
      "  ON r.customer_id = o.customer_id",
      "ORDER BY customer_id",
    ],
    leftTable: {
      name: "report customers",
      cols: ["customer_id"],
      rows: REPORT_IDS,
      accent: "mint",
    },
    rightTable: {
      name: "recent order customers",
      cols: ["customer_id"],
      rows: RECENT_IDS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 3, 4, 5, 8],
        "pending",
        "These two query-local lists are scoped ShopFlow report inputs. They share 797 and 1600, while 1619 exists only in the report and 1261 only in the recent-order list.",
        {
          leftStates: ["pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending"],
        },
      ),
      st(
        [6, 7],
        "kept",
        "FULL OUTER JOIN preserves matches and one-sided rows from both inputs. That makes it useful for reconciliation and table-diff questions.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept", "kept"],
          resultRows: DIFF_RESULT,
          resultCols: ["customer_id", "in_report", "in_recent_orders"],
          resultTitle: "FULL JOIN diff",
        },
      ),
    ],
  },
];
