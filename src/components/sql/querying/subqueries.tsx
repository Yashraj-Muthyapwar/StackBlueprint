import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";
import { HCOLS, ORD_H } from "./aggregation";
import { USERS_J } from "./joins";

// ----- q-scalar -----
export const scalarStages: Stage[] = [
  {
    name: "Scalar subquery (atomic value)",
    sql: [
      "SELECT id, customer, total,",
      "       (SELECT AVG(total) FROM orders) AS avg_all",
      "FROM   orders",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [1],
        "kept",
        "Subquery returns ONE row, ONE column → can sit anywhere a value is allowed. Computed ONCE and joined as a constant. Cost: 1 extra scan.",
        { highlightCols: [2] },
      ),
    ],
  },
  {
    name: "Constant fold",
    sql: ["SELECT * FROM orders", "WHERE  total > (SELECT AVG(total) FROM orders)"],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [1],
        pass((r) => Number(r.cells[2]) > 66.67),
        "Subquery → 66.67. Outer query filters once with that constant. SAME cost as WHERE total > 66.67.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Multi-row → ERROR",
    sql: ["SELECT *", "FROM   orders", "WHERE  customer = (SELECT customer FROM orders)  -- bad"],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [2],
        () => "dropped" as RowState,
        "ERROR: 'more than one row returned by a subquery used as an expression'. Use IN, ANY, or ALL for set comparisons.",
        { noteTone: "rose" },
      ),
    ],
  },
];

// ----- q-corr: correlated, O(N²), rewrite -----
export const corrStages: Stage[] = [
  {
    name: "Naive correlated subquery",
    sql: [
      "SELECT o.id, o.customer, o.total,",
      "       (SELECT AVG(total) FROM orders o2",
      "        WHERE o2.customer = o.customer) AS cust_avg",
      "FROM   orders o",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [1, 2, 3],
        "kept",
        "The inner query references the outer row (o.customer). It re-executes ONCE PER OUTER ROW → O(N·M). 6 outer × 6 scans = 36 row reads here, 1M × 1M in production = catastrophic.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "Rewrite as JOIN to aggregated CTE",
    sql: [
      "WITH avgs AS (",
      "  SELECT customer, AVG(total) AS cust_avg",
      "  FROM orders GROUP BY customer)",
      "SELECT o.id, o.customer, o.total, a.cust_avg",
      "FROM   orders o",
      "JOIN   avgs   a ON a.customer = o.customer",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [0, 1, 2],
        "added",
        "Aggregate ONCE, then JOIN. O(N+M) instead of O(N·M). Same answer, orders of magnitude faster on real data.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Window function — single pass",
    sql: [
      "SELECT id, customer, total,",
      "       AVG(total) OVER (PARTITION BY customer) AS cust_avg",
      "FROM   orders",
    ],
    table: { name: "orders", cols: HCOLS, rows: ORD_H },
    steps: [
      st(
        [1],
        "kept",
        "Window functions compute per-partition aggregates without collapsing rows. One scan, one hash. Almost always the right answer for 'aggregate alongside detail'.",
        { noteTone: "mint" },
      ),
    ],
  },
];

// ----- q-existsin: EXISTS, IN, NOT IN NULL trap -----
export const existsStages: Stage[] = [
  {
    name: "IN — fine when subquery has no NULLs",
    sql: ["SELECT id, name FROM users", "WHERE  id IN (SELECT user_id FROM orders)"],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [1],
        pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "Equivalent to a semi-join. Modern optimisers turn IN(subquery) into the same plan as EXISTS in most cases.",
      ),
    ],
  },
  {
    name: "EXISTS — short-circuit, NULL-safe",
    sql: [
      "SELECT id, name FROM users u",
      "WHERE  EXISTS (SELECT 1 FROM orders o",
      "               WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [1, 2],
        pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "EXISTS stops at first match. Returns TRUE/FALSE — never UNKNOWN — so handles NULLs cleanly.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "NOT IN with NULL — silent zero",
    sql: [
      "SELECT id, name FROM users",
      "WHERE  id NOT IN (SELECT user_id FROM orders) -- orders.user_id has NULLs",
    ],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [1],
        () => "dropped" as RowState,
        "If any subquery row is NULL, NOT IN returns UNKNOWN for every outer row → empty result. ALWAYS prefer NOT EXISTS.",
        { noteTone: "rose" },
      ),
    ],
  },
];
