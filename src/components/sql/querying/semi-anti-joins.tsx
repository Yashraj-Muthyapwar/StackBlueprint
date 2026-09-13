import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const CUSTOMERS: Row[] = [
  r(1, "797", "Priya"),
  r(2, "1600", "Miles"),
  r(3, "1619", "Hana"),
];

const ORDERS: Row[] = [r(1, "2", "797"), r(2, "3", "1600")];
const MATCHED_CUSTOMERS: Row[] = [r(1, "797", "Priya"), r(2, "1600", "Miles")];
const UNMATCHED_CUSTOMERS: Row[] = [r(1, "1619", "Hana")];
const BLOCKED_IDS: Row[] = [r(1, "797"), r(2, null)];

/** Shows filtering joins as a membership test instead of a row-combining join. */
export const shopflowSemiAntiJoinStages: Stage[] = [
  {
    name: "EXISTS keeps left rows with a match",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name",
      "FROM customers AS c",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "  AND EXISTS (",
      "    SELECT 1 FROM orders AS o",
      "    WHERE o.customer_id = c.customer_id",
      "      AND o.order_id IN (2, 3)",
      "  )",
      "ORDER BY c.customer_id",
    ],
    leftTable: { name: "customers", cols: ["customer_id", "first_name"], rows: CUSTOMERS, accent: "mint" },
    rightTable: { name: "orders", cols: ["order_id", "customer_id"], rows: ORDERS, accent: "violet" },
    steps: [
      st([0, 1, 2, 3, 7, 8], "pending", "EXISTS asks a yes-or-no question for each customer. It does not add order columns or repeat a customer once per matching order.", { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] }),
      st([4, 5, 6], "kept", "Priya and Miles have a qualifying order. Hana does not, so the semi-join keeps only the two matching customer rows.", { leftStates: ["kept", "kept", "dropped"], rightStates: ["kept", "kept"], resultRows: MATCHED_CUSTOMERS, resultCols: ["customer_id", "first_name"], resultTitle: "EXISTS result" }),
    ],
  },
  {
    name: "NOT EXISTS keeps left rows without a match",
    canvasMinHeight: 500,
    sql: [
      "SELECT c.customer_id, c.first_name",
      "FROM customers AS c",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "  AND NOT EXISTS (",
      "    SELECT 1 FROM orders AS o",
      "    WHERE o.customer_id = c.customer_id",
      "      AND o.order_id IN (2, 3)",
      "  )",
      "ORDER BY c.customer_id",
    ],
    leftTable: { name: "customers", cols: ["customer_id", "first_name"], rows: CUSTOMERS, accent: "mint" },
    rightTable: { name: "orders", cols: ["order_id", "customer_id"], rows: ORDERS, accent: "violet" },
    steps: [
      st([0, 1, 2, 3, 7, 8], "pending", "NOT EXISTS reverses the membership test. It asks whether no qualifying order can be found for each customer.", { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] }),
      st([4, 5, 6], "kept", "Orders 2 and 3 rule out Priya and Miles. Hana has no qualifying order, so the anti-join returns her customer row.", { leftStates: ["dropped", "dropped", "kept"], rightStates: ["dropped", "dropped"], resultRows: UNMATCHED_CUSTOMERS, resultCols: ["customer_id", "first_name"], resultTitle: "NOT EXISTS result" }),
    ],
  },
  {
    name: "NOT IN has a NULL trap",
    canvasMinHeight: 500,
    sql: [
      "WITH blocked_customer_ids(customer_id) AS (",
      "  VALUES (797), (NULL)",
      ")",
      "SELECT c.customer_id, c.first_name",
      "FROM customers AS c",
      "WHERE c.customer_id IN (797, 1600, 1619)",
      "  AND c.customer_id NOT IN (",
      "    SELECT customer_id FROM blocked_customer_ids",
      "  )",
      "ORDER BY c.customer_id",
    ],
    leftTable: { name: "customers", cols: ["customer_id", "first_name"], rows: CUSTOMERS, accent: "mint" },
    rightTable: { name: "blocked customer IDs", cols: ["customer_id"], rows: BLOCKED_IDS, accent: "violet" },
    steps: [
      st([0, 1, 2, 3, 4, 5, 8, 9], "pending", "The list is query-local only so we can safely see the rule. It contains 797 and a NULL, and NOT IN compares each customer to both values.", { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] }),
      st([6, 7], "dropped", "For 1600 and 1619, the comparison to NULL is unknown. WHERE keeps only true, so every candidate is rejected and the result has no rows.", { leftStates: ["dropped", "dropped", "dropped"], rightStates: ["kept", "kept"], resultRows: [], resultCols: ["customer_id", "first_name"], resultTitle: "NOT IN result: 0 rows" }),
    ],
  },
  {
    name: "EXCEPT expresses a set difference",
    canvasMinHeight: 500,
    sql: [
      "SELECT customer_id",
      "FROM customers",
      "WHERE customer_id IN (797, 1600, 1619)",
      "EXCEPT",
      "SELECT customer_id",
      "FROM orders",
      "WHERE order_id IN (2, 3)",
    ],
    leftTable: { name: "selected customers", cols: ["customer_id", "first_name"], rows: CUSTOMERS, accent: "mint" },
    rightTable: { name: "order customers", cols: ["order_id", "customer_id"], rows: ORDERS, accent: "violet" },
    steps: [
      st([0, 1, 2, 3, 4, 5, 6], "pending", "EXCEPT returns keys in the first query that do not appear in the second. It is set difference, so it is another concise anti-join shape when you need only the key set.", { leftStates: ["pending", "pending", "pending"], rightStates: ["pending", "pending"] }),
      st([3], "kept", "The order customer IDs remove 797 and 1600 from the selected customer IDs. Only 1619 remains.", { leftStates: ["dropped", "dropped", "kept"], rightStates: ["kept", "kept"], resultRows: [r(1, "1619")], resultCols: ["customer_id"], resultTitle: "EXCEPT result" }),
    ],
  },
];
