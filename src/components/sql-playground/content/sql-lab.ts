import type { ExampleGroup } from "./types";

export const SQL_LAB_EXAMPLES: ExampleGroup[] = [
  {
    group: "Schema & integrity",
    blurb: "Use ShopFlow's views and constraints to see the database protect valid state.",
    items: [
      {
        title: "Customer lifetime value",
        note: "Query the built-in view instead of repeating its join and aggregation.",
        sql: `SELECT *
FROM customer_order_summary
ORDER BY lifetime_value DESC
LIMIT 20;`,
      },
      {
        title: "Products never purchased",
        note: "An anti-join reveals deliberately unsold catalog products.",
        sql: `SELECT p.product_id, p.product_name, p.active
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.product_id
WHERE oi.product_id IS NULL
ORDER BY p.product_id;`,
      },
      {
        title: "Test the unique constraint",
        note: "This intentionally reuses an existing email and is rejected without changing the database.",
        sql: `INSERT INTO customers (
  customer_id,
  first_name,
  last_name,
  email,
  country,
  created_at
)
VALUES (
  999999,
  'Demo',
  'Customer',
  'avery.chen1@shopflow.test',
  'US',
  CURRENT_TIMESTAMP
);`,
      },
      {
        title: "Test the foreign-key constraint",
        note: "This intentionally fails, but a single invalid statement is rolled back automatically.",
        sql: `INSERT INTO orders (
  order_id,
  customer_id,
  order_date,
  status,
  total_amount
)
VALUES (
  999999,
  999999,
  CURRENT_TIMESTAMP,
  'pending',
  100.00
);`,
      },
      {
        title: "Test the shipment business rule",
        note: "This impossible delivery is rejected by ShopFlow's shipment-state CHECK constraint.",
        sql: `INSERT INTO shipments (
  shipment_id,
  order_id,
  shipped_at,
  delivered_at,
  carrier,
  status
)
VALUES (
  999999,
  17,
  '2024-05-10 10:00:00',
  '2024-05-09 10:00:00',
  'Demo Carrier',
  'delivered'
);`,
      },
    ],
  },
  {
    group: "Recursive SQL",
    blurb: "Use the employee and category hierarchies for real recursive CTE practice.",
    items: [
      {
        title: "Engineering reporting tree",
        note: "Start at the VP of Engineering and walk down the organization.",
        sql: `WITH RECURSIVE employee_tree AS (
  SELECT employee_id, employee_name, manager_id, title, 0 AS level
  FROM employees
  WHERE employee_id = 2

  UNION ALL

  SELECT e.employee_id, e.employee_name, e.manager_id, e.title, et.level + 1
  FROM employees e
  JOIN employee_tree et ON e.manager_id = et.employee_id
)
SELECT *
FROM employee_tree
ORDER BY level, employee_id;`,
      },
      {
        title: "Category path",
        note: "Build readable paths from the self-referencing category tree.",
        sql: `WITH RECURSIVE category_tree AS (
  SELECT category_id, parent_category_id, category_name,
         CAST(category_name AS VARCHAR(500)) AS path
  FROM categories
  WHERE parent_category_id IS NULL

  UNION ALL

  SELECT c.category_id, c.parent_category_id, c.category_name,
         CAST(CONCAT(ct.path, ' > ', c.category_name) AS VARCHAR(500)) AS path
  FROM categories c
  JOIN category_tree ct ON c.parent_category_id = ct.category_id
)
SELECT category_id, path
FROM category_tree
ORDER BY path;`,
      },
      {
        title: "Deepest organizational chain",
        note: "Find the employees furthest from the CEO using recursive depth.",
        sql: `WITH RECURSIVE hierarchy AS (
  SELECT employee_id, employee_name, manager_id, title, 0 AS depth
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.employee_id, e.employee_name, e.manager_id, e.title, h.depth + 1
  FROM employees e
  JOIN hierarchy h ON e.manager_id = h.employee_id
)
SELECT employee_id, employee_name, title, depth
FROM hierarchy
WHERE depth = (SELECT MAX(depth) FROM hierarchy)
ORDER BY employee_id;`,
      },
    ],
  },
  {
    group: "Indexes & query plans",
    blurb:
      "Inspect each engine's actual plan; an index is a tradeoff, not a promise of a particular scan.",
    items: [
      {
        title: "Index-backed customer lookup",
        note: "Use the existing customer-order index and inspect the measured plan.",
        sql: `EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE customer_id = 42;`,
      },
      {
        title: "When an index helps",
        note: "Run this selective lookup, then replace the predicate with status = 'delivered' and compare the plan.",
        sql: `-- First inspect a highly selective primary-key lookup.
EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE order_id = 10001;

-- Then change the predicate to this lower-selectivity filter and run again:
-- WHERE status = 'delivered';`,
      },
      {
        title: "Composite index lookup",
        note: "inventory's composite primary key creates an index on (product_id, warehouse_id); inspect its two-column lookup.",
        sql: `EXPLAIN ANALYZE
SELECT *
FROM inventory
WHERE product_id = 100
  AND warehouse_id = 2;`,
      },
      {
        title: "Index trade-off",
        note: "Create a temporary status index, inspect a plan, then remove it so repeated runs stay clean.",
        sql: `DROP INDEX IF EXISTS idx_orders_status;

CREATE INDEX idx_orders_status ON orders (status);

EXPLAIN ANALYZE
SELECT *
FROM orders
WHERE status = 'pending';

DROP INDEX idx_orders_status;`,
      },
    ],
  },
  {
    group: "Transactions",
    blurb:
      "Compare a rollback-safe rehearsal with a committed workflow that persists in this browser session.",
    items: [
      {
        title: "Safe transaction rehearsal",
        note: "Payment, order status, and inventory change together; ROLLBACK keeps the sample data unchanged.",
        sql: `BEGIN;

UPDATE orders
SET status = 'paid'
WHERE order_id = 3;

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 25
  AND warehouse_id = 1;

INSERT INTO payments (
  payment_id,
  order_id,
  payment_date,
  amount,
  status
)
VALUES (
  999999,
  3,
  CURRENT_TIMESTAMP,
  377.61,
  'successful'
);

SELECT o.order_id, o.status, i.product_id, i.warehouse_id, i.quantity
FROM orders o
JOIN inventory i ON i.product_id = 25 AND i.warehouse_id = 1
WHERE o.order_id = 3;

ROLLBACK;`,
      },
      {
        title: "Commit an order workflow",
        note: "This intentionally persists. Use Reset database to restore the original ShopFlow data before repeating it.",
        sql: `BEGIN;

UPDATE orders
SET status = 'paid'
WHERE order_id = 3;

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 25
  AND warehouse_id = 1;

INSERT INTO payments (
  payment_id,
  order_id,
  payment_date,
  amount,
  status
)
VALUES (
  999998,
  3,
  CURRENT_TIMESTAMP,
  377.61,
  'successful'
);

COMMIT;

SELECT o.order_id, o.status, i.product_id, i.warehouse_id, i.quantity,
       p.payment_id, p.amount, p.status AS payment_status
FROM orders o
JOIN inventory i ON i.product_id = 25 AND i.warehouse_id = 1
JOIN payments p ON p.payment_id = 999998
WHERE o.order_id = 3;`,
      },
    ],
  },
];
