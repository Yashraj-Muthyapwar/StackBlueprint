import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const ORDER_ROWS: Row[] = [
  r(1, "1", "1785", "277.59"),
  r(2, "2", "797", "659.70"),
  r(3, "3", "1600", "377.61"),
];

const CUSTOMER_ROWS: Row[] = [
  r(1, "1785", "Sofia", "Diaz"),
  r(2, "797", "Priya", "Singh"),
  r(3, "1600", "Miles", "Singh"),
  r(4, "1", "Avery", "Chen"),
];

const OPTIONAL_ORDER_CODE_ROWS: Row[] = [r(1, "1", "WELCOME"), r(2, "2", null)];

const OPTIONAL_CUSTOMER_CODE_ROWS: Row[] = [r(1, "1785", "WELCOME"), r(2, "797", null)];

const NULL_SAFE_RESULT_ROWS: Row[] = [r(1, "1", "1785", "WELCOME"), r(2, "2", "797", null)];

const JOINED_ROWS: Row[] = [
  r(1, "1", "1785", "Sofia", "Diaz", "277.59"),
  r(2, "2", "797", "Priya", "Singh", "659.70"),
  r(3, "3", "1600", "Miles", "Singh", "377.61"),
];

/** Walks from an explicit equality join to USING and a complete composite key. */
export const shopflowInnerJoinStages: Stage[] = [
  {
    name: "Match ShopFlow customer keys",
    canvasMinHeight: 410,
    sql: [
      "SELECT o.order_id, o.customer_id, c.first_name, c.last_name, o.total_amount",
      "FROM orders AS o",
      "JOIN customers AS c",
      "  ON o.customer_id = c.customer_id",
      "WHERE o.order_id IN (1, 2, 3)",
      "ORDER BY o.order_id",
    ],
    leftTable: {
      name: "orders (selected)",
      cols: ["order_id", "customer_id", "total_amount"],
      rows: ORDER_ROWS,
      accent: "mint",
    },
    rightTable: {
      name: "customers",
      cols: ["customer_id", "first_name", "last_name"],
      rows: CUSTOMER_ROWS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 4, 5],
        "kept",
        "The mint table is the three selected orders. The violet table includes their three matching customers plus Avery, a real customer row that is outside this selected-order input.",
        {
          leftStates: ["pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending", "pending"],
        },
      ),
      st(
        [3],
        "kept",
        "ON pairs equal customer_id values. The three matching rows become the result; Avery has no row in this selected order set, so she is not returned here.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept", "kept", "dropped"],
          resultRows: JOINED_ROWS,
          resultCols: ["order_id", "customer_id", "first_name", "last_name", "total_amount"],
          resultTitle: "INNER JOIN result",
        },
      ),
    ],
  },
  {
    name: "Use the shared key name",
    canvasMinHeight: 410,
    sql: [
      "SELECT o.order_id, customer_id, c.first_name, c.last_name, o.total_amount",
      "FROM orders AS o",
      "JOIN customers AS c USING (customer_id)",
      "WHERE o.order_id IN (1, 2, 3)",
      "ORDER BY o.order_id",
    ],
    leftTable: {
      name: "orders (selected)",
      cols: ["order_id", "customer_id", "total_amount"],
      rows: ORDER_ROWS,
      accent: "mint",
    },
    rightTable: {
      name: "customers",
      cols: ["customer_id", "first_name", "last_name"],
      rows: CUSTOMER_ROWS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 3, 4],
        "kept",
        "The same mint orders and violet customers are visible again. Both tables intentionally call the shared key customer_id, so the shorter USING form is available.",
        {
          leftStates: ["pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending", "pending"],
        },
      ),
      st(
        [2],
        "kept",
        "USING (customer_id) means the same equality relationship as ON o.customer_id = c.customer_id. It exposes one shared customer_id output column, rather than one from each table.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept", "kept", "dropped"],
          resultRows: JOINED_ROWS,
          resultCols: ["order_id", "customer_id", "first_name", "last_name", "total_amount"],
          resultTitle: "INNER JOIN result",
        },
      ),
    ],
  },
  {
    name: "Keep a composite key whole",
    canvasMinHeight: 410,
    sql: [
      "SELECT a.product_id, a.warehouse_id, a.quantity",
      "FROM inventory AS a",
      "JOIN inventory AS b",
      "  ON a.product_id = b.product_id",
      " AND a.warehouse_id = b.warehouse_id",
      "WHERE a.product_id = 1",
      "ORDER BY a.warehouse_id",
    ],
    table: {
      name: "inventory",
      cols: ["product_id", "warehouse_id", "quantity"],
      rows: [r(1, "1", "1", "36"), r(2, "1", "2", "114")],
    },
    steps: [
      st(
        [0, 1, 2, 5, 6],
        "kept",
        "ShopFlow inventory is identified by the pair (product_id, warehouse_id). Product 1 has a separate stock row in each warehouse.",
      ),
      st(
        [3, 4],
        "kept",
        "Both columns belong in the condition. Joining on product_id alone would cross the two warehouse rows; comparing the full pair preserves the composite-key grain.",
        { highlightCols: [0, 1] },
      ),
    ],
  },
  {
    name: "Match optional values safely",
    canvasMinHeight: 500,
    sql: [
      "WITH order_codes(order_id, referral_code) AS (",
      "  VALUES (1, 'WELCOME'), (2, NULL)",
      "), customer_codes(customer_id, referral_code) AS (",
      "  VALUES (1785, 'WELCOME'), (797, NULL)",
      ") SELECT o.order_id, c.customer_id, o.referral_code",
      "FROM order_codes AS o",
      "JOIN customer_codes AS c",
      "  ON o.referral_code IS NOT DISTINCT FROM c.referral_code",
      "ORDER BY o.order_id",
    ],
    leftTable: {
      name: "order codes (query-local)",
      cols: ["order_id", "referral_code"],
      rows: OPTIONAL_ORDER_CODE_ROWS,
      accent: "mint",
    },
    rightTable: {
      name: "customer codes (query-local)",
      cols: ["customer_id", "referral_code"],
      rows: OPTIONAL_CUSTOMER_CODE_ROWS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1, 2, 3, 4, 5, 6, 8],
        "pending",
        "ShopFlow has no optional shared code column, so this query-local example isolates the behavior. Both sides contain one ordinary code and one NULL optional value.",
        { leftStates: ["pending", "pending"], rightStates: ["pending", "pending"] },
      ),
      st(
        [7],
        "kept",
        "IS NOT DISTINCT FROM treats equal text values as equal and also treats NULL with NULL as a match. Ordinary equals would leave the second pair unmatched because NULL = NULL is UNKNOWN.",
        {
          leftStates: ["kept", "kept"],
          rightStates: ["kept", "kept"],
          resultRows: NULL_SAFE_RESULT_ROWS,
          resultCols: ["order_id", "customer_id", "referral_code"],
          resultTitle: "null-safe result",
        },
      ),
    ],
  },
  {
    name: "Avoid hidden join conditions",
    canvasMinHeight: 500,
    sql: [
      "-- Fragile: NATURAL JOIN uses every shared column name.",
      "-- FROM orders AS o NATURAL JOIN customers AS c",
      "",
      "SELECT o.order_id, o.customer_id, c.first_name, c.last_name, o.total_amount",
      "FROM orders AS o",
      "JOIN customers AS c",
      "  ON o.customer_id = c.customer_id",
      "WHERE o.order_id IN (1, 2, 3)",
      "ORDER BY o.order_id",
    ],
    leftTable: {
      name: "orders (selected)",
      cols: ["order_id", "customer_id", "total_amount"],
      rows: ORDER_ROWS,
      accent: "mint",
    },
    rightTable: {
      name: "customers",
      cols: ["customer_id", "first_name", "last_name"],
      rows: CUSTOMER_ROWS,
      accent: "violet",
    },
    steps: [
      st(
        [0, 1],
        "pending",
        "NATURAL JOIN is risky because the database chooses all same-named columns for you. It happens to use customer_id today, but a later shared name can silently change the relationship.",
        {
          leftStates: ["pending", "pending", "pending"],
          rightStates: ["pending", "pending", "pending", "pending"],
        },
      ),
      st(
        [3, 4, 5, 6, 7, 8],
        "kept",
        "Write the intended relationship with ON instead. The condition is reviewable, stable as schemas evolve, and produces the three expected customer pairs.",
        {
          leftStates: ["kept", "kept", "kept"],
          rightStates: ["kept", "kept", "kept", "dropped"],
          resultRows: JOINED_ROWS,
          resultCols: ["order_id", "customer_id", "first_name", "last_name", "total_amount"],
          resultTitle: "explicit ON result",
        },
      ),
    ],
  },
];
