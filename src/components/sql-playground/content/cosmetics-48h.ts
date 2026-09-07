import type { ExampleGroup } from "./types";

/** Supplied source CSV, retained without column or row removal. */
export const COSMETICS_48H_EXAMPLES: ExampleGroup[] = [
  {
    group: "48-hour event slice",
    blurb: "Cosmetics Shop activity from 1–3 January 2020 (UTC).",
    items: [
      {
        title: "48-hour event slice",
        note: "Inspect the supplied event stream in its original chronological order.",
        sql: `SELECT timestamp, event_type, product_id, category_code, brand,
       price, user_id, user_session
FROM events
ORDER BY timestamp
LIMIT 100;`,
      },
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
        title: "Users with the most purchase activity",
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
      {
        title: "Session conversion rate",
        note: "Measure the share of sessions with a view that also recorded a purchase.",
        sql: `WITH session_outcomes AS (
  SELECT user_session,
         MAX(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS viewed,
         MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS purchased
  FROM events
  WHERE user_session IS NOT NULL
  GROUP BY user_session
)
SELECT COUNT(*) FILTER (WHERE viewed = 1) AS view_sessions,
       COUNT(*) FILTER (WHERE viewed = 1 AND purchased = 1) AS purchasing_view_sessions,
       ROUND(
         100.0 * COUNT(*) FILTER (WHERE viewed = 1 AND purchased = 1)
         / NULLIF(COUNT(*) FILTER (WHERE viewed = 1), 0),
         2
       ) AS view_to_purchase_pct
FROM session_outcomes;`,
      },
    ],
  },
  {
    group: "Event sequences",
    blurb: "Window functions expose the actions and timing inside each supplied session.",
    items: [
      {
        title: "Previous event in a session",
        note: "Use LAG() to see the action immediately before each event.",
        sql: `WITH sequenced_events AS (
  SELECT user_session,
         timestamp,
         event_type,
         product_id,
         LAG(event_type) OVER (
           PARTITION BY user_session
           ORDER BY timestamp
         ) AS previous_event_type
  FROM events
  WHERE user_session IS NOT NULL
)
SELECT user_session, timestamp, previous_event_type, event_type, product_id
FROM sequenced_events
WHERE previous_event_type IS NOT NULL
ORDER BY user_session, timestamp
LIMIT 100;`,
      },
      {
        title: "Time between events",
        note: "Measure the whole-second gap between consecutive events within a session.",
        only: "duckdb",
        sql: `WITH sequenced_events AS (
  SELECT user_session,
         timestamp,
         event_type,
         LAG(timestamp) OVER (
           PARTITION BY user_session
           ORDER BY timestamp
         ) AS previous_timestamp
  FROM events
  WHERE user_session IS NOT NULL
)
SELECT user_session,
       previous_timestamp,
       timestamp,
       event_type,
       DATEDIFF('second', previous_timestamp, timestamp) AS seconds_since_previous_event
FROM sequenced_events
WHERE previous_timestamp IS NOT NULL
ORDER BY user_session, timestamp
LIMIT 100;`,
      },
      {
        title: "Time between events",
        note: "Measure the whole-second gap between consecutive events within a session.",
        only: "postgres",
        sql: `WITH sequenced_events AS (
  SELECT user_session,
         timestamp,
         event_type,
         LAG(timestamp) OVER (
           PARTITION BY user_session
           ORDER BY timestamp
         ) AS previous_timestamp
  FROM events
  WHERE user_session IS NOT NULL
)
SELECT user_session,
       previous_timestamp,
       timestamp,
       event_type,
       ROUND(EXTRACT(EPOCH FROM timestamp - previous_timestamp), 2) AS seconds_since_previous_event
FROM sequenced_events
WHERE previous_timestamp IS NOT NULL
ORDER BY user_session, timestamp
LIMIT 100;`,
      },
    ],
  },
  {
    group: "Funnels",
    blurb: "Treat a session as a short behavioral journey, without overstating this 48-hour slice as a long-term customer lifecycle.",
    items: [
      {
        title: "Add-to-cart conversion",
        note: "At the session-product level, measure how often a viewed product reached a cart.",
        sql: `WITH session_product_events AS (
  SELECT user_session,
         product_id,
         MAX(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS viewed,
         MAX(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carted
  FROM events
  WHERE user_session IS NOT NULL
  GROUP BY user_session, product_id
)
SELECT COUNT(*) FILTER (WHERE viewed = 1) AS viewed_session_products,
       COUNT(*) FILTER (WHERE viewed = 1 AND carted = 1) AS carted_session_products,
       ROUND(
         100.0 * COUNT(*) FILTER (WHERE viewed = 1 AND carted = 1)
         / NULLIF(COUNT(*) FILTER (WHERE viewed = 1), 0),
         2
       ) AS view_to_cart_pct
FROM session_product_events;`,
      },
      {
        title: "Purchase funnel",
        note: "Build a simple view → cart → purchase funnel from session-level behavior.",
        sql: `WITH session_steps AS (
  SELECT user_session,
         MAX(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END) AS viewed,
         MAX(CASE WHEN event_type = 'cart' THEN 1 ELSE 0 END) AS carted,
         MAX(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS purchased
  FROM events
  WHERE user_session IS NOT NULL
  GROUP BY user_session
),
funnel AS (
  SELECT COUNT(*) FILTER (WHERE viewed = 1) AS viewed_sessions,
         COUNT(*) FILTER (WHERE viewed = 1 AND carted = 1) AS carted_sessions,
         COUNT(*) FILTER (WHERE viewed = 1 AND carted = 1 AND purchased = 1) AS purchased_sessions
  FROM session_steps
)
SELECT 'viewed' AS stage,
       viewed_sessions AS sessions,
       100.00 AS pct_of_view_sessions
FROM funnel
UNION ALL
SELECT 'carted',
       carted_sessions,
       ROUND(100.0 * carted_sessions / NULLIF(viewed_sessions, 0), 2)
FROM funnel
UNION ALL
SELECT 'purchased',
       purchased_sessions,
       ROUND(100.0 * purchased_sessions / NULLIF(viewed_sessions, 0), 2)
FROM funnel;`,
      },
    ],
  },
];
