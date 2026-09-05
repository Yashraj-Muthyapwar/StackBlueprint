import type { ChallengeDefinition, ChallengeDataset, ChallengeEngine } from "./types";

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "cycle-depot-shape-sale-prices",
    version: 1,
    title: "Shape Cycle Depot sale prices",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Use four numeric functions to present the same 12.5% Cycle Depot sale calculation in the form a report needs.",
    requirements: [
      "Use the products table.",
      "Return exactly name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale.",
      "Use price * 0.875 as the sale calculation.",
      "Use ROUND(price * 0.875, 2) AS rounded_sale.",
      "Use TRUNC(price * 0.875, 2) AS truncated_sale.",
      "Use CEIL(price * 0.875) AS ceiling_sale and FLOOR(price * 0.875) AS floor_sale.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot sale-price shapes.
-- Return name, price, rounded_sale, truncated_sale, ceiling_sale, and floor_sale.
-- Use price * 0.875, then ROUND / TRUNC to 2 decimals and CEIL / FLOOR to integers.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, price FROM products.",
      "Add ROUND(price * 0.875, 2) AS rounded_sale and TRUNC(price * 0.875, 2) AS truncated_sale.",
      "Add CEIL(price * 0.875) AS ceiling_sale and FLOOR(price * 0.875) AS floor_sale, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, ROUND(price * 0.875, 2) AS rounded_sale, TRUNC(price * 0.875, 2) AS truncated_sale, CEIL(price * 0.875) AS ceiling_sale, FLOOR(price * 0.875) AS floor_sale FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, ROUND(price * 0.875, 2) AS rounded_sale, TRUNC(price * 0.875, 2) AS truncated_sale, CEIL(price * 0.875) AS ceiling_sale, FLOOR(price * 0.875) AS floor_sale FROM products ORDER BY id;",
      },
      requiredColumns: [
        "name",
        "price",
        "rounded_sale",
        "truncated_sale",
        "ceiling_sale",
        "floor_sale",
      ],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Sale-price shapes complete",
      body: "Correct. You produced a nearest-cent value, a cut-off value, and the whole-number upper and lower bounds from the same Cycle Depot sale calculation.",
      nextConcept: "NULLIF / COALESCE: Safe Math",
    },
  },
  {
    id: "cycle-depot-compare-product-values",
    version: 1,
    title: "Compare Cycle Depot product values",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Measure a target gap, keep its direction, and choose the lower and higher monetary values for every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, price, cost, target_gap, target_direction, lower_amount, and higher_amount.",
      "Use ABS(price - 150.00) AS target_gap.",
      "Use SIGN(price - 150.00) AS target_direction.",
      "Use LEAST(price, cost) AS lower_amount and GREATEST(price, cost) AS higher_amount.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product-value comparisons.
-- Return name, price, cost, target_gap, target_direction, lower_amount, and higher_amount.
-- Use ABS and SIGN against 150.00, then LEAST and GREATEST for price and cost.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, price, cost FROM products.",
      "Use ABS(price - 150.00) AS target_gap and SIGN(price - 150.00) AS target_direction.",
      "Use LEAST(price, cost) AS lower_amount and GREATEST(price, cost) AS higher_amount, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, cost, ABS(price - 150.00) AS target_gap, SIGN(price - 150.00) AS target_direction, LEAST(price, cost) AS lower_amount, GREATEST(price, cost) AS higher_amount FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, cost, ABS(price - 150.00) AS target_gap, SIGN(price - 150.00) AS target_direction, LEAST(price, cost) AS lower_amount, GREATEST(price, cost) AS higher_amount FROM products ORDER BY id;",
      },
      requiredColumns: [
        "name",
        "price",
        "cost",
        "target_gap",
        "target_direction",
        "lower_amount",
        "higher_amount",
      ],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Product-value comparisons complete",
      body: "Correct. You measured each target gap, kept its direction, and selected the lower and higher values within every product row.",
      nextConcept: "MOD / %: Remainder & Parity",
    },
  },
  {
    id: "cycle-depot-route-products-by-remainder",
    version: 1,
    title: "Route Cycle Depot products by remainder",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Use remainder arithmetic to label every Cycle Depot product by parity and a repeating three-wave route.",
    requirements: [
      "Use the products table.",
      "Return exactly id, name, parity_remainder, and pickup_wave.",
      "Use id % 2 AS parity_remainder.",
      "Use MOD(id, 3) AS pickup_wave.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product routing.
-- Return id, name, parity_remainder, and pickup_wave from products.
-- Use id % 2 for parity and MOD(id, 3) for the pickup wave.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT id, name FROM products.",
      "Add id % 2 AS parity_remainder.",
      "Add MOD(id, 3) AS pickup_wave, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT id, name, id % 2 AS parity_remainder, MOD(id, 3) AS pickup_wave FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT id, name, id % 2 AS parity_remainder, MOD(id, 3) AS pickup_wave FROM products ORDER BY id;",
      },
      requiredColumns: ["id", "name", "parity_remainder", "pickup_wave"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Remainder routing complete",
      body: "Correct. You used one remainder calculation to identify parity and another to cycle every product through a predictable wave.",
      nextConcept: "POWER / SQRT / EXP / LOG",
    },
  },
  {
    id: "cycle-depot-model-product-scales",
    version: 1,
    title: "Model Cycle Depot product scales",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Use four numeric functions to build squared, root, exponential, and logarithmic views of every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, price, price_index_squared, price_root, growth_factor, and log10_price_scale.",
      "Use ROUND(POWER(price / 100.0, 2), 4) AS price_index_squared.",
      "Use ROUND(SQRT(price)::numeric, 3) AS price_root.",
      "Use ROUND(EXP((id % 3)::numeric), 3) AS growth_factor.",
      "Use ROUND(LOG(price / 100.0), 3) AS log10_price_scale.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product scales.
-- Return name, price, price_index_squared, price_root, growth_factor, and log10_price_scale.
-- Use POWER, SQRT, EXP, and LOG with the requested rounding.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, price FROM products.",
      "Add ROUND(POWER(price / 100.0, 2), 4) and ROUND(SQRT(price)::numeric, 3).",
      "Add EXP from id % 3, LOG from price / 100.0, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, ROUND(POWER(price / 100.0, 2), 4) AS price_index_squared, ROUND(SQRT(price)::numeric, 3) AS price_root, ROUND(EXP((id % 3)::numeric), 3) AS growth_factor, ROUND(LOG(price / 100.0), 3) AS log10_price_scale FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, ROUND(POWER(price / 100.0, 2), 4) AS price_index_squared, ROUND(SQRT(price)::numeric, 3) AS price_root, ROUND(EXP((id % 3)::numeric), 3) AS growth_factor, ROUND(LOG(price / 100.0), 3) AS log10_price_scale FROM products ORDER BY id;",
      },
      requiredColumns: [
        "name",
        "price",
        "price_index_squared",
        "price_root",
        "growth_factor",
        "log10_price_scale",
      ],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Product-scale model complete",
      body: "Correct. You built four different numeric views of the same Cycle Depot product rows while preserving the original price for context.",
      nextConcept: "RANDOM / RAND: Numbers in a Range",
    },
  },
  {
    id: "cycle-depot-assign-random-promo-groups",
    version: 1,
    title: "Assign random Cycle Depot promo groups",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt: "Assign every Cycle Depot product to a temporary random promo group from 1 through 6.",
    requirements: [
      "Use the products table.",
      "Return exactly name and promo_group.",
      "Use FLOOR(RANDOM() * 6 + 1)::int AS promo_group.",
      "Sort the source rows by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot random promo groups.
-- Return name and promo_group from products.
-- Use FLOOR(RANDOM() * 6 + 1)::int AS promo_group.
-- Sort the source rows by id, then run and check.`,
    hints: [
      "Start with SELECT name FROM products.",
      "Add FLOOR(RANDOM() * 6 + 1)::int AS promo_group.",
      "Finish with ORDER BY id. Each checked promo_group can be any integer from 1 through 6.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, FLOOR(RANDOM() * 6 + 1)::int AS promo_group FROM products ORDER BY id;",
    },
    validator: {
      kind: "numeric-range",
      expectedSql: {
        postgres: "SELECT name FROM products ORDER BY id;",
      },
      requiredColumns: ["name", "promo_group"],
      stableColumns: ["name"],
      rowCount: 30,
      rowOrder: "exact",
      ranges: [
        {
          field: "promo_group",
          minInclusive: 1,
          maxInclusive: 6,
          integer: true,
        },
      ],
    },
    success: {
      title: "Random promo groups complete",
      body: "Correct. You kept the real Cycle Depot product order while generating a fresh valid promo group for every row.",
      nextConcept: "Numeric Functions: Final Quiz",
    },
  },
  {
    id: "cycle-depot-safe-product-margins",
    version: 1,
    title: "Build safe product margin percentages",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt: "Calculate a safely guarded margin percentage for every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, price, cost, and margin_pct.",
      "Calculate 100.0 * (price - cost) / NULLIF(price, 0).",
      "Round the percentage to one decimal place.",
      "Use COALESCE(..., 0.0) so a missing calculated rate displays as 0.0.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot safe product margins.
-- Return name, price, cost, and margin_pct from products.
-- Protect the price denominator with NULLIF(price, 0).
-- Round to one decimal and use COALESCE(..., 0.0) for the fallback.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, price, cost FROM products.",
      "Write NULLIF(price, 0) where the denominator would normally be price.",
      "Wrap ROUND(100.0 * (price - cost) / NULLIF(price, 0), 1) with COALESCE(..., 0.0), then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, cost, COALESCE(ROUND(100.0 * (price - cost) / NULLIF(price, 0), 1), 0.0) AS margin_pct FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, cost, COALESCE(ROUND(100.0 * (price - cost) / NULLIF(price, 0), 1), 0.0) AS margin_pct FROM products ORDER BY id;",
      },
      requiredColumns: ["name", "price", "cost", "margin_pct"],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Safe product margins complete",
      body: "Correct. You protected the denominator before division and supplied a deliberate fallback for a missing rate.",
      nextConcept: "LEFT, RIGHT, and LENGTH",
    },
  },
  {
    id: "cycle-depot-product-model-numbers",
    version: 2,
    title: "Extract product model numbers",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Find Cycle Depot product names containing digits and extract the first model-number run from each one.",
    requirements: [
      "Use the products table.",
      "Return exactly name and model_number.",
      "Keep matching rows with WHERE REGEXP_LIKE(name, '[0-9]+').",
      "Use REGEXP_SUBSTR(name, '[0-9]+') AS model_number.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product model numbers.
-- Return name and model_number from products that contain digits.
-- Use REGEXP_LIKE to filter and REGEXP_SUBSTR to extract.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name FROM products.",
      "Add WHERE REGEXP_LIKE(name, '[0-9]+') to keep names containing a digit run.",
      "Add REGEXP_SUBSTR(name, '[0-9]+') AS model_number, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, REGEXP_SUBSTR(name, '[0-9]+') AS model_number FROM products WHERE REGEXP_LIKE(name, '[0-9]+') ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, REGEXP_SUBSTR(name, '[0-9]+') AS model_number FROM products WHERE REGEXP_LIKE(name, '[0-9]+') ORDER BY id;",
      },
      requiredColumns: ["name", "model_number"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Product model numbers complete",
      body: "Correct. You filtered flexible digit patterns and extracted the matching model number from each product name.",
      nextConcept: "More PostgreSQL text patterns",
    },
  },
  {
    id: "cycle-depot-customer-email-parts",
    version: 2,
    title: "Extract customer email parts",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "Find the @ position in every Cycle Depot customer email, then return the local name and domain separately.",
    requirements: [
      "Use the customers table.",
      "Return exactly email, at_position, email_local, and email_domain.",
      "Use POSITION('@' IN email) AS at_position.",
      "Use SPLIT_PART(email, '@', 1) AS email_local.",
      "Use SPLIT_PART(email, '@', 2) AS email_domain.",
      "Sort the result by id.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot customer email parts.
-- Return email, at_position, email_local, and email_domain from customers.
-- Use POSITION and SPLIT_PART with the @ delimiter.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT email FROM customers.",
      "Add POSITION('@' IN email) AS at_position.",
      "Add the two SPLIT_PART expressions, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT email, POSITION('@' IN email) AS at_position, SPLIT_PART(email, '@', 1) AS email_local, SPLIT_PART(email, '@', 2) AS email_domain FROM customers ORDER BY id;",
      duckdb:
        "SELECT email, POSITION('@' IN email) AS at_position, SPLIT_PART(email, '@', 1) AS email_local, SPLIT_PART(email, '@', 2) AS email_domain FROM customers ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT email, POSITION('@' IN email) AS at_position, SPLIT_PART(email, '@', 1) AS email_local, SPLIT_PART(email, '@', 2) AS email_domain FROM customers ORDER BY id;",
        duckdb:
          "SELECT email, POSITION('@' IN email) AS at_position, SPLIT_PART(email, '@', 1) AS email_local, SPLIT_PART(email, '@', 2) AS email_domain FROM customers ORDER BY id;",
      },
      requiredColumns: ["email", "at_position", "email_local", "email_domain"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Customer email parts complete",
      body: "Correct. You located a real delimiter and used it to produce the local name and domain for every customer email.",
      nextConcept: "CAST and TO_CHAR",
    },
  },
  {
    id: "cycle-depot-clean-product-keys",
    version: 3,
    title: "Create clean product keys with BTRIM",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "Compare left, right, whitespace, and chosen-character cleanup, then create a clean hyphenated key for every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, left_trimmed, right_trimmed, marker_trimmed, and product_key.",
      "Add one edge space on each side with CONCAT(' ', name, ' ').",
      "Use LTRIM inside pipes as left_trimmed and RTRIM inside pipes as right_trimmed.",
      "Use BTRIM(CONCAT('---', name, '---'), '-') as marker_trimmed.",
      "Use TRIM to remove both temporary edges before creating product_key.",
      "Use REPLACE to change every internal space to '-'.",
      "Name the result product_key.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot clean product keys.
-- Return name, left_trimmed, right_trimmed, marker_trimmed, and product_key from products.
-- Use LTRIM and RTRIM inside pipes to show the remaining edge spaces.
-- Use BTRIM to remove --- markers, then TRIM and REPLACE to make a clean hyphenated key.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name FROM products.",
      "Use CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed, then mirror it with RTRIM for right_trimmed.",
      "Use BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed.",
      "Use REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed, CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed, BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed, REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key FROM products ORDER BY id;",
      duckdb:
        "SELECT name, CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed, CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed, BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed, REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed, CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed, BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed, REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key FROM products ORDER BY id;",
        duckdb:
          "SELECT name, CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed, CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed, BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed, REPLACE(TRIM(CONCAT(' ', name, ' ')), ' ', '-') AS product_key FROM products ORDER BY id;",
      },
      requiredColumns: ["name", "left_trimmed", "right_trimmed", "marker_trimmed", "product_key"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Clean product keys with BTRIM complete",
      body: "Correct. You compared left and right cleanup, removed chosen hyphen markers from both edges, and then replaced internal spaces with hyphens.",
      nextConcept: "POSITION and SPLIT_PART",
    },
  },
  {
    id: "cycle-depot-product-case-labels",
    version: 2,
    title: "Create product case labels",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt: "Create uppercase, lowercase, and title-cased labels for every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, category, category_upper, category_lower, and name_title.",
      "Use UPPER(category) AS category_upper.",
      "Use LOWER(category) AS category_lower.",
      "Use INITCAP(LOWER(name)) AS name_title.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product case labels.
-- Return name, category, category_upper, category_lower, and name_title from products.
-- Use UPPER(category), LOWER(category), and INITCAP(LOWER(name)).
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, category FROM products.",
      "Add UPPER(category) AS category_upper.",
      "Add LOWER(category) AS category_lower and INITCAP(LOWER(name)) AS name_title, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, category, UPPER(category) AS category_upper, LOWER(category) AS category_lower, INITCAP(LOWER(name)) AS name_title FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, category, UPPER(category) AS category_upper, LOWER(category) AS category_lower, INITCAP(LOWER(name)) AS name_title FROM products ORDER BY id;",
      },
      requiredColumns: ["name", "category", "category_upper", "category_lower", "name_title"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Product case labels complete",
      body: "Correct. You created uppercase, lowercase, and title-cased labels while keeping each source value in the result.",
      nextConcept: "TRIM and REPLACE",
    },
  },
  {
    id: "cycle-depot-customer-text-summaries",
    version: 2,
    title: "Create customer text summaries",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a compact text summary for every Cycle Depot customer.",
    requirements: [
      "Use the customers table.",
      "Return exactly name, name_code, email_domain, and name_characters.",
      "Use LEFT(name, 3) AS name_code.",
      "Use RIGHT(email, 11) AS email_domain.",
      "Use CHAR_LENGTH(name) AS name_characters.",
      "Sort the result by id.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot customer text summaries.
-- Return name, name_code, email_domain, and name_characters from customers.
-- Use LEFT(name, 3), RIGHT(email, 11), and LENGTH(name).
-- Use CHAR_LENGTH(name) AS name_characters.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name FROM customers.",
      "Add LEFT(name, 3) AS name_code and CHAR_LENGTH(name) AS name_characters.",
      "Add RIGHT(email, 11) AS email_domain, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, LEFT(name, 3) AS name_code, RIGHT(email, 11) AS email_domain, CHAR_LENGTH(name) AS name_characters FROM customers ORDER BY id;",
      duckdb:
        "SELECT name, LEFT(name, 3) AS name_code, RIGHT(email, 11) AS email_domain, CHAR_LENGTH(name) AS name_characters FROM customers ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, LEFT(name, 3) AS name_code, RIGHT(email, 11) AS email_domain, CHAR_LENGTH(name) AS name_characters FROM customers ORDER BY id;",
        duckdb:
          "SELECT name, LEFT(name, 3) AS name_code, RIGHT(email, 11) AS email_domain, CHAR_LENGTH(name) AS name_characters FROM customers ORDER BY id;",
      },
      requiredColumns: ["name", "name_code", "email_domain", "name_characters"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Customer text summaries complete",
      body: "Correct. You read fixed text from both ends and used CHAR_LENGTH to count the full customer name without changing stored values.",
      nextConcept: "UPPER and LOWER",
    },
  },
  {
    id: "cycle-depot-compact-product-labels",
    version: 2,
    title: "Build compact product labels",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a compact text label for every Cycle Depot product.",
    requirements: [
      "Use the products table.",
      "Return exactly name, category, and compact_label.",
      "Use SUBSTRING(name FROM 1 FOR 5) to take the first five characters of name.",
      "Use CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) to join the prefix and category.",
      "Name the result compact_label.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot compact product labels.
-- Return name, category, and compact_label from products.
-- Use the first five characters of name, then join them to category with ' - '.
-- Use CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) for compact_label.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT name, category FROM products.",
      "Add SUBSTRING(name FROM 1 FOR 5) to take the prefix.",
      "Wrap it with CONCAT_WS(' - ', SUBSTRING(...), category) AS compact_label, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, category, CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) AS compact_label FROM products ORDER BY id;",
      duckdb:
        "SELECT name, category, CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) AS compact_label FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, category, CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) AS compact_label FROM products ORDER BY id;",
        duckdb:
          "SELECT name, category, CONCAT_WS(' - ', SUBSTRING(name FROM 1 FOR 5), category) AS compact_label FROM products ORDER BY id;",
      },
      requiredColumns: ["name", "category", "compact_label"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Compact labels complete",
      body: "Correct. You used SUBSTRING to extract a fixed prefix and CONCAT_WS to build a readable value for every product.",
      nextConcept: "LEFT, RIGHT, and LENGTH",
    },
  },
  {
    id: "cycle-depot-customer-directory",
    version: 1,
    title: "Build a customer directory",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a simple customer directory for the Cycle Depot team.",
    requirements: [
      "Use the customers table.",
      "Return every customer's id, name, and country.",
      "Rename the name column to customer_name.",
      "Return exactly these columns: id, customer_name, and country.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot practice: build a customer directory.
-- Return id, name as customer_name, and country from customers.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT and list the three fields you need.",
      "Use AS to rename name: name AS customer_name.",
    ],
    solutionSql: {
      postgres: "SELECT id, name AS customer_name, country FROM customers;",
      duckdb: "SELECT id, name AS customer_name, country FROM customers;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT id, name AS customer_name, country FROM customers;",
        duckdb: "SELECT id, name AS customer_name, country FROM customers;",
      },
      requiredColumns: ["id", "customer_name", "country"],
      columnOrder: "exact",
      rowOrder: "any",
    },
    success: {
      title: "Customer directory complete",
      body: "Correct. You selected the requested fields and used an alias to give the customer name a clearer heading.",
      nextConcept: "Filtering customers with WHERE",
    },
  },
  {
    id: "cycle-depot-product-price-with-tax",
    version: 1,
    title: "Preview product prices with tax",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a price preview for the Cycle Depot merchandising team.",
    requirements: [
      "Use the products table.",
      "Return every product's name and price.",
      "Calculate price * 1.08.",
      "Name the calculated column price_with_tax.",
      "Return exactly these columns: name, price, and price_with_tax.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot price preview.
-- Return name, price, and price * 1.08 AS price_with_tax from products.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, price FROM products.",
      "Add price * 1.08 and use AS price_with_tax to name the calculated result.",
    ],
    solutionSql: {
      postgres: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
      duckdb: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
        duckdb: "SELECT name, price, price * 1.08 AS price_with_tax FROM products;",
      },
      requiredColumns: ["name", "price", "price_with_tax"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Price preview complete",
      body: "Correct. You created a calculated value for every product and gave it a clear result-column name.",
      nextConcept: "Filter products with WHERE",
    },
  },
  {
    id: "cycle-depot-product-price-bands",
    version: 1,
    title: "Classify Cycle Depot products",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Label every Cycle Depot product by its price range without removing any rows.",
    requirements: [
      "Use the products table.",
      "Return exactly the name, price, and price_band columns.",
      "Use CASE to label prices below 1000 as Budget.",
      "Label prices from 1000 up to, but not including, 2500 as Mid-range.",
      "Label prices of 2500 or more as Premium.",
      "Sort by price, then name.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product labels.
-- Return name, price, and a CASE expression named price_band from products.
-- Budget: below 1000. Mid-range: below 2500. Premium: everything else.
-- Sort by price, then name. Write your query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, price, then add CASE ... END AS price_band.",
      "Put WHEN price < 1000 before WHEN price < 2500 so Budget can be reached.",
      "Use ELSE 'Premium', then ORDER BY price, name.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, CASE WHEN price < 1000 THEN 'Budget' WHEN price < 2500 THEN 'Mid-range' ELSE 'Premium' END AS price_band FROM products ORDER BY price, name;",
      duckdb:
        "SELECT name, price, CASE WHEN price < 1000 THEN 'Budget' WHEN price < 2500 THEN 'Mid-range' ELSE 'Premium' END AS price_band FROM products ORDER BY price, name;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, CASE WHEN price < 1000 THEN 'Budget' WHEN price < 2500 THEN 'Mid-range' ELSE 'Premium' END AS price_band FROM products ORDER BY price, name;",
        duckdb:
          "SELECT name, price, CASE WHEN price < 1000 THEN 'Budget' WHEN price < 2500 THEN 'Mid-range' ELSE 'Premium' END AS price_band FROM products ORDER BY price, name;",
      },
      requiredColumns: ["name", "price", "price_band"],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Product price bands complete",
      body: "Correct. You kept all 30 products and used CASE to add a clear price_band value to every row.",
      nextConcept: "DISTINCT, ORDER BY, and LIMIT",
    },
  },
  {
    id: "cycle-depot-ready-to-sell-premium-products",
    version: 1,
    title: "Find ready-to-sell premium products",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find products the Cycle Depot team can promote now.",
    requirements: [
      "Use the products table.",
      "Return the name, price, and in_stock columns.",
      "Keep products priced at least 2000.",
      "Keep products with at least 50 units in stock.",
      "Use AND so both requirements must be true.",
      "Return exactly these columns: name, price, and in_stock.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot inventory check.
-- Return name, price, and in_stock for products that meet both requirements.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, price, in_stock FROM products.",
      "Add WHERE, then join price >= 2000 and in_stock >= 50 with AND.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
      duckdb: "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
        duckdb:
          "SELECT name, price, in_stock FROM products WHERE price >= 2000 AND in_stock >= 50;",
      },
      requiredColumns: ["name", "price", "in_stock"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Promotion list complete",
      body: "Correct. You used comparison operators and AND to keep only products that meet both business requirements.",
      nextConcept: "More detailed WHERE filtering",
    },
  },
  {
    id: "cycle-depot-featured-products-logic",
    version: 1,
    title: "Build a featured product list",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a featured-products list for the Cycle Depot campaign team.",
    requirements: [
      "Use the products table.",
      "Return exactly these columns: name, category, price, and in_stock.",
      "Keep Road Bikes with at least 90 units in stock.",
      "Also keep products that are not Road Bikes and have a price of at least 4000.",
      "Use AND, OR, NOT, and parentheses to make the two groups clear.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot featured products.
-- Return name, category, price, and in_stock for either qualifying group.
-- Use parentheses to keep each group easy to read.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category, price, in_stock FROM products.",
      "Your first parenthesized group is category = 'Road Bikes' AND in_stock >= 90.",
      "Connect it with OR to a second group: NOT category = 'Road Bikes' AND price >= 4000.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
      duckdb:
        "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
        duckdb:
          "SELECT name, category, price, in_stock FROM products WHERE (category = 'Road Bikes' AND in_stock >= 90) OR (NOT category = 'Road Bikes' AND price >= 4000);",
      },
      requiredColumns: ["name", "category", "price", "in_stock"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Featured product list complete",
      body: "Correct. You combined two business rules with AND, OR, and NOT to produce the right three products.",
      nextConcept: "Range and set filtering with IN and BETWEEN",
    },
  },
  {
    id: "cycle-depot-premium-bike-range",
    version: 1,
    title: "Build a premium bike range",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Build a Cycle Depot shortlist of mid-priced Road and Mountain Bikes.",
    requirements: [
      "Use the products table.",
      "Return exactly these columns: name, category, and price.",
      "Start with the Road Bikes, Mountain Bikes, and City Bikes categories using IN.",
      "Exclude City Bikes using NOT IN.",
      "Keep prices from 2000 through 4000 using BETWEEN.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot premium bike range.
-- Return name, category, and price for the qualifying products.
-- Use IN, NOT IN, and BETWEEN in the WHERE clause.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category, price FROM products.",
      "Use category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') for the allowed set.",
      "Add category NOT IN ('City Bikes') and price BETWEEN 2000 AND 4000 with AND.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
      duckdb:
        "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
        duckdb:
          "SELECT name, category, price FROM products WHERE category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes') AND category NOT IN ('City Bikes') AND price BETWEEN 2000 AND 4000;",
      },
      requiredColumns: ["name", "category", "price"],
      columnOrder: "exact",
      rowOrder: "any",
      numericTolerance: 0.001,
    },
    success: {
      title: "Premium bike range complete",
      body: "Correct. You used a set, an exclusion, and an inclusive price range to find the three matching products.",
      nextConcept: "Pattern matching with LIKE and ILIKE",
    },
  },
  {
    id: "cycle-depot-road-product-search",
    version: 1,
    title: "Search the Road product catalog",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The merchandising team needs Road product names, but not helmets.",
    requirements: [
      "Use the products table.",
      "Return exactly the name and category columns.",
      "Match product names containing road without letter-case sensitivity.",
      "Exclude product names containing Helmet.",
      "Use ILIKE and NOT LIKE.",
      "Sort by id so the result is deterministic.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot product search.
-- Return name and category for Road product names, excluding helmets.
-- Use ILIKE and NOT LIKE, then order by id.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT name, category FROM products.",
      "Use name ILIKE '%road%' for the case-insensitive search.",
      "Add AND name NOT LIKE '%Helmet%', then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
      duckdb:
        "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
        duckdb:
          "SELECT name, category FROM products WHERE name ILIKE '%road%' AND name NOT LIKE '%Helmet%' ORDER BY id;",
      },
      requiredColumns: ["name", "category"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Road catalog search complete",
      body: "Correct. You used a case-insensitive contains pattern and excluded the helmet match to keep the two Road Bike products.",
      nextConcept: "NULL-aware filtering",
    },
  },
  {
    id: "cycle-depot-march-order-range",
    version: 1,
    title: "Find March orders with a date range",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a March 2024 order report without transforming the date column.",
    requirements: [
      "Use the orders table.",
      "Return exactly these columns: id, customer_id, and order_date.",
      "Include dates on or after March 1, 2024.",
      "Exclude dates on or after April 1, 2024.",
      "Sort by order_date, then id.",
    ],
    requiredTables: ["orders"],
    starterSql: `-- Cycle Depot March order report.
-- Return id, customer_id, and order_date for March 2024.
-- Use >= DATE '2024-03-01' and < DATE '2024-04-01'.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "Start with SELECT id, customer_id, order_date FROM orders.",
      "Use order_date >= DATE '2024-03-01' for the start of the range.",
      "Add AND order_date < DATE '2024-04-01', then ORDER BY order_date, id.",
    ],
    solutionSql: {
      postgres:
        "SELECT id, customer_id, order_date FROM orders WHERE order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01' ORDER BY order_date, id;",
      duckdb:
        "SELECT id, customer_id, order_date FROM orders WHERE order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01' ORDER BY order_date, id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT id, customer_id, order_date FROM orders WHERE order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01' ORDER BY order_date, id;",
        duckdb:
          "SELECT id, customer_id, order_date FROM orders WHERE order_date >= DATE '2024-03-01' AND order_date < DATE '2024-04-01' ORDER BY order_date, id;",
      },
      requiredColumns: ["id", "customer_id", "order_date"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "March range complete",
      body: "Correct. You used an inclusive start and exclusive finish to express a clear, index-friendly date range.",
      nextConcept: "Aggregate filtered rows with GROUP BY",
    },
  },
  {
    id: "cycle-depot-find-us-customers",
    version: 1,
    title: "Find US customers",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "The marketing team needs a list of all customers located in the USA to send a targeted promotion.",
    requirements: [
      "Use the customers table.",
      "Return all columns for customers whose country is 'USA'.",
      "Sort the results by name from A to Z.",
    ],
    requiredTables: ["customers"],
    hints: [
      "Use the WHERE clause to filter for country = 'USA'.",
      "Use ORDER BY name ASC to sort the results alphabetically.",
    ],
    solutionSql: {
      postgres: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
      duckdb: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
        duckdb: "SELECT * FROM customers WHERE country = 'USA' ORDER BY name ASC;",
      },
      requiredColumns: ["id", "name", "email", "country", "city", "segment", "signup_date"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully filtered the customers table and ordered the results.",
      nextConcept: "Customers without a city",
    },
  },
  {
    id: "cycle-depot-customers-without-city",
    version: 1,
    title: "Customers without a city",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "Data hygiene check! We need to find all customers who are missing a city in their profile.",
    requirements: [
      "Use the customers table.",
      "Return the id, name, and email columns.",
      "Include only customers where the city is missing (NULL).",
    ],
    requiredTables: ["customers"],
    hints: [
      "Missing values in SQL are represented by NULL.",
      "You cannot use '= NULL' to check for missing values. Use 'IS NULL' instead.",
    ],
    solutionSql: {
      postgres: "SELECT id, name, email FROM customers WHERE city IS NULL;",
      duckdb: "SELECT id, name, email FROM customers WHERE city IS NULL;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT id, name, email FROM customers WHERE city IS NULL;",
        duckdb: "SELECT id, name, email FROM customers WHERE city IS NULL;",
      },
      requiredColumns: ["id", "name", "email"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You correctly used IS NULL to find missing data.",
      nextConcept: "Recent delivered orders",
    },
  },
  {
    id: "cycle-depot-first-three-countries",
    version: 1,
    title: "Build a short country list",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "The Cycle Depot onboarding form needs the first three country choices in alphabetical order.",
    requirements: [
      "Use the customers table.",
      "Return the country column only.",
      "Remove repeated country values.",
      "Sort alphabetically and keep the first 3 rows.",
    ],
    requiredTables: ["customers"],
    hints: [
      "Put DISTINCT immediately after SELECT to remove repeated country values.",
      "Use ORDER BY country ASC before LIMIT 3.",
    ],
    solutionSql: {
      postgres: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
      duckdb: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
        duckdb: "SELECT DISTINCT country FROM customers ORDER BY country ASC LIMIT 3;",
      },
      requiredColumns: ["country"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Country list complete",
      body: "Correct. You removed repeated countries, sorted the result alphabetically, and kept the first three rows.",
      nextConcept: "Logical query order",
    },
  },
  {
    id: "cycle-depot-road-bike-shortlist",
    version: 1,
    title: "Build a Road Bike shortlist",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "The sales team needs the three most expensive Road Bikes to feature in a campaign.",
    requirements: [
      "Use the products table.",
      "Return the name and price columns only.",
      "Keep products where category is 'Road Bikes'.",
      "Sort from the highest price to the lowest and keep the first 3 rows.",
    ],
    requiredTables: ["products"],
    hints: [
      "Use WHERE category = 'Road Bikes' before sorting.",
      "Use ORDER BY price DESC, followed by LIMIT 3.",
    ],
    solutionSql: {
      postgres:
        "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
      duckdb:
        "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
        duckdb:
          "SELECT name, price FROM products WHERE category = 'Road Bikes' ORDER BY price DESC LIMIT 3;",
      },
      requiredColumns: ["name", "price"],
      columnOrder: "exact",
      rowOrder: "exact",
      numericTolerance: 0.001,
    },
    success: {
      title: "Road Bike shortlist complete",
      body: "Correct. You used the logical flow from source rows through filtering, sorting, and limiting to build the shortlist.",
      nextConcept: "The final querying fundamentals quiz",
    },
  },
  {
    id: "cycle-depot-recent-delivered-orders",
    version: 1,
    title: "Recent delivered orders",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Show the latest 10 orders that have been successfully delivered.",
    requirements: [
      "Use the orders table.",
      "Return all columns.",
      "Filter for orders with the status 'delivered'.",
      "Order them by order_date from newest to oldest, and return only the first 10.",
    ],
    requiredTables: ["orders"],
    hints: [
      "Filter by status = 'delivered'.",
      "Sort by order_date DESC.",
      "Use LIMIT 10 to restrict the output to just 10 rows.",
    ],
    solutionSql: {
      postgres:
        "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
      duckdb: "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
        duckdb:
          "SELECT * FROM orders WHERE status = 'delivered' ORDER BY order_date DESC LIMIT 10;",
      },
      requiredColumns: ["id", "customer_id", "order_date", "shipped_date", "status", "channel"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You combined filtering, ordering, and limiting to find the most recent matching rows.",
      nextConcept: "Show each order with its customer",
    },
  },
  {
    id: "cycle-depot-each-order-with-customer",
    version: 1,
    title: "Show each order with its customer",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "We want to see the details of who placed each order.",
    requirements: [
      "Use both the orders and customers tables.",
      "Return the order id, order_date, customer name, and customer country.",
      "Only include orders that have a matching customer.",
    ],
    requiredTables: ["orders", "customers"],
    hints: [
      "Use an INNER JOIN to combine orders and customers.",
      "The relationship is defined by orders.customer_id = customers.id.",
    ],
    solutionSql: {
      postgres:
        "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
      duckdb:
        "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
        duckdb:
          "SELECT o.id, o.order_date, c.name, c.country FROM orders o JOIN customers c ON o.customer_id = c.id;",
      },
      requiredColumns: ["id", "order_date", "name", "country"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully joined two tables to enrich order data with customer details.",
      nextConcept: "Customers who never ordered",
    },
  },
  {
    id: "cycle-depot-customers-no-orders",
    version: 1,
    title: "Customers who never ordered",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "The retention team wants a list of customers who signed up but have not yet placed an order. Return id, name, country, and signup_date, ordered by signup_date from oldest to newest.",
    requirements: [
      "Use customers and orders.",
      "Return exactly the four named columns.",
      "Include every customer with no matching order.",
      "Do not include customers who have ordered.",
      "Order by signup_date from oldest to newest.",
    ],
    requiredTables: ["customers", "orders"],
    hints: [
      "You can use a LEFT JOIN from customers to orders.",
      "If a customer has no orders, the joined order columns will be NULL. Filter for where order id IS NULL.",
      "Alternatively, use WHERE NOT EXISTS.",
    ],
    solutionSql: {
      postgres:
        "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
      duckdb:
        "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
        duckdb:
          "SELECT c.id, c.name, c.country, c.signup_date FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.signup_date ASC;",
      },
      requiredColumns: ["id", "name", "country", "signup_date"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You found all customers who have not placed an order. Your query preserves customers even when no matching order exists.",
      nextConcept: "Calculate each order's total",
    },
  },
  {
    id: "cycle-depot-order-totals",
    version: 1,
    title: "Calculate each order's total",
    group: "joins",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Calculate the total value of each order by summing the prices of its items.",
    requirements: [
      "Use orders and order_items.",
      "Return order id, order_date, and the total value of the order as total_value.",
      "Include only orders that have items.",
    ],
    requiredTables: ["orders", "order_items"],
    hints: [
      "Join orders to order_items.",
      "Group the results by order id and order_date.",
      "Use SUM(unit_price * quantity) to calculate the total value.",
    ],
    solutionSql: {
      postgres:
        "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
      duckdb:
        "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
        duckdb:
          "SELECT o.id, o.order_date, SUM(oi.unit_price * oi.quantity) as total_value FROM orders o JOIN order_items oi ON o.id = oi.order_id GROUP BY o.id, o.order_date;",
      },
      requiredColumns: ["id", "order_date", "total_value"],
      columnOrder: "any",
      rowOrder: "any",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You combined a join with an aggregate function to roll up line items into order totals.",
      nextConcept: "Revenue by product category",
    },
  },
  {
    id: "cycle-depot-customer-coverage-summary",
    version: 1,
    title: "Build a customer coverage summary",
    group: "aggregation",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Summarise Cycle Depot customer coverage in one row.",
    requirements: [
      "Use the customers table.",
      "Count every customer as customer_count.",
      "Count non-NULL city values as customers_with_city.",
      "Count distinct countries as country_count.",
      "Return exactly these columns: customer_count, customers_with_city, and country_count.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot customer coverage summary.
-- Return counts for all customers, customers with a city, and distinct countries.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "COUNT(*) counts every customer row.",
      "COUNT(city) skips customers whose city is NULL.",
      "Put DISTINCT inside COUNT to count each country once.",
    ],
    solutionSql: {
      postgres:
        "SELECT COUNT(*) AS customer_count, COUNT(city) AS customers_with_city, COUNT(DISTINCT country) AS country_count FROM customers;",
      duckdb:
        "SELECT COUNT(*) AS customer_count, COUNT(city) AS customers_with_city, COUNT(DISTINCT country) AS country_count FROM customers;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT COUNT(*) AS customer_count, COUNT(city) AS customers_with_city, COUNT(DISTINCT country) AS country_count FROM customers;",
        duckdb:
          "SELECT COUNT(*) AS customer_count, COUNT(city) AS customers_with_city, COUNT(DISTINCT country) AS country_count FROM customers;",
      },
      requiredColumns: ["customer_count", "customers_with_city", "country_count"],
      columnOrder: "exact",
      rowOrder: "any",
    },
    success: {
      title: "Customer coverage summary complete",
      body: "Correct. You separated row count, non-NULL value count, and distinct-value count in one clear summary.",
      nextConcept: "Group summaries with GROUP BY",
    },
  },
  {
    id: "cycle-depot-order-counts-by-status",
    version: 1,
    title: "Count orders by status",
    group: "aggregation",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Create a status summary for the Cycle Depot orders table.",
    requirements: [
      "Use the orders table.",
      "Return status and COUNT(*) AS order_count.",
      "Group the rows by status.",
      "Sort the rows alphabetically by status.",
      "Return exactly these columns: status and order_count.",
    ],
    requiredTables: ["orders"],
    starterSql: `-- Cycle Depot order-status summary.
-- Return status and COUNT(*) AS order_count from orders.
-- Group by status and order the result by status.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "A grouping column appears in both SELECT and GROUP BY.",
      "COUNT(*) counts the orders inside each status group.",
      "ORDER BY status makes the result match the requested alphabetical order.",
    ],
    solutionSql: {
      postgres:
        "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY status;",
      duckdb: "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY status;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY status;",
        duckdb:
          "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY status;",
      },
      requiredColumns: ["status", "order_count"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Status summary complete",
      body: "Correct. You made one count for each order status instead of one count for the whole orders table.",
      nextConcept: "Use HAVING to filter grouped results",
    },
  },
  {
    id: "cycle-depot-order-statuses-with-at-least-ten-orders",
    version: 1,
    title: "Find active order-status groups",
    group: "aggregation",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find Cycle Depot order statuses that have at least ten orders.",
    requirements: [
      "Use the orders table.",
      "Return status and COUNT(*) AS order_count.",
      "Group rows by status.",
      "Use HAVING COUNT(*) >= 10 to keep qualifying groups.",
      "Sort by order_count descending, then status ascending.",
      "Return exactly these columns: status and order_count.",
    ],
    requiredTables: ["orders"],
    starterSql: `-- Cycle Depot active order statuses.
-- Return status and COUNT(*) AS order_count for statuses with at least 10 orders.
-- Group by status, filter with HAVING, then sort largest count first.
-- Write your SELECT query below, then choose Run and check.`,
    hints: [
      "GROUP BY status creates one count for each status.",
      "COUNT(*) is an aggregate, so its condition belongs in HAVING.",
      "Use ORDER BY order_count DESC, status ASC for the requested order.",
    ],
    solutionSql: {
      postgres:
        "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status HAVING COUNT(*) >= 10 ORDER BY order_count DESC, status ASC;",
      duckdb:
        "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status HAVING COUNT(*) >= 10 ORDER BY order_count DESC, status ASC;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status HAVING COUNT(*) >= 10 ORDER BY order_count DESC, status ASC;",
        duckdb:
          "SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status HAVING COUNT(*) >= 10 ORDER BY order_count DESC, status ASC;",
      },
      requiredColumns: ["status", "order_count"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Active statuses found",
      body: "Correct. You grouped the orders first, then used HAVING to keep only status groups with at least ten orders.",
      nextConcept: "Use WHERE and HAVING together when a report needs both row and group filters.",
    },
  },
  {
    id: "cycle-depot-revenue-by-category",
    version: 1,
    title: "Revenue by product category",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find the total revenue generated by each product category.",
    requirements: [
      "Use products and order_items.",
      "Return the category name and the total revenue for that category.",
      "Revenue is unit_price * quantity.",
    ],
    requiredTables: ["products", "order_items"],
    hints: [
      "Join the two tables on product_id.",
      "Group by the category column.",
      "Sum the unit_price multiplied by quantity.",
    ],
    solutionSql: {
      postgres:
        "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
      duckdb:
        "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
        duckdb:
          "SELECT p.category, SUM(oi.unit_price * oi.quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.category;",
      },
      requiredColumns: ["category", "revenue"],
      columnOrder: "any",
      rowOrder: "any",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You used GROUP BY to aggregate data across a category.",
      nextConcept: "Countries with more than 20 orders",
    },
  },
  {
    id: "cycle-depot-countries-high-orders",
    version: 1,
    title: "Countries with more than 20 orders",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Identify countries where customers have placed more than 20 orders in total.",
    requirements: [
      "Use customers and orders.",
      "Return the country name and the order count.",
      "Only include countries with an order count strictly greater than 20.",
    ],
    requiredTables: ["customers", "orders"],
    hints: [
      "Join the tables and group by country.",
      "Count the number of orders.",
      "Use HAVING to filter on the aggregated count, since WHERE cannot filter on aggregates.",
    ],
    solutionSql: {
      postgres:
        "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
      duckdb:
        "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
        duckdb:
          "SELECT c.country, COUNT(o.id) as order_count FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.country HAVING COUNT(o.id) > 20;",
      },
      requiredColumns: ["country", "order_count"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You used HAVING to filter groups after they were aggregated.",
      nextConcept: "Count missing cities",
    },
  },
  {
    id: "cycle-depot-count-missing-cities",
    version: 1,
    title: "Count missing cities",
    group: "aggregation",
    difficulty: "intermediate",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Return a single row with the number of customers who do not have a city listed.",
    requirements: ["Use the customers table.", "Return one column containing the count."],
    requiredTables: ["customers"],
    hints: ["Use COUNT(*) or COUNT(id) to count rows.", "Filter for city IS NULL."],
    solutionSql: {
      postgres: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
      duckdb: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
        duckdb: "SELECT COUNT(*) as missing_count FROM customers WHERE city IS NULL;",
      },
      requiredColumns: ["missing_count"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You counted rows based on a specific condition.",
      nextConcept: "Find highest-value customers",
    },
  },
  {
    id: "cycle-depot-highest-value-customers",
    version: 1,
    title: "Find highest-value customers",
    group: "ctes",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Find the names and total lifetime spend of the top 5 customers by revenue.",
    requirements: [
      "Use customers, orders, and order_items.",
      "Return customer name and their total spend.",
      "Sort by total spend descending and limit to 5.",
    ],
    requiredTables: ["customers", "orders", "order_items"],
    hints: [
      "You need to join all three tables to connect a customer to the items they bought.",
      "Group by the customer's name.",
      "Sum (unit_price * quantity) for the spend.",
    ],
    solutionSql: {
      postgres:
        "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
      duckdb:
        "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
        duckdb:
          "SELECT c.name, SUM(oi.unit_price * oi.quantity) as total_spend FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5;",
      },
      requiredColumns: ["name", "total_spend"],
      columnOrder: "any",
      rowOrder: "exact",
      numericTolerance: 0.01,
    },
    success: {
      title: "Challenge complete",
      body: "You executed a multi-table join and aggregation to find top customers.",
      nextConcept: "Rank each customer's orders",
    },
  },
  {
    id: "cycle-depot-rank-customer-orders",
    version: 1,
    title: "Rank each customer's orders",
    group: "windows",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt:
      "Assign a sequential rank to each order placed by a customer, based on the order date. The first order is 1, the second is 2, etc.",
    requirements: [
      "Use the orders table.",
      "Return customer_id, order id, order_date, and the rank column.",
    ],
    requiredTables: ["orders"],
    hints: [
      "Use the ROW_NUMBER() window function.",
      "Use PARTITION BY customer_id to restart the numbering for each customer.",
      "Use ORDER BY order_date within the window function to sort correctly.",
    ],
    solutionSql: {
      postgres:
        "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
      duckdb:
        "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
        duckdb:
          "SELECT customer_id, id, order_date, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank FROM orders;",
      },
      requiredColumns: ["customer_id", "id", "order_date", "order_rank"],
      columnOrder: "any",
      rowOrder: "any",
    },
    success: {
      title: "Challenge complete",
      body: "You used a window function to compute a value across related rows without collapsing them into groups.",
      nextConcept: "Month-over-month order change",
    },
  },
  {
    id: "cycle-depot-mom-order-change",
    version: 1,
    title: "Month-over-month order change",
    group: "windows",
    difficulty: "advanced",
    dataset: "cycledepot",
    engines: ["postgres", "duckdb"],
    prompt: "Compare the total number of orders placed in each month to the previous month.",
    requirements: [
      "Use the orders table.",
      "You will need a CTE or subquery.",
      "First, get the count of orders per month (use DATE_TRUNC('month', order_date)).",
      "Then, use LAG to find the previous month's count.",
      "Return month, order_count, and prev_month_count.",
      "Order by month.",
    ],
    requiredTables: ["orders"],
    hints: [
      "Step 1: Write a query to get month and COUNT(id). Save it as a CTE.",
      "Step 2: Query from the CTE, selecting month, order_count, and LAG(order_count) OVER (ORDER BY month).",
      "DATE_TRUNC is supported in both Postgres and DuckDB.",
    ],
    solutionSql: {
      postgres:
        "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
      duckdb:
        "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
        duckdb:
          "WITH monthly AS (SELECT DATE_TRUNC('month', order_date) as month, COUNT(id) as order_count FROM orders GROUP BY 1) SELECT month, order_count, LAG(order_count) OVER (ORDER BY month) as prev_month_count FROM monthly ORDER BY month;",
      },
      requiredColumns: ["month", "order_count", "prev_month_count"],
      columnOrder: "any",
      rowOrder: "exact",
    },
    success: {
      title: "Challenge complete",
      body: "You successfully used a CTE and the LAG window function to perform a time-series comparison.",
    },
  },
  {
    id: "cycle-depot-safely-cast-product-ids",
    version: 1,
    title: "Safely cast incoming Cycle Depot product IDs",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Validate query-local incoming product-ID text before casting it so malformed values produce NULL instead of an invalid-integer error.",
    requirements: [
      "Use a query-local incoming_product_ids CTE with '1', '3', '', and 'bike-7'.",
      "Return exactly raw_product_id and safe_product_id.",
      "Use CASE with raw_product_id ~ '^[0-9]+$' to gate the integer cast.",
      "Cast valid text with raw_product_id::integer.",
      "Sort the result by raw_product_id.",
    ],
    requiredTables: [],
    starterSql: `-- Safely cast incoming Cycle Depot product IDs.
-- Use a CTE with '1', '3', '', and 'bike-7'.
-- Return raw_product_id and safe_product_id with CASE plus ^[0-9]+$.
-- Cast only valid values to integer, order by raw_product_id, then run and check.`,
    hints: [
      "Start with WITH incoming_product_ids(raw_product_id) AS (VALUES ('1'), ('3'), (''), ('bike-7')).",
      "Select raw_product_id, then add CASE WHEN raw_product_id ~ '^[0-9]+$'.",
      "Put raw_product_id::integer after THEN, alias the expression safe_product_id, and order by raw_product_id.",
    ],
    solutionSql: {
      postgres: `WITH incoming_product_ids(raw_product_id) AS (
  VALUES ('1'), ('3'), (''), ('bike-7')
)
SELECT raw_product_id,
       CASE WHEN raw_product_id ~ '^[0-9]+$'
            THEN raw_product_id::integer END AS safe_product_id
FROM incoming_product_ids
ORDER BY raw_product_id;`,
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres: `WITH incoming_product_ids(raw_product_id) AS (
  VALUES ('1'), ('3'), (''), ('bike-7')
)
SELECT raw_product_id,
       CASE WHEN raw_product_id ~ '^[0-9]+$'
            THEN raw_product_id::integer END AS safe_product_id
FROM incoming_product_ids
ORDER BY raw_product_id;`,
      },
      requiredColumns: ["raw_product_id", "safe_product_id"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Safe casting complete",
      body: "Correct. You validated each incoming text value before conversion, so invalid IDs remained visible as NULL instead of breaking the result.",
    },
  },
  {
    id: "cycle-depot-use-implicit-coercion",
    version: 1,
    title: "Use context for a Cycle Depot sale lookup",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Use PostgreSQL's clear type context to find one Cycle Depot product and calculate its sale price.",
    requirements: [
      "Use the products table.",
      "Return exactly id, name, price, and sale_price.",
      "Find the product with WHERE id = '3'.",
      "Use price * 0.875 AS sale_price.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot context-driven sale lookup.
-- Return id, name, price, and sale_price from products.
-- Find the row with WHERE id = '3'. Use price * 0.875 AS sale_price.
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT id, name, price FROM products.",
      "Add price * 0.875 AS sale_price.",
      "Add WHERE id = '3', then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT id, name, price, price * 0.875 AS sale_price FROM products WHERE id = '3' ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT id, name, price, price * 0.875 AS sale_price FROM products WHERE id = '3' ORDER BY id;",
      },
      requiredColumns: ["id", "name", "price", "sale_price"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Cycle Depot context lookup complete",
      body: "Correct. PostgreSQL resolved the quoted product ID in its integer comparison context and used a compatible numeric literal for the sale calculation.",
      nextConcept: "Safe Casts",
    },
  },
  {
    id: "cycle-depot-convert-signup-dates",
    version: 1,
    title: "Create PostgreSQL signup-date text",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Turn Cycle Depot signup dates into text while keeping the original date values available for date work.",
    requirements: [
      "Use the customers table.",
      "Return exactly id, name, signup_text, and signup_month.",
      "Use CAST(signup_date AS text) AS signup_text.",
      "Use TO_CHAR(signup_date, 'YYYY-MM') AS signup_month.",
      "Sort the result by id.",
    ],
    requiredTables: ["customers"],
    starterSql: `-- Cycle Depot PostgreSQL date text.
-- Return id, name, signup_text, and signup_month from customers.
-- Use CAST(signup_date AS text) and TO_CHAR(signup_date, 'YYYY-MM').
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT id, name FROM customers.",
      "Add CAST(signup_date AS text) AS signup_text.",
      "Add TO_CHAR(signup_date, 'YYYY-MM') AS signup_month, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT id, name, CAST(signup_date AS text) AS signup_text, TO_CHAR(signup_date, 'YYYY-MM') AS signup_month FROM customers ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT id, name, CAST(signup_date AS text) AS signup_text, TO_CHAR(signup_date, 'YYYY-MM') AS signup_month FROM customers ORDER BY id;",
      },
      requiredColumns: ["id", "name", "signup_text", "signup_month"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Cycle Depot date text complete",
      body: "Correct. You used PostgreSQL's CAST and TO_CHAR equivalents to create text labels while keeping the customer source rows intact.",
      nextConcept: "Implicit Coercion",
    },
  },
  {
    id: "cycle-depot-format-product-identifiers",
    version: 1,
    title: "Create Cycle Depot text IDs and price labels",
    group: "start",
    difficulty: "beginner",
    dataset: "cycledepot",
    engines: ["postgres"],
    prompt:
      "Turn product IDs into text and prices into display-ready labels while preserving the original Cycle Depot values.",
    requirements: [
      "Use the products table.",
      "Return exactly id, name, product_id_text, and price_label.",
      "Use CAST(id AS text) AS product_id_text.",
      "Use TO_CHAR(price, 'FM$9,999.00') AS price_label.",
      "Sort the result by id.",
    ],
    requiredTables: ["products"],
    starterSql: `-- Cycle Depot text IDs and price labels.
-- Return id, name, product_id_text, and price_label from products.
-- Use CAST(id AS text) and TO_CHAR(price, 'FM$9,999.00').
-- Sort by id, then run and check.`,
    hints: [
      "Start with SELECT id, name FROM products.",
      "Add CAST(id AS text) AS product_id_text.",
      "Add TO_CHAR(price, 'FM$9,999.00') AS price_label, then ORDER BY id.",
    ],
    solutionSql: {
      postgres:
        "SELECT id, name, CAST(id AS text) AS product_id_text, TO_CHAR(price, 'FM$9,999.00') AS price_label FROM products ORDER BY id;",
    },
    validator: {
      kind: "result-set",
      expectedSql: {
        postgres:
          "SELECT id, name, CAST(id AS text) AS product_id_text, TO_CHAR(price, 'FM$9,999.00') AS price_label FROM products ORDER BY id;",
      },
      requiredColumns: ["id", "name", "product_id_text", "price_label"],
      columnOrder: "exact",
      rowOrder: "exact",
    },
    success: {
      title: "Cycle Depot labels complete",
      body: "Correct. You cast each product identifier to text and created a readable currency label while keeping the source product rows intact.",
      nextConcept: "CONVERT",
    },
  },
];

export function getChallenges(
  dataset: ChallengeDataset,
  engine: ChallengeEngine,
): ChallengeDefinition[] {
  return CHALLENGES.filter((c) => c.dataset === dataset && c.engines.includes(engine));
}

export function getChallenge(id: string): ChallengeDefinition | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
