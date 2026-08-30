import type { ExampleGroup } from "./types";

/**
 * Bike Store: two schemas, nine tables, real retail shape.
 *
 * Everything is schema-qualified, because learning that `sales.orders` and
 * `production.products` live in different namespaces is half the point of this
 * dataset.
 */
export const BIKE_STORE_EXAMPLES: ExampleGroup[] = [
  {
    group: "Start here",
    blurb: "Find your way around two schemas.",
    items: [
      {
        title: "What is in stock",
        note: "Qualified names and a simple join",
        sql: `SELECT p.product_name,
       b.brand_name,
       c.category_name,
       p.model_year,
       p.list_price
FROM production.products p
JOIN production.brands b     ON b.brand_id = p.brand_id
JOIN production.categories c ON c.category_id = p.category_id
ORDER BY p.list_price DESC
LIMIT 25;`,
      },
      {
        title: "Orders never shipped",
        note: "NULL means it has not happened yet",
        sql: `-- order_status 1 = pending, 2 = processing, 3 = rejected, 4 = completed.
SELECT order_id, customer_id, order_date, required_date, order_status
FROM sales.orders
WHERE shipped_date IS NULL
ORDER BY order_date DESC
LIMIT 30;`,
      },
      {
        title: "Late deliveries",
        note: "Comparing two date columns",
        sql: `SELECT order_id,
       order_date,
       required_date,
       shipped_date,
       shipped_date - required_date AS days_late
FROM sales.orders
WHERE shipped_date > required_date
ORDER BY days_late DESC
LIMIT 25;`,
      },
    ],
  },
  {
    group: "Money",
    blurb: "Line-item maths, the way a real order table stores it.",
    items: [
      {
        title: "Revenue per order",
        note: "Discount lives on the line, not the order",
        sql: `SELECT o.order_id,
       o.order_date,
       COUNT(*) AS lines,
       ROUND(SUM(oi.quantity * oi.list_price * (1 - oi.discount)), 2) AS net_revenue
FROM sales.orders o
JOIN sales.order_items oi ON oi.order_id = o.order_id
GROUP BY o.order_id, o.order_date
ORDER BY net_revenue DESC
LIMIT 25;`,
      },
      {
        title: "What discounting costs",
        note: "Gross minus net, per category",
        sql: `SELECT c.category_name,
       ROUND(SUM(oi.quantity * oi.list_price), 2)                    AS gross,
       ROUND(SUM(oi.quantity * oi.list_price * oi.discount), 2)      AS discount_given,
       ROUND(SUM(oi.quantity * oi.list_price * (1 - oi.discount)), 2) AS net,
       ROUND(100.0 * SUM(oi.quantity * oi.list_price * oi.discount)
             / SUM(oi.quantity * oi.list_price), 2)                   AS discount_pct
FROM sales.order_items oi
JOIN production.products p   ON p.product_id = oi.product_id
JOIN production.categories c ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY discount_pct DESC;`,
      },
      {
        title: "Store league table",
        note: "Aggregate across three tables",
        sql: `SELECT s.store_name,
       s.city,
       s.state,
       COUNT(DISTINCT o.order_id)                                     AS orders,
       COUNT(DISTINCT o.customer_id)                                  AS customers,
       ROUND(SUM(oi.quantity * oi.list_price * (1 - oi.discount)), 2)  AS revenue
FROM sales.stores s
JOIN sales.orders o       ON o.store_id = s.store_id
JOIN sales.order_items oi ON oi.order_id = o.order_id
GROUP BY s.store_name, s.city, s.state
ORDER BY revenue DESC;`,
      },
    ],
  },
  {
    group: "Staff and stock",
    blurb: "Hierarchies, inventory and the rows that are not there.",
    items: [
      {
        title: "Who reports to whom",
        note: "Self join on manager_id",
        sql: `SELECT s.first_name || ' ' || s.last_name AS staff,
       st.store_name,
       m.first_name || ' ' || m.last_name AS manager
FROM sales.staffs s
JOIN sales.stores st  ON st.store_id = s.store_id
LEFT JOIN sales.staffs m ON m.staff_id = s.manager_id
ORDER BY st.store_name, manager NULLS FIRST;`,
      },
      {
        title: "Out of stock everywhere",
        note: "Aggregate then filter with HAVING",
        sql: `SELECT p.product_name, b.brand_name, SUM(s.quantity) AS units_on_hand
FROM production.stocks s
JOIN production.products p ON p.product_id = s.product_id
JOIN production.brands b   ON b.brand_id = p.brand_id
GROUP BY p.product_name, b.brand_name
HAVING SUM(s.quantity) = 0
ORDER BY p.product_name;`,
      },
      {
        title: "Products that never sold",
        note: "Anti-join with NOT EXISTS",
        sql: `SELECT p.product_id, p.product_name, p.list_price
FROM production.products p
WHERE NOT EXISTS (
  SELECT 1
  FROM sales.order_items oi
  WHERE oi.product_id = p.product_id
)
ORDER BY p.list_price DESC;`,
      },
    ],
  },
  {
    group: "Windows and ranking",
    blurb: "Compare a row against its own group.",
    items: [
      {
        title: "Top 3 products per category",
        note: "RANK inside a partition",
        sql: `WITH sales_by_product AS (
  SELECT p.product_id,
         p.product_name,
         c.category_name,
         SUM(oi.quantity) AS units
  FROM sales.order_items oi
  JOIN production.products p   ON p.product_id = oi.product_id
  JOIN production.categories c ON c.category_id = p.category_id
  GROUP BY p.product_id, p.product_name, c.category_name
)
SELECT category_name, product_name, units, rnk
FROM (
  SELECT sales_by_product.*,
         RANK() OVER (PARTITION BY category_name ORDER BY units DESC) AS rnk
  FROM sales_by_product
) ranked
WHERE rnk <= 3
ORDER BY category_name, rnk;`,
      },
      {
        title: "Monthly revenue and growth",
        note: "LAG across an ordered window",
        sql: `WITH monthly AS (
  SELECT CAST(DATE_TRUNC('month', o.order_date) AS DATE) AS month,
         SUM(oi.quantity * oi.list_price * (1 - oi.discount)) AS revenue
  FROM sales.orders o
  JOIN sales.order_items oi ON oi.order_id = o.order_id
  GROUP BY 1
)
SELECT month,
       ROUND(revenue, 2) AS revenue,
       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS change,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS pct_change
FROM monthly
ORDER BY month;`,
      },
    ],
  },
  {
    group: "PostgreSQL dialect",
    blurb: "Syntax that only the row store understands.",
    items: [
      {
        title: "DISTINCT ON: newest order per customer",
        note: "One row per group, no window function",
        only: "postgres",
        sql: `SELECT DISTINCT ON (o.customer_id)
       o.customer_id,
       c.first_name || ' ' || c.last_name AS customer,
       o.order_id,
       o.order_date
FROM sales.orders o
JOIN sales.customers c ON c.customer_id = o.customer_id
ORDER BY o.customer_id, o.order_date DESC
LIMIT 30;`,
      },
      {
        title: "generate_series fills the gaps",
        note: "A calendar with no missing months",
        only: "postgres",
        sql: `-- Months with no orders would simply be absent from a GROUP BY.
-- Generating the axis first means they show as zero.
WITH months AS (
  SELECT generate_series(
           DATE '2016-01-01', DATE '2018-12-01', INTERVAL '1 month'
         )::date AS month
)
SELECT m.month,
       COALESCE(COUNT(o.order_id), 0) AS orders
FROM months m
LEFT JOIN sales.orders o
  ON DATE_TRUNC('month', o.order_date) = m.month
GROUP BY m.month
ORDER BY m.month;`,
      },
      {
        title: "LATERAL: top 2 lines per order",
        note: "A subquery that sees the current row",
        only: "postgres",
        sql: `SELECT o.order_id, o.order_date, top.product_id, top.quantity
FROM sales.orders o
CROSS JOIN LATERAL (
  SELECT oi.product_id, oi.quantity
  FROM sales.order_items oi
  WHERE oi.order_id = o.order_id
  ORDER BY oi.quantity * oi.list_price DESC
  LIMIT 2
) AS top
ORDER BY o.order_id
LIMIT 30;`,
      },
      {
        title: "string_agg builds a list",
        note: "Collapse rows into one text column",
        only: "postgres",
        sql: `SELECT c.category_name,
       COUNT(*) AS products,
       string_agg(DISTINCT b.brand_name, ', ' ORDER BY b.brand_name) AS brands
FROM production.products p
JOIN production.categories c ON c.category_id = p.category_id
JOIN production.brands b     ON b.brand_id = p.brand_id
GROUP BY c.category_name
ORDER BY products DESC;`,
      },
    ],
  },
  {
    group: "DuckDB dialect",
    blurb: "Shortcuts a column store can afford.",
    items: [
      {
        title: "QUALIFY: newest order per customer",
        note: "Filter a window without a subquery",
        only: "duckdb",
        sql: `SELECT o.customer_id,
       c.first_name || ' ' || c.last_name AS customer,
       o.order_id,
       o.order_date
FROM sales.orders o
JOIN sales.customers c ON c.customer_id = o.customer_id
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY o.customer_id ORDER BY o.order_date DESC
) = 1
ORDER BY o.customer_id
LIMIT 30;`,
      },
      {
        title: "SUMMARIZE the whole table",
        note: "Every column profiled in one statement",
        only: "duckdb",
        sql: `SUMMARIZE sales.order_items;`,
      },
      {
        title: "PIVOT without the CASE ladder",
        note: "Categories across, years down",
        only: "duckdb",
        sql: `PIVOT (
  SELECT c.category_name,
         EXTRACT(year FROM o.order_date) AS yr,
         oi.quantity
  FROM sales.order_items oi
  JOIN sales.orders o          ON o.order_id = oi.order_id
  JOIN production.products p   ON p.product_id = oi.product_id
  JOIN production.categories c ON c.category_id = p.category_id
)
ON yr
USING SUM(quantity)
GROUP BY category_name
ORDER BY category_name;`,
      },
      {
        title: "Columns by pattern",
        note: "COLUMNS(*) applies one expression to many",
        only: "duckdb",
        sql: `-- Aggregate every numeric column without naming them one by one.
SELECT MIN(COLUMNS(* EXCLUDE (order_id, item_id, product_id)))
FROM sales.order_items;`,
      },
      {
        title: "list_aggregate and structs",
        note: "Nested types, no join required",
        only: "duckdb",
        sql: `SELECT c.category_name,
       COUNT(*)                                    AS products,
       list_sort(list_distinct(list(b.brand_name))) AS brands,
       {'min': MIN(p.list_price), 'max': MAX(p.list_price)} AS price_range
FROM production.products p
JOIN production.categories c ON c.category_id = p.category_id
JOIN production.brands b     ON b.brand_id = p.brand_id
GROUP BY c.category_name
ORDER BY products DESC;`,
      },
    ],
  },
];
