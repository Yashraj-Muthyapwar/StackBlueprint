import type { ExampleGroup } from "./types";

/**
 * Cycle Depot: the generated starter dataset. Deliberately small, so the
 * lessons are about the shape of a query rather than the size of the data.
 */
export const CYCLE_DEPOT_EXAMPLES: ExampleGroup[] = [
  {
    group: "Start here",
    blurb: "Read some rows, then narrow them down.",
    items: [
      {
        title: "Browse a table",
        note: "SELECT and LIMIT",
        sql: `SELECT *
FROM customers
LIMIT 10;`,
      },
      {
        title: "Filter and sort",
        note: "WHERE runs before ORDER BY",
        sql: `SELECT name, city, country, signup_date
FROM customers
WHERE country = 'USA'
ORDER BY signup_date DESC
LIMIT 20;`,
      },
      {
        title: "Missing values",
        note: "NULL is not equal to anything, not even NULL",
        sql: `-- city IS NULL for a handful of customers.
-- Note that "city = NULL" would return zero rows: comparison
-- with NULL is never true, it is unknown.
SELECT id, name, city
FROM customers
WHERE city IS NULL;`,
      },
      {
        title: "Derived columns",
        note: "Expressions and aliases",
        sql: `SELECT name,
       category,
       price,
       cost,
       price - cost                      AS margin,
       ROUND((price - cost) / price * 100, 1) AS margin_pct
FROM products
ORDER BY margin_pct DESC;`,
      },
    ],
  },
  {
    group: "Joins",
    blurb: "Combine tables, and see where rows appear or vanish.",
    items: [
      {
        title: "Orders with customer names",
        note: "INNER JOIN keeps only matches",
        sql: `SELECT o.id AS order_id,
       c.name,
       o.order_date,
       o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.order_date DESC
LIMIT 25;`,
      },
      {
        title: "Customers who never ordered",
        note: "LEFT JOIN plus IS NULL",
        sql: `-- The classic anti-join. Keep every customer, then throw away
-- the ones that found a match on the right-hand side.
SELECT c.id, c.name, c.country, c.signup_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY c.signup_date;`,
      },
      {
        title: "Three-table join",
        note: "Watch the row count grow in the Pipeline tab",
        sql: `SELECT o.id AS order_id,
       c.name       AS customer,
       p.name       AS product,
       oi.quantity,
       oi.unit_price
FROM orders o
JOIN customers c    ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
ORDER BY o.id
LIMIT 30;`,
      },
      {
        title: "Self join: who reports to whom",
        note: "One table, two roles",
        sql: `SELECT e.name        AS employee,
       e.role,
       m.name        AS reports_to
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY m.name NULLS FIRST, e.name;`,
      },
    ],
  },
  {
    group: "Aggregation",
    blurb: "Collapse many rows into one number per group.",
    items: [
      {
        title: "Revenue by category",
        note: "JOIN then GROUP BY",
        sql: `SELECT p.category,
       COUNT(*)                            AS line_items,
       SUM(oi.quantity)                    AS units,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY p.category
ORDER BY revenue DESC;`,
      },
      {
        title: "HAVING filters groups",
        note: "WHERE filters rows, HAVING filters groups",
        sql: `SELECT c.country,
       COUNT(DISTINCT c.id) AS customers,
       COUNT(o.id)          AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.country
HAVING COUNT(o.id) > 20
ORDER BY orders DESC;`,
      },
      {
        title: "Conditional aggregation",
        note: "CASE inside SUM, a pivot without a PIVOT",
        sql: `SELECT c.country,
       COUNT(*)                                              AS total_orders,
       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)
             / COUNT(*), 1)                                   AS cancel_rate
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.country
ORDER BY cancel_rate DESC;`,
      },
      {
        title: "COUNT(*) vs COUNT(column)",
        note: "COUNT(column) skips NULLs",
        sql: `-- Same table, three different answers.
SELECT COUNT(*)                AS all_rows,
       COUNT(city)             AS rows_with_city,
       COUNT(DISTINCT country) AS distinct_countries
FROM customers;`,
      },
    ],
  },
  {
    group: "Window functions",
    blurb: "Aggregate without collapsing the rows.",
    items: [
      {
        title: "Rank orders per customer",
        note: "ROW_NUMBER over a partition",
        sql: `SELECT c.name,
       o.id AS order_id,
       o.order_date,
       ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.order_date) AS nth_order
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY c.name, nth_order
LIMIT 40;`,
      },
      {
        title: "Running revenue",
        note: "A cumulative SUM over an ordered frame",
        sql: `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', o.order_date) AS DATE) AS month,
         SUM(oi.quantity * oi.unit_price)                AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status IN ('delivered', 'shipped')
  GROUP BY 1
)
SELECT month,
       ROUND(revenue, 2)                            AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month), 2) AS running_total
FROM monthly
ORDER BY month;`,
      },
      {
        title: "Share of category",
        note: "An aggregate window next to the raw row",
        sql: `SELECT name,
       category,
       price,
       ROUND(AVG(price) OVER (PARTITION BY category), 2) AS category_avg,
       ROUND(100.0 * price / SUM(price) OVER (PARTITION BY category), 1) AS pct_of_category
FROM products
ORDER BY category, pct_of_category DESC;`,
      },
      {
        title: "Month over month change",
        note: "LAG reaches back a row",
        sql: `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', o.order_date) AS DATE) AS month,
         COUNT(*)                                        AS orders
  FROM orders o
  GROUP BY 1
)
SELECT month,
       orders,
       LAG(orders) OVER (ORDER BY month)              AS prev_month,
       orders - LAG(orders) OVER (ORDER BY month)     AS change
FROM monthly
ORDER BY month;`,
      },
    ],
  },
  {
    group: "CTEs and subqueries",
    blurb: "Name a result, then build on top of it.",
    items: [
      {
        title: "Layered CTEs",
        note: "Each step is readable on its own",
        sql: `WITH order_value AS (
  SELECT o.id,
         o.customer_id,
         SUM(oi.quantity * oi.unit_price) AS value
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id, o.customer_id
),
customer_totals AS (
  SELECT customer_id,
         COUNT(*)         AS orders,
         ROUND(SUM(value), 2) AS lifetime_value
  FROM order_value
  GROUP BY customer_id
)
SELECT c.name, c.country, t.orders, t.lifetime_value
FROM customer_totals t
JOIN customers c ON c.id = t.customer_id
ORDER BY t.lifetime_value DESC
LIMIT 15;`,
      },
      {
        title: "Correlated subquery",
        note: "The inner query re-runs per outer row",
        sql: `SELECT c.name,
       c.country,
       (SELECT MAX(o.order_date)
        FROM orders o
        WHERE o.customer_id = c.id) AS last_order
FROM customers c
ORDER BY last_order DESC NULLS LAST
LIMIT 20;`,
      },
      {
        title: "Recursive CTE: org chart",
        note: "Walk a hierarchy to any depth",
        sql: `WITH RECURSIVE chart AS (
  SELECT id, name, role, manager_id, 1 AS level
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  SELECT e.id, e.name, e.role, e.manager_id, chart.level + 1
  FROM employees e
  JOIN chart ON chart.id = e.manager_id
)
SELECT level, name, role
FROM chart
ORDER BY level, name;`,
      },
    ],
  },
  {
    group: "Engine specials",
    blurb: "The same job, expressed the way each engine prefers.",
    items: [
      {
        title: "DISTINCT ON",
        note: "PostgreSQL: first row per group, no window needed",
        only: "postgres",
        sql: `-- PostgreSQL only. The ORDER BY decides which row wins.
SELECT DISTINCT ON (customer_id)
       customer_id, id AS order_id, order_date, status
FROM orders
ORDER BY customer_id, order_date DESC
LIMIT 20;`,
      },
      {
        title: "QUALIFY",
        note: "DuckDB: filter window output inline",
        only: "duckdb",
        sql: `-- DuckDB only. Same answer as DISTINCT ON, no subquery.
SELECT customer_id, id AS order_id, order_date, status
FROM orders
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY customer_id ORDER BY order_date DESC
) = 1
ORDER BY customer_id
LIMIT 20;`,
      },
      {
        title: "SUMMARIZE",
        note: "DuckDB: profile every column at once",
        only: "duckdb",
        sql: `-- Instant column profile: min, max, distinct count, null share.
SUMMARIZE products;`,
      },
      {
        title: "Portable top-N per group",
        note: "Works on both engines",
        sql: `-- The window-function version runs anywhere.
SELECT customer_id, order_id, order_date, status
FROM (
  SELECT o.customer_id,
         o.id AS order_id,
         o.order_date,
         o.status,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id
                            ORDER BY o.order_date DESC) AS rn
  FROM orders o
) ranked
WHERE rn = 1
ORDER BY customer_id
LIMIT 20;`,
      },
    ],
  },
  {
    group: "Break something",
    blurb: "Write to the database. Reset restores it.",
    items: [
      {
        title: "Create your own table",
        note: "DDL works; watch the Schema map update",
        sql: `-- DOUBLE PRECISION rather than DOUBLE: DuckDB accepts both,
-- PostgreSQL only the spelled-out form.
CREATE TABLE experiments (
  id    INTEGER PRIMARY KEY,
  name  VARCHAR,
  score DOUBLE PRECISION
);

INSERT INTO experiments VALUES
  (1, 'baseline', 0.71),
  (2, 'v2-tuned', 0.83),
  (3, 'v3-pruned', 0.79);

SELECT * FROM experiments ORDER BY score DESC;`,
      },
      {
        title: "Update rows",
        note: "UPDATE reports how many rows it touched",
        sql: `UPDATE products
SET price = ROUND(price * 1.05, 2)
WHERE category = 'Accessories';

SELECT name, category, price
FROM products
WHERE category = 'Accessories'
ORDER BY price DESC;`,
      },
      {
        title: "A query that fails",
        note: "See how the error panel explains it",
        sql: `-- revenue is an alias created in SELECT, and WHERE runs first,
-- so this cannot work. The fix is HAVING, or a subquery.
SELECT p.category, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE revenue > 10000
GROUP BY p.category;`,
      },
    ],
  },
];
