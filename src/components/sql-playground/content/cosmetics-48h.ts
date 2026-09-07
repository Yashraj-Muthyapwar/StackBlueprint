import type { ExampleGroup } from "./types";

/** Supplied source CSV, retained without column or row removal. */
export const COSMETICS_48H_EXAMPLES: ExampleGroup[] = [
  {
    group: "48-hour event slice",
    blurb: "Cosmetics Shop activity from 1–3 January 2020 (UTC).",
    items: [
      {
        title: "Events by behavior",
        note: "Views, carts, removals, and purchases in this 48-hour slice",
        sql: `SELECT event_type,
       COUNT(*) AS events,
       ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct_of_events
FROM events
GROUP BY event_type
ORDER BY events DESC;`,
      },
      {
        title: "Hourly activity",
        note: "The exact source timestamp is in UTC",
        only: "duckdb",
        sql: `SELECT DATE_TRUNC('hour', timestamp) AS hour_utc,
       event_type,
       COUNT(*) AS events
FROM events
GROUP BY hour_utc, event_type
ORDER BY hour_utc, event_type;`,
      },
      {
        title: "Hourly activity",
        note: "The exact source timestamp is in UTC",
        only: "postgres",
        sql: `SELECT DATE_TRUNC('hour', timestamp) AS hour_utc,
       event_type,
       COUNT(*) AS events
FROM events
GROUP BY hour_utc, event_type
ORDER BY hour_utc, event_type;`,
      },
    ],
  },
  {
    group: "Products and brands",
    blurb: "Products can be explored directly because every event keeps its original product and category columns.",
    items: [
      {
        title: "Most-viewed brands",
        note: "Missing brand values remain NULL from the source CSV",
        sql: `SELECT brand,
       COUNT(*) AS views,
       COUNT(DISTINCT product_id) AS products_viewed,
       ROUND(AVG(price), 2) AS avg_price
FROM events
WHERE event_type = 'view'
  AND brand IS NOT NULL
GROUP BY brand
ORDER BY views DESC, brand
LIMIT 30;`,
      },
      {
        title: "Products that reached a cart",
        note: "Compare products with views and cart additions",
        sql: `SELECT product_id,
       MAX(brand) AS brand,
       MAX(category_code) AS category_code,
       COUNT(*) FILTER (WHERE event_type = 'view') AS views,
       COUNT(*) FILTER (WHERE event_type = 'cart') AS carts,
       COUNT(*) FILTER (WHERE event_type = 'purchase') AS purchases
FROM events
GROUP BY product_id
HAVING COUNT(*) FILTER (WHERE event_type = 'cart') > 0
ORDER BY carts DESC, views DESC
LIMIT 30;`,
      },
      {
        title: "Price by event behavior",
        note: "The price is the original event-level product price",
        sql: `SELECT event_type,
       COUNT(*) AS events,
       ROUND(AVG(price), 2) AS avg_price,
       ROUND(MIN(price), 2) AS min_price,
       ROUND(MAX(price), 2) AS max_price
FROM events
GROUP BY event_type
ORDER BY events DESC;`,
      },
    ],
  },
  {
    group: "Sessions",
    blurb: "The dataset treats user_session as a temporary session identifier and user_id as the permanent user identifier.",
    items: [
      {
        title: "Session behavior mix",
        note: "Aggregate each supplied session before counting its events",
        sql: `WITH session_events AS (
  SELECT user_session,
         MAX(user_id) AS user_id,
         COUNT(*) AS events,
         SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS views,
         SUM(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carts,
         SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases
  FROM events
  GROUP BY user_session
)
SELECT CASE
         WHEN purchases > 0 THEN 'purchased'
         WHEN carts > 0 THEN 'carted only'
         ELSE 'viewed only'
       END AS session_outcome,
       COUNT(*) AS sessions,
       ROUND(AVG(events), 2) AS avg_events
FROM session_events
GROUP BY session_outcome
ORDER BY sessions DESC;`,
      },
      {
        title: "Highest purchase activity by user",
        note: "A 48-hour view, not a long-term customer history",
        sql: `SELECT user_id,
       COUNT(*) AS purchase_events,
       COUNT(DISTINCT user_session) AS sessions,
       ROUND(SUM(price), 2) AS event_value
FROM events
WHERE event_type = 'purchase'
GROUP BY user_id
ORDER BY event_value DESC, purchase_events DESC
LIMIT 30;`,
      },
    ],
  },
];
