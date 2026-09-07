import type { ExampleGroup } from "./types";

export const SQL_LAB_EXAMPLES: ExampleGroup[] = [
  {
    group: "Schema and relationships",
    blurb: "Follow a complete order workflow through a deliberately constrained operational schema.",
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
        title: "Low stock across warehouses",
        note: "The low_stock_products view keeps the inventory rule reusable.",
        sql: `SELECT *
FROM low_stock_products
ORDER BY quantity, product_id, warehouse_id
LIMIT 30;`,
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
         CONCAT(ct.path, ' > ', c.category_name) AS path
  FROM categories c
  JOIN category_tree ct ON c.parent_category_id = ct.category_id
)
SELECT category_id, path
FROM category_tree
ORDER BY path;`,
      },
    ],
  },
  {
    group: "Plans and transactions",
    blurb: "Inspect each engine's actual plan; indexes and transaction details are not identical across engines.",
    items: [
      {
        title: "Inspect a selective lookup",
        note: "Use the existing customer-order index and inspect the measured plan.",
        sql: `EXPLAIN ANALYZE
SELECT o.order_id, o.order_date, o.status, o.total_amount
FROM orders o
WHERE o.customer_id = 12
ORDER BY o.order_date DESC;`,
      },
      {
        title: "Safe transaction rehearsal",
        note: "The ROLLBACK keeps the sample data unchanged after you run it.",
        sql: `BEGIN;

UPDATE inventory
SET quantity = quantity - 1
WHERE product_id = 1
  AND warehouse_id = 1;

SELECT product_id, warehouse_id, quantity
FROM inventory
WHERE product_id = 1
  AND warehouse_id = 1;

ROLLBACK;`,
      },
    ],
  },
];
