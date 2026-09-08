import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";

export interface PlaygroundPractice {
  id: string;
  title: string;
  prompt: string;
  dataset: DatasetId;
  engine: Engine;
  /** When present, loading this lesson exercise enables checked Challenge Mode. */
  challengeId?: string;
  starterSql: string;
}

/**
 * Short, trusted exercises launched from SQL lessons. IDs, rather than raw SQL
 * in the URL, keep links compact and make every launchable exercise reviewable.
 */
const PRACTICES: Record<string, PlaygroundPractice> = {
  "cycledepot-safely-cast-product-ids": {
    id: "cycledepot-safely-cast-product-ids",
    title: "Safely cast incoming Cycle Depot product IDs",
    prompt:
      "Use the supplied query-local incoming_product_ids CTE with values '1', '3', '', and 'bike-7'. Return exactly raw_product_id and safe_product_id. Use CASE with raw_product_id ~ '^[0-9]+$' so only valid values are cast with raw_product_id::integer. Order by raw_product_id. The result should have four rows and exactly two columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-safely-cast-product-ids",
    starterSql: `-- Safely cast incoming Cycle Depot product IDs.
-- Use a CTE with '1', '3', '', and 'bike-7'.
-- Return raw_product_id and safe_product_id with CASE plus ^[0-9]+$.
-- Cast only valid values to integer, order by raw_product_id, then run and check.`,
  },
  "cycledepot-use-implicit-coercion": {
    id: "cycledepot-use-implicit-coercion",
    title: "Use context for a Cycle Depot sale lookup",
    prompt:
      "Return id, name, price, and sale_price for the Cycle Depot product found with WHERE id = '3'. Calculate price * 0.875 AS sale_price and sort by id. The result should have one row and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-use-implicit-coercion",
    starterSql: `-- Cycle Depot context-driven sale lookup.
-- Return id, name, price, and sale_price from products.
-- Find the row with WHERE id = '3'. Use price * 0.875 AS sale_price.
-- Sort by id, then run and check.`,
  },
  "cycledepot-convert-signup-dates": {
    id: "cycledepot-convert-signup-dates",
    title: "Create PostgreSQL signup-date text",
    prompt:
      "Return every Cycle Depot customer's id, name, signup_text, and signup_month. Use CAST(signup_date AS text) AS signup_text and TO_CHAR(signup_date, 'YYYY-MM') AS signup_month. Sort by id. The result should have 60 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-convert-signup-dates",
    starterSql: `-- Cycle Depot PostgreSQL date text.
-- Return id, name, signup_text, and signup_month from customers.
-- Use CAST(signup_date AS text) and TO_CHAR(signup_date, 'YYYY-MM').
-- Sort by id, then run and check.`,
  },
  "cycledepot-format-product-identifiers": {
    id: "cycledepot-format-product-identifiers",
    title: "Create Cycle Depot text IDs and price labels",
    prompt:
      "Return every Cycle Depot product's id, name, product_id_text, and price_label. Use CAST(id AS text) AS product_id_text and TO_CHAR(price, 'FM$9,999.00') AS price_label. Sort by id. The result should have 30 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-format-product-identifiers",
    starterSql: `-- Cycle Depot text IDs and price labels.
-- Return id, name, product_id_text, and price_label from products.
-- Use CAST(id AS text) and TO_CHAR(price, 'FM$9,999.00').
-- Sort by id, then run and check.`,
  },
  "cycledepot-shape-sale-prices": {
    id: "cycledepot-shape-sale-prices",
    title: "Shape Cycle Depot sale prices",
    prompt:
      "Return every Cycle Depot product's name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale. Use price * 0.875 as the sale calculation, ROUND and TRUNC to two decimal places, then CEIL and FLOOR to whole numbers. Sort by id. The result should have 30 rows and exactly six columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-shape-sale-prices",
    starterSql: `-- Cycle Depot sale-price shapes.
-- Return name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale.
-- Use price * 0.875, then ROUND / TRUNC to 2 decimals and CEIL / FLOOR to integers.
-- Sort by id, then run and check.`,
  },
  "cycledepot-compare-product-values": {
    id: "cycledepot-compare-product-values",
    title: "Compare Cycle Depot product values",
    prompt:
      "Return every Cycle Depot product's name, price, cost, target_gap, target_direction, lower_amount, and higher_amount. Measure the gap from 150.00 with ABS(price - 150.00), label it with SIGN(price - 150.00), and use LEAST(price, cost) plus GREATEST(price, cost). Sort by id. The result should have 30 rows and exactly seven columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-compare-product-values",
    starterSql: `-- Cycle Depot product-value comparisons.
-- Return name, price, cost, target_gap, target_direction, lower_amount, and higher_amount.
-- Use ABS and SIGN against 150.00, then LEAST and GREATEST for price and cost.
-- Sort by id, then run and check.`,
  },
  "cycledepot-route-products-by-remainder": {
    id: "cycledepot-route-products-by-remainder",
    title: "Route Cycle Depot products by remainder",
    prompt:
      "Return every Cycle Depot product's id, name, parity_remainder, and pickup_wave. Use id % 2 AS parity_remainder and MOD(id, 3) AS pickup_wave. Sort by id. The result should have 30 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-route-products-by-remainder",
    starterSql: `-- Cycle Depot product routing.
-- Return id, name, parity_remainder, and pickup_wave from products.
-- Use id % 2 for parity and MOD(id, 3) for the pickup wave.
-- Sort by id, then run and check.`,
  },
  "cycledepot-model-product-scales": {
    id: "cycledepot-model-product-scales",
    title: "Model Cycle Depot product scales",
    prompt:
      "Return every Cycle Depot product's name, price, price_index_squared, price_root, growth_factor, and log10_price_scale. Use ROUND(POWER(price / 100.0, 2), 4), ROUND(SQRT(price)::numeric, 3), ROUND(EXP((id % 3)::numeric), 3), and ROUND(LOG(price / 100.0), 3). Sort by id. The result should have 30 rows and exactly six columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-model-product-scales",
    starterSql: `-- Cycle Depot product scales.
-- Return name, price, price_index_squared, price_root, growth_factor, and log10_price_scale.
-- Use POWER, SQRT, EXP, and LOG with the requested rounding.
-- Sort by id, then run and check.`,
  },
  "cycledepot-assign-random-promo-groups": {
    id: "cycledepot-assign-random-promo-groups",
    title: "Assign random Cycle Depot promo groups",
    prompt:
      "Return every Cycle Depot product's name and promo_group. Use FLOOR(RANDOM() * 6 + 1)::int AS promo_group to create a whole number from 1 through 6. Sort the source rows by id. The result should have 30 rows and exactly two columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-assign-random-promo-groups",
    starterSql: `-- Cycle Depot random promo groups.
-- Return name and promo_group from products.
-- Use FLOOR(RANDOM() * 6 + 1)::int AS promo_group.
-- Sort the source rows by id, then run and check.`,
  },
  "cycledepot-safe-product-margins": {
    id: "cycledepot-safe-product-margins",
    title: "Build safe product margin percentages",
    prompt:
      "Return every Cycle Depot product's name, price, cost, and margin_pct. Calculate 100.0 * (price - cost) / NULLIF(price, 0), round to one decimal place, and use COALESCE(..., 0.0) as the fallback. Sort by id. The result should have 30 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-safe-product-margins",
    starterSql: `-- Cycle Depot safe product margins.
-- Return name, price, cost, and margin_pct from products.
-- Protect the price denominator with NULLIF(price, 0).
-- Round to one decimal and use COALESCE(..., 0.0) for the fallback.
-- Sort by id, then run and check.`,
  },
  "cycledepot-product-model-numbers": {
    id: "cycledepot-product-model-numbers",
    title: "Extract product model numbers",
    prompt:
      "Return every Cycle Depot product name containing a number, plus model_number. Use REGEXP_LIKE(name, '[0-9]+') to filter and REGEXP_SUBSTR(name, '[0-9]+') AS model_number to extract the first digit run. Sort by id. The result should have 5 rows and exactly two columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-product-model-numbers",
    starterSql: `-- Cycle Depot product model numbers.
-- Return name and model_number from products that contain digits.
-- Use REGEXP_LIKE to filter and REGEXP_SUBSTR to extract.
-- Sort by id, then run and check.`,
  },
  "cycledepot-customer-email-parts": {
    id: "cycledepot-customer-email-parts",
    title: "Extract customer email parts",
    prompt:
      "Return every Cycle Depot customer's email, at_position, email_local, and email_domain. Use POSITION('@' IN email), SPLIT_PART(email, '@', 1), and SPLIT_PART(email, '@', 2). Sort by id. The result should have 60 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-email-parts",
    starterSql: `-- Cycle Depot customer email parts.
-- Return email, at_position, email_local, and email_domain from customers.
-- Use POSITION and SPLIT_PART with the @ delimiter.
-- Sort by id, then run and check.`,
  },
  "cycledepot-clean-product-keys": {
    id: "cycledepot-clean-product-keys",
    title: "Create clean product keys with BTRIM",
    prompt:
      "Return every Cycle Depot product's name, left_trimmed, right_trimmed, marker_trimmed, and product_key. Add one edge space on each side with CONCAT(' ', name, ' '), use LTRIM and RTRIM inside pipes for the directional results, use BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed, then use TRIM and REPLACE to create product_key. Sort by id. The result should have 30 rows and exactly five columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-clean-product-keys",
    starterSql: `-- Cycle Depot clean product keys.
-- Return name, left_trimmed, right_trimmed, marker_trimmed, and product_key from products.
-- Use LTRIM and RTRIM inside pipes to show the remaining edge spaces.
-- Use BTRIM to remove --- markers, then TRIM and REPLACE to make a clean hyphenated key.
-- Sort by id, then run and check.`,
  },
  "cycledepot-product-case-labels": {
    id: "cycledepot-product-case-labels",
    title: "Create product case labels",
    prompt:
      "Return every Cycle Depot product's name, category, category_upper, category_lower, and name_title. Use UPPER(category), LOWER(category), and INITCAP(LOWER(name)). Sort by id. The result should have 30 rows and exactly five columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-product-case-labels",
    starterSql: `-- Cycle Depot product case labels.
-- Return name, category, category_upper, category_lower, and name_title from products.
-- Use UPPER(category), LOWER(category), and INITCAP(LOWER(name)).
-- Sort by id, then run and check.`,
  },
  "cycledepot-customer-text-summaries": {
    id: "cycledepot-customer-text-summaries",
    title: "Create customer text summaries",
    prompt:
      "Return every Cycle Depot customer's name, name_code, email_domain, and name_characters. Use LEFT(name, 3), RIGHT(email, 11), and CHAR_LENGTH(name). Sort by id. The result should have 60 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-text-summaries",
    starterSql: `-- Cycle Depot customer text summaries.
-- Return name, name_code, email_domain, and name_characters from customers.
-- Use LEFT(name, 3), RIGHT(email, 11), and LENGTH(name).
-- Use CHAR_LENGTH(name) AS name_characters to make the unit explicit.
-- Sort by id, then run and check.`,
  },
  "cycledepot-compact-product-labels": {
    id: "cycledepot-compact-product-labels",
    title: "Build compact product labels",
    prompt:
      "Return every Cycle Depot product's name, category, and compact_label. Use SUBSTRING(name FROM 1 FOR 5), then CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category). Name it compact_label and sort by id. The result should have 30 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-compact-product-labels",
    starterSql: `-- Cycle Depot compact product labels.
-- Return name, category, and compact_label from products.
-- Use the first five characters of name, then join them to category with ' - '.
-- Use CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) for compact_label.
-- Sort by id, then run and check.`,
  },
  "cycledepot-customer-projection": {
    id: "cycledepot-customer-projection",
    title: "Build a customer directory",
    prompt:
      "Return every customer's id, name, and country. Rename name to customer_name. The result should have 60 rows and the columns id, customer_name, and country.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-directory",
    starterSql: `-- Cycle Depot practice: build a customer directory.
-- Return id, name as customer_name, and country from customers.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-product-price-with-tax": {
    id: "cycledepot-product-price-with-tax",
    title: "Preview product prices with tax",
    prompt:
      "Return every product's name and price. Calculate price * 1.08 and name the result price_with_tax. The result should have 30 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-product-price-with-tax",
    starterSql: `-- Cycle Depot price preview.
-- Return name, price, and price * 1.08 AS price_with_tax from products.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-ready-to-sell-premium-products": {
    id: "cycledepot-ready-to-sell-premium-products",
    title: "Find ready-to-sell premium products",
    prompt:
      "Return name, price, and in_stock for products priced at least 2000 with at least 50 units in stock. The result should have 4 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-ready-to-sell-premium-products",
    starterSql: `-- Cycle Depot inventory check.
-- Return name, price, and in_stock for products that meet both requirements.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-featured-products-logic": {
    id: "cycledepot-featured-products-logic",
    title: "Build a featured product list",
    prompt:
      "Return name, category, price, and in_stock for Road Bikes with at least 90 units in stock, or non-Road Bikes priced at least 4000. Use AND, OR, NOT, and parentheses. The result should have 3 rows and exactly four columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-featured-products-logic",
    starterSql: `-- Cycle Depot featured products.
-- Return name, category, price, and in_stock for either qualifying group.
-- Use parentheses to keep each group easy to read.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-premium-bike-range": {
    id: "cycledepot-premium-bike-range",
    title: "Build a premium bike range",
    prompt:
      "Return name, category, and price for Road, Mountain, or City Bikes priced from 2000 through 4000, but exclude City Bikes. Use IN, NOT IN, and BETWEEN. The result should have 3 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-premium-bike-range",
    starterSql: `-- Cycle Depot premium bike range.
-- Return name, category, and price for the qualifying products.
-- Use IN, NOT IN, and BETWEEN in the WHERE clause.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-road-product-search": {
    id: "cycledepot-road-product-search",
    title: "Search the Road product catalog",
    prompt:
      "Return name and category for product names containing road without letter-case sensitivity, but exclude any name containing Helmet. Use ILIKE and NOT LIKE. The result should have 2 rows and exactly two columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-road-product-search",
    starterSql: `-- Cycle Depot product search.
-- Return name and category for Road product names, excluding helmets.
-- Use ILIKE and NOT LIKE, then order by id.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-customers-without-city": {
    id: "cycledepot-customers-without-city",
    title: "Find customers without a city",
    prompt:
      "Return id, name, and email for customers whose city is missing. Use IS NULL, not = NULL. The result should have 5 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customers-without-city",
    starterSql: `-- Cycle Depot data-quality check.
-- Return id, name, and email for customers whose city is missing.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-product-price-bands": {
    id: "cycledepot-product-price-bands",
    title: "Classify Cycle Depot products",
    prompt:
      "Return every product's name, price, and price_band. Label prices below 1000 as Budget, prices below 2500 as Mid-range, and all remaining prices as Premium. Sort by price, then name. The result should have 30 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-product-price-bands",
    starterSql: `-- Cycle Depot product labels.
-- Return name, price, and a CASE expression named price_band from products.
-- Budget: below 1000. Mid-range: below 2500. Premium: everything else.
-- Sort by price, then name. Write your query below, then choose Run and check.`,
  },
  "cycledepot-march-order-range": {
    id: "cycledepot-march-order-range",
    title: "Find March orders with a date range",
    prompt:
      "Return id, customer_id, and order_date for orders placed in March 2024. Use an inclusive March 1 start and an exclusive April 1 finish. Sort by order_date, then id. The result should have 5 rows and exactly three columns.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-march-order-range",
    starterSql: `-- Cycle Depot March order report.
-- Return id, customer_id, and order_date for March 2024.
-- Use >= DATE '2024-03-01' and < DATE '2024-04-01'.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-first-three-countries": {
    id: "cycledepot-first-three-countries",
    title: "Build a short country list",
    prompt:
      "Return each customer country once, sort the result alphabetically, and keep the first three. The result should have exactly 3 rows and one column named country.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-first-three-countries",
    starterSql: `-- Cycle Depot country picker.
-- Return each customer country once, alphabetically, and keep the first three.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-road-bike-shortlist": {
    id: "cycledepot-road-bike-shortlist",
    title: "Build a Road Bike shortlist",
    prompt:
      "Return the name and price of Road Bikes only, sorted from the highest price to the lowest. Keep the first 3 rows. The result should have exactly 3 rows and two columns: name and price.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-road-bike-shortlist",
    starterSql: `-- Cycle Depot Road Bike shortlist.
-- Return name and price for Road Bikes, highest price first, keeping 3 rows.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-customer-coverage-summary": {
    id: "cycledepot-customer-coverage-summary",
    title: "Build a customer coverage summary",
    prompt:
      "Return one summary row with the customer count, the count of customers with a city, and the number of distinct countries. Use COUNT(*), COUNT(city), and COUNT(DISTINCT country). The three columns must be customer_count, customers_with_city, and country_count.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-coverage-summary",
    starterSql: `-- Cycle Depot customer coverage summary.
-- Return counts for all customers, customers with a city, and distinct countries.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-order-counts-by-status": {
    id: "cycledepot-order-counts-by-status",
    title: "Count orders by status",
    prompt:
      "Return one row for each order status and the number of orders with that status. Select status and COUNT(*) AS order_count, group by status, and sort alphabetically by status.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-order-counts-by-status",
    starterSql: `-- Cycle Depot order-status summary.
-- Return status and COUNT(*) AS order_count from orders.
-- Group by status and order the result by status.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "cycledepot-order-statuses-with-at-least-ten-orders": {
    id: "cycledepot-order-statuses-with-at-least-ten-orders",
    title: "Find active order-status groups",
    prompt:
      "Return each order status with at least 10 Cycle Depot orders. Select status and COUNT(*) AS order_count, group by status, filter the groups with HAVING COUNT(*) >= 10, and sort from largest count to smallest.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-order-statuses-with-at-least-ten-orders",
    starterSql: `-- Cycle Depot active order statuses.
-- Return status and COUNT(*) AS order_count for statuses with at least 10 orders.
-- Group by status, filter with HAVING, then sort largest count first.
-- Write your SELECT query below, then choose Run and check.`,
  },
  "olist-purchase-instants-across-zones": {
    id: "olist-purchase-instants-across-zones",
    title: "Show Olist purchase instants in UTC and New York",
    prompt:
      "From orders, return order_id, order_purchase_timestamp, purchase_utc, and purchase_new_york. Treat the stored wall time as America/Sao_Paulo with AT TIME ZONE, then render it with AT TIME ZONE 'UTC' and AT TIME ZONE 'America/New_York'. Order by order_purchase_timestamp, then order_id, keeping 5 rows.",
    dataset: "olist",
    engine: "postgres",
    challengeId: "olist-purchase-instants-across-zones",
    starterSql: `-- Olist purchase instants across zones.
-- Return order_id, order_purchase_timestamp, purchase_utc, and purchase_new_york.
-- Assign the zone first: order_purchase_timestamp AT TIME ZONE 'America/Sao_Paulo'.
-- Render it twice with AT TIME ZONE 'UTC' and AT TIME ZONE 'America/New_York'.
-- Order by order_purchase_timestamp, then order_id, keeping 5 rows.`,
  },
  "olist-extract-and-format-purchases": {
    id: "olist-extract-and-format-purchases",
    title: "Build Olist purchase reporting fields",
    prompt:
      "From orders, return order_id, order_purchase_timestamp, purchase_year, purchase_hour, and purchase_label. Use EXTRACT(YEAR FROM order_purchase_timestamp), DATE_PART('hour', order_purchase_timestamp), and TO_CHAR(order_purchase_timestamp, 'YYYY-MM-DD HH24:MI'). Order by order_purchase_timestamp, then order_id, keeping 5 rows.",
    dataset: "olist",
    engine: "postgres",
    challengeId: "olist-extract-and-format-purchases",
    starterSql: `-- Olist purchase reporting fields.
-- Return order_id, order_purchase_timestamp, purchase_year, purchase_hour, and purchase_label.
-- Use EXTRACT(YEAR ...), DATE_PART('hour', ...), and TO_CHAR(..., 'YYYY-MM-DD HH24:MI').
-- Order by order_purchase_timestamp, then order_id, keeping 5 rows.`,
  },
  "olist-create-purchase-buckets": {
    id: "olist-create-purchase-buckets",
    title: "Create Olist reporting buckets",
    prompt:
      "From orders, return order_id, order_purchase_timestamp, purchase_day, purchase_month, and purchase_hour_bin. Use DATE_TRUNC('day', ...), DATE_TRUNC('month', ...), and DATE_BIN(INTERVAL '1 hour', order_purchase_timestamp, TIMESTAMP '2000-01-01 00:00:00'). Order by order_purchase_timestamp, then order_id, keeping 5 rows.",
    dataset: "olist",
    engine: "postgres",
    challengeId: "olist-create-purchase-buckets",
    starterSql: `-- Olist purchase reporting buckets.
-- Return order_id, order_purchase_timestamp, purchase_day, purchase_month, and purchase_hour_bin.
-- Use DATE_TRUNC for day and month, then DATE_BIN with a 1-hour interval and 2000-01-01 origin.
-- Order by order_purchase_timestamp, then order_id, keeping 5 rows.`,
  },
  "olist-measure-delivery-days": {
    id: "olist-measure-delivery-days",
    title: "Measure Olist delivery days two ways",
    prompt:
      "For delivered orders, return order_id, order_purchase_timestamp, order_delivered_customer_date, calendar_delivery_days, and elapsed_delivery_days. Use order_delivered_customer_date::date - order_purchase_timestamp::date, and ROUND(EXTRACT(EPOCH FROM order_delivered_customer_date - order_purchase_timestamp) / 86400.0, 2). Order by order_purchase_timestamp, then order_id, keeping 5 rows.",
    dataset: "olist",
    engine: "postgres",
    challengeId: "olist-measure-delivery-days",
    starterSql: `-- Olist delivery duration measures.
-- Return purchase and delivery timestamps plus calendar_delivery_days and elapsed_delivery_days.
-- Use date subtraction for the calendar count and EXTRACT(EPOCH) / 86400.0 rounded to 2 decimals.
-- Keep only delivered rows, ordered by purchase timestamp and order ID, with 5 rows.`,
  },
};

export function getPractice(id: string | null): PlaygroundPractice | null {
  return id ? (PRACTICES[id] ?? null) : null;
}
