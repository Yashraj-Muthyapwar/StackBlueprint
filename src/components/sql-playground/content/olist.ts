import type { ExampleGroup } from "./types";

/**
 * Olist: real marketplace data, so the questions are the ones an analyst
 * actually gets asked. Delivery lateness, review scores, seller concentration,
 * payment behaviour.
 */
export const OLIST_EXAMPLES: ExampleGroup[] = [
  {
    group: "Start here",
    blurb: "Real orders, real timestamps, real gaps.",
    items: [
      {
        title: "Order status breakdown",
        note: "Where 100k orders ended up",
        sql: `SELECT order_status,
       COUNT(*) AS orders,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct
FROM orders
GROUP BY order_status
ORDER BY orders DESC;`,
      },
      {
        title: "Orders per month",
        note: "The growth curve, and the tail at the end",
        sql: `SELECT CAST(DATE_TRUNC('month', order_purchase_timestamp) AS DATE) AS month,
       COUNT(*) AS orders
FROM orders
GROUP BY 1
ORDER BY 1;`,
      },
      {
        title: "Categories in English",
        note: "A lookup table that exists for one reason",
        sql: `SELECT t.product_category_name_english AS category,
       COUNT(DISTINCT p.product_id) AS products
FROM products p
JOIN product_category_translation t
  ON t.product_category_name = p.product_category_name
GROUP BY 1
ORDER BY products DESC
LIMIT 25;`,
      },
      {
        title: "Products with no category",
        note: "Real data has holes",
        sql: `SELECT COUNT(*) AS products_total,
       COUNT(product_category_name) AS with_category,
       COUNT(*) - COUNT(product_category_name) AS missing_category
FROM products;`,
      },
    ],
  },
  {
    group: "Delivery performance",
    blurb: "The reason this dataset is worth using: real dates.",
    items: [
      {
        title: "How late is late",
        note: "Promised date versus actual date",
        sql: `SELECT order_id,
       CAST(order_purchase_timestamp AS DATE)      AS purchased,
       CAST(order_estimated_delivery_date AS DATE) AS promised,
       CAST(order_delivered_customer_date AS DATE) AS delivered,
       DATE_DIFF('day', order_estimated_delivery_date, order_delivered_customer_date) AS days_late
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
  AND order_delivered_customer_date > order_estimated_delivery_date
ORDER BY days_late DESC
LIMIT 25;`,
        only: "duckdb",
      },
      {
        title: "How late is late",
        note: "Promised date versus actual date",
        sql: `SELECT order_id,
       order_purchase_timestamp::date      AS purchased,
       order_estimated_delivery_date::date AS promised,
       order_delivered_customer_date::date AS delivered,
       DATE_PART('day', order_delivered_customer_date - order_estimated_delivery_date) AS days_late
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
  AND order_delivered_customer_date > order_estimated_delivery_date
ORDER BY days_late DESC
LIMIT 25;`,
        only: "postgres",
      },
      {
        title: "On-time rate by state",
        note: "Aggregate a boolean into a percentage",
        sql: `SELECT c.customer_state,
       COUNT(*) AS delivered_orders,
       SUM(CASE WHEN o.order_delivered_customer_date
                     <= o.order_estimated_delivery_date THEN 1 ELSE 0 END) AS on_time,
       ROUND(100.0 * SUM(CASE WHEN o.order_delivered_customer_date
                                   <= o.order_estimated_delivery_date THEN 1 ELSE 0 END)
             / COUNT(*), 1) AS on_time_pct
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY c.customer_state
HAVING COUNT(*) > 200
ORDER BY on_time_pct;`,
      },
      {
        title: "Does lateness cost you a star",
        note: "Join delivery facts to review scores",
        sql: `SELECT CASE
         WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date THEN 'on time'
         ELSE 'late'
       END AS delivery,
       COUNT(*)                     AS reviews,
       ROUND(AVG(r.review_score), 2) AS avg_score,
       ROUND(100.0 * SUM(CASE WHEN r.review_score = 1 THEN 1 ELSE 0 END) / COUNT(*), 1) AS one_star_pct
FROM orders o
JOIN order_reviews r ON r.order_id = o.order_id
WHERE o.order_delivered_customer_date IS NOT NULL
GROUP BY 1
ORDER BY avg_score DESC;`,
      },
      {
        title: "Where the time actually goes",
        note: "Split the journey into three legs",
        sql: `SELECT COUNT(*) AS orders,
       ROUND(AVG(EXTRACT(epoch FROM (order_approved_at - order_purchase_timestamp)) / 3600.0), 1)
         AS hours_to_approve,
       ROUND(AVG(EXTRACT(epoch FROM (order_delivered_carrier_date - order_approved_at)) / 86400.0), 1)
         AS days_to_carrier,
       ROUND(AVG(EXTRACT(epoch FROM (order_delivered_customer_date - order_delivered_carrier_date)) / 86400.0), 1)
         AS days_in_transit
FROM orders
WHERE order_delivered_customer_date IS NOT NULL
  AND order_delivered_carrier_date IS NOT NULL
  AND order_approved_at IS NOT NULL;`,
      },
    ],
  },
  {
    group: "Money and sellers",
    blurb: "Freight, instalments and the long tail of sellers.",
    items: [
      {
        title: "Payment methods",
        note: "Brazilian instalment culture in one table",
        sql: `SELECT payment_type,
       COUNT(*)                          AS payments,
       ROUND(AVG(payment_installments), 2) AS avg_installments,
       ROUND(AVG(payment_value), 2)      AS avg_value,
       ROUND(SUM(payment_value), 2)      AS total
FROM order_payments
GROUP BY payment_type
ORDER BY total DESC;`,
      },
      {
        title: "Freight as a share of price",
        note: "Shipping economics by category",
        sql: `SELECT t.product_category_name_english AS category,
       COUNT(*)                            AS items,
       ROUND(AVG(oi.price), 2)             AS avg_price,
       ROUND(AVG(oi.freight_value), 2)     AS avg_freight,
       ROUND(100.0 * SUM(oi.freight_value) / NULLIF(SUM(oi.price), 0), 1) AS freight_pct
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
JOIN product_category_translation t
  ON t.product_category_name = p.product_category_name
GROUP BY 1
HAVING COUNT(*) > 500
ORDER BY freight_pct DESC
LIMIT 25;`,
      },
      {
        title: "Seller concentration",
        note: "A running share reveals the Pareto curve",
        sql: `WITH seller_revenue AS (
  SELECT seller_id, SUM(price) AS revenue
  FROM order_items
  GROUP BY seller_id
),
ranked AS (
  SELECT seller_id,
         revenue,
         ROW_NUMBER() OVER (ORDER BY revenue DESC) AS rn,
         SUM(revenue) OVER (ORDER BY revenue DESC
                            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running,
         SUM(revenue) OVER () AS total
  FROM seller_revenue
)
SELECT rn AS seller_rank,
       ROUND(revenue, 2) AS revenue,
       ROUND(100.0 * running / total, 2) AS cumulative_pct
FROM ranked
WHERE rn <= 25
ORDER BY rn;`,
      },
      {
        title: "Repeat customers",
        note: "customer_id is per order; customer_unique_id is the person",
        sql: `-- A trap in this dataset: customer_id changes every order.
-- customer_unique_id is the one that identifies a human being.
SELECT order_count,
       COUNT(*) AS people
FROM (
  SELECT c.customer_unique_id, COUNT(DISTINCT o.order_id) AS order_count
  FROM customers c
  JOIN orders o ON o.customer_id = c.customer_id
  GROUP BY c.customer_unique_id
) per_person
GROUP BY order_count
ORDER BY order_count
LIMIT 15;`,
      },
    ],
  },
  {
    group: "Reviews",
    blurb: "Free text, mostly empty, occasionally furious.",
    items: [
      {
        title: "Score distribution",
        note: "The J-shaped curve every review system has",
        sql: `SELECT review_score,
       COUNT(*) AS reviews,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct,
       COUNT(review_comment_message) AS with_comment
FROM order_reviews
GROUP BY review_score
ORDER BY review_score;`,
      },
      {
        title: "Worst-reviewed categories",
        note: "Four joins to connect a review to a category",
        sql: `SELECT t.product_category_name_english AS category,
       COUNT(*)                            AS reviews,
       ROUND(AVG(r.review_score), 2)       AS avg_score
FROM order_reviews r
JOIN orders o     ON o.order_id = r.order_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p   ON p.product_id = oi.product_id
JOIN product_category_translation t
  ON t.product_category_name = p.product_category_name
GROUP BY 1
HAVING COUNT(*) > 300
ORDER BY avg_score
LIMIT 20;`,
      },
      {
        title: "How fast do they answer",
        note: "Two timestamps on the same row",
        sql: `SELECT review_score,
       COUNT(*) AS reviews,
       ROUND(AVG(EXTRACT(epoch FROM (review_answer_timestamp - review_creation_date)) / 3600.0), 1)
         AS avg_hours_to_answer
FROM order_reviews
GROUP BY review_score
ORDER BY review_score;`,
      },
    ],
  },
  {
    group: "PostgreSQL dialect",
    blurb: "Row-store syntax on 100k orders.",
    items: [
      {
        title: "DISTINCT ON: first order per person",
        note: "One row per customer_unique_id",
        only: "postgres",
        sql: `SELECT DISTINCT ON (c.customer_unique_id)
       c.customer_unique_id,
       o.order_id,
       o.order_purchase_timestamp,
       o.order_status
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
ORDER BY c.customer_unique_id, o.order_purchase_timestamp
LIMIT 30;`,
      },
      {
        title: "FILTER instead of CASE",
        note: "Cleaner conditional aggregation",
        only: "postgres",
        sql: `SELECT c.customer_state,
       COUNT(*)                                            AS orders,
       COUNT(*) FILTER (WHERE o.order_status = 'delivered') AS delivered,
       COUNT(*) FILTER (WHERE o.order_status = 'canceled')  AS canceled,
       ROUND(AVG(EXTRACT(epoch FROM (o.order_delivered_customer_date
                                     - o.order_purchase_timestamp)) / 86400.0)
             FILTER (WHERE o.order_delivered_customer_date IS NOT NULL), 1) AS avg_days
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.customer_state
HAVING COUNT(*) > 500
ORDER BY orders DESC;`,
      },
      {
        title: "width_bucket makes a histogram",
        note: "Bucket order values without a CASE ladder",
        only: "postgres",
        sql: `SELECT width_bucket(price, 0, 500, 10) AS bucket,
       ROUND(MIN(price), 2) AS from_price,
       ROUND(MAX(price), 2) AS to_price,
       COUNT(*)             AS items
FROM order_items
WHERE price <= 500
GROUP BY bucket
ORDER BY bucket;`,
      },
      {
        title: "Text search on Portuguese reviews",
        note: "ILIKE and a Portuguese text config",
        only: "postgres",
        sql: `SELECT review_score, review_comment_title, LEFT(review_comment_message, 90) AS comment
FROM order_reviews
WHERE review_comment_message IS NOT NULL
  AND to_tsvector('portuguese', review_comment_message)
      @@ to_tsquery('portuguese', 'atraso | atrasado')
ORDER BY review_score
LIMIT 25;`,
      },
    ],
  },
  {
    group: "DuckDB dialect",
    blurb: "Column-store syntax, and it will scan 100k orders without blinking.",
    items: [
      {
        title: "SUMMARIZE the orders table",
        note: "Nulls, ranges and cardinality in one go",
        only: "duckdb",
        sql: `SUMMARIZE orders;`,
      },
      {
        title: "QUALIFY: biggest order per state",
        note: "Window filter, no subquery",
        only: "duckdb",
        sql: `SELECT c.customer_state, o.order_id, ROUND(SUM(oi.price), 2) AS order_value
FROM orders o
JOIN customers c    ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_state, o.order_id
QUALIFY ROW_NUMBER() OVER (PARTITION BY c.customer_state ORDER BY SUM(oi.price) DESC) = 1
ORDER BY order_value DESC;`,
      },
      {
        title: "PIVOT review scores by year",
        note: "Scores across, years down",
        only: "duckdb",
        sql: `PIVOT (
  SELECT EXTRACT(year FROM o.order_purchase_timestamp) AS yr,
         r.review_score
  FROM order_reviews r
  JOIN orders o ON o.order_id = r.order_id
)
ON review_score
USING COUNT(*)
GROUP BY yr
ORDER BY yr;`,
      },
      {
        title: "ASOF join: price at time of order",
        note: "Match on nearest timestamp, not exact equality",
        only: "duckdb",
        sql: `-- ASOF answers "what was true at that moment", which a normal
-- equi-join cannot express without a correlated subquery.
WITH price_points AS (
  SELECT product_id, shipping_limit_date AS at, price
  FROM order_items
)
SELECT o.order_id,
       o.order_purchase_timestamp,
       pp.price AS nearest_earlier_price
FROM orders o
ASOF JOIN price_points pp
  ON pp.at <= o.order_purchase_timestamp
ORDER BY o.order_purchase_timestamp
LIMIT 20;`,
      },
      {
        title: "Reusable aliases and list aggregation",
        note: "Two DuckDB conveniences at once",
        only: "duckdb",
        sql: `SELECT c.customer_state,
       COUNT(*)                          AS orders,
       ROUND(SUM(oi.price), 2)           AS revenue,
       revenue / orders                  AS avg_order_value,
       list_sort(list_distinct(list(o.order_status))) AS statuses_seen
FROM orders o
JOIN customers c    ON c.customer_id = o.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY c.customer_state
ORDER BY revenue DESC
LIMIT 15;`,
      },
    ],
  },
];
