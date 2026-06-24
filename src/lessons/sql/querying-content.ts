// Rich lesson content for SQL "Querying Data". Each lesson is composed of
// typed sections rendered by src/routes/sql.querying.$topic.$lesson.tsx.

import type { LessonContent, FoundationTopicMeta } from "./foundations-content";

// ---------- FILTERING & PREDICATES ----------

const booleanLogic: LessonContent = {
  slug: "boolean-logic",
  title: "Boolean Logic & Predicates",
  subtitle: "AND, OR, NOT, precedence, and how the engine evaluates a WHERE clause row by row.",
  sections: [
    {
      kind: "prose",
      heading: "WHERE is a per-row truth test",
      body: [
        "Every WHERE clause is a boolean expression that the engine evaluates once per candidate row. If the expression returns TRUE the row survives; FALSE or UNKNOWN drops it. That single rule — UNKNOWN drops — is what makes NULL so dangerous in filters.",
        "AND, OR, NOT have the same precedence rules as most languages: NOT binds tighter than AND, and AND binds tighter than OR. When in doubt, parenthesize — the parser does what you typed, not what you meant.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "Stacked predicates filter the row stream",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Precedence matters",
      code: `-- These two queries return DIFFERENT rows.
SELECT * FROM products
WHERE  category = 'pen' OR category = 'pencil' AND price < 5;
-- parsed as:  category='pen' OR (category='pencil' AND price < 5)

SELECT * FROM products
WHERE (category = 'pen' OR category = 'pencil') AND price < 5;
-- both categories, both must be cheap`,
    },
    {
      kind: "table",
      caption: "Three-valued truth table",
      headers: ["A", "B", "A AND B", "A OR B", "NOT A"],
      rows: [
        ["TRUE", "TRUE", "TRUE", "TRUE", "FALSE"],
        ["TRUE", "FALSE", "FALSE", "TRUE", "FALSE"],
        ["TRUE", "NULL", "NULL", "TRUE", "FALSE"],
        ["FALSE", "NULL", "FALSE", "NULL", "TRUE"],
        ["NULL", "NULL", "NULL", "NULL", "NULL"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Put the cheapest, most selective predicate first",
      body: "PostgreSQL's planner reorders predicates by selectivity, but writing them in your intended order makes EXPLAIN plans easier to read and intent obvious to the next human.",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE keeps rows where the predicate is TRUE — UNKNOWN drops the row.",
        "Precedence: NOT > AND > OR. Parenthesize when mixing.",
        "Three-valued logic means NULL infects everything.",
        "Order predicates by selectivity for readability and clarity.",
      ],
    },
  ],
};

const inBetweenLike: LessonContent = {
  slug: "in-between-like",
  title: "IN, BETWEEN, LIKE & ILIKE",
  subtitle: "Set membership, ranges, and pattern matching — and what each one does to your index.",
  sections: [
    {
      kind: "prose",
      heading: "The shorthand family",
      body: [
        "These four operators are just sugar over expressions you could write the long way — but they read better, run identically fast, and (importantly) communicate intent. Use them.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Each one expanded",
      code: `-- IN is just OR
WHERE  status IN ('paid','shipped')
-- is identical to:
WHERE  status = 'paid' OR status = 'shipped';

-- BETWEEN is INCLUSIVE on both ends
WHERE  price BETWEEN 10 AND 50
-- is identical to:
WHERE  price >= 10 AND price <= 50;

-- LIKE is case-sensitive, ILIKE is not (PostgreSQL)
WHERE  email LIKE  '%@acme.com'    -- matches 'a@acme.com'
WHERE  email ILIKE '%@ACME.com'    -- matches 'a@acme.COM' too`,
    },
    {
      kind: "table",
      caption: "LIKE wildcards",
      headers: ["Pattern", "Matches", "Doesn't match"],
      rows: [
        ["'pen%'", "pen, pencil, pendant", "open"],
        ["'%pen'", "pen, open", "pencil"],
        ["'%pen%'", "pen, pencil, open", "(matches anything containing 'pen')"],
        ["'p_n'", "pan, pen, pin", "open, pun"],
        ["'\\_%'", "_anything", "anything (literal underscore)"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "LIKE '%x%' can't use a b-tree index",
      body: "An anchored prefix LIKE 'pen%' uses an index. An unanchored '%pen%' forces a sequential scan. For substring search at scale, use full-text search (tsvector + GIN) or a trigram index (pg_trgm).",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Trigram index for fast substring search",
      code: `CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_name_trgm
  ON products USING GIN (name gin_trgm_ops);

-- now this is fast:
SELECT * FROM products WHERE name ILIKE '%pen%';`,
    },
    {
      kind: "takeaways",
      items: [
        "IN = many ORs. BETWEEN is inclusive on both ends.",
        "ILIKE is case-insensitive LIKE (Postgres-specific).",
        "LIKE 'x%' is index-friendly; '%x%' is not.",
        "Use pg_trgm + GIN for fast substring / fuzzy search.",
      ],
    },
  ],
};

const nullPitfalls: LessonContent = {
  slug: "null-pitfalls",
  title: "NULL Pitfalls in Filters",
  subtitle: "The query that 'should return rows but doesn't' — almost always a NULL bug.",
  sections: [
    {
      kind: "prose",
      heading: "NULL silently empties result sets",
      body: [
        "Because any comparison with NULL returns NULL, a single unexpected NULL inside a NOT IN subquery can wipe out your entire result. This is the #1 source of 'why is this query returning zero rows?' bugs in production SQL.",
      ],
    },
    {
      kind: "animation",
      variant: "null-truth",
      caption: "Three-valued logic — reminder",
    },
    {
      kind: "code",
      language: "sql",
      caption: "The classic NOT IN trap",
      code: `-- Suppose blocked_users.user_id can be NULL for any reason.
SELECT id FROM users
WHERE  id NOT IN (SELECT user_id FROM blocked_users);
-- If even ONE blocked_users.user_id is NULL,
-- the comparison becomes id <> NULL which is UNKNOWN,
-- and EVERY row is dropped. Result: 0 rows.

-- Safe rewrite with NOT EXISTS:
SELECT id FROM users u
WHERE  NOT EXISTS (
  SELECT 1 FROM blocked_users b WHERE b.user_id = u.id
);`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Prefer NOT EXISTS over NOT IN",
      body: "NOT EXISTS is NULL-safe — a missing row is just a missing row. NOT IN treats NULL as 'unknown', which propagates UNKNOWN through every comparison.",
    },
    {
      kind: "table",
      caption: "NULL-safe alternatives",
      headers: ["Risky", "NULL-safe"],
      rows: [
        ["a = b", "a IS NOT DISTINCT FROM b"],
        ["a <> b", "a IS DISTINCT FROM b"],
        ["x NOT IN (subquery with NULLs)", "NOT EXISTS (correlated subquery)"],
        ["count(col)", "count(*)  — count(col) ignores NULLs"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Any comparison with NULL returns NULL (UNKNOWN), not FALSE.",
        "Use IS NULL / IS NOT NULL — never = NULL.",
        "Prefer NOT EXISTS over NOT IN.",
        "IS [NOT] DISTINCT FROM treats NULL as a value for equality.",
      ],
    },
  ],
};

// ---------- AGGREGATIONS & GROUP BY ----------

const aggregateFns: LessonContent = {
  slug: "aggregate-functions",
  title: "Aggregate Functions",
  subtitle: "COUNT, SUM, AVG, MIN, MAX — and the NULL / DISTINCT subtleties that change the result.",
  sections: [
    {
      kind: "prose",
      heading: "An aggregate eats many rows, returns one value",
      body: [
        "Aggregates collapse a set of rows into a single scalar. Without GROUP BY, the entire result is one group — the aggregate sees every row. With GROUP BY, the aggregate runs once per group.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "The five you'll use constantly",
      code: `SELECT
  count(*)            AS total_rows,
  count(email)        AS rows_with_email,   -- NULLs excluded
  count(DISTINCT plan) AS plan_variants,
  sum(amount_cents)   AS revenue,
  avg(amount_cents)   AS avg_ticket,
  min(created_at)     AS first_signup,
  max(created_at)     AS latest_signup
FROM users;`,
    },
    {
      kind: "table",
      caption: "NULL behavior of aggregates",
      headers: ["Aggregate", "Treatment of NULL", "Returns on empty input"],
      rows: [
        ["count(*)", "Counts every row, NULL or not", "0"],
        ["count(col)", "Skips NULL values", "0"],
        ["sum(col)", "Skips NULL; sum of nothing is NULL", "NULL"],
        ["avg(col)", "Skips NULL", "NULL"],
        ["min/max(col)", "Skips NULL", "NULL"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "sum() of zero rows is NULL, not 0",
      body: "Wrap with COALESCE if the downstream code expects a number: COALESCE(SUM(amount_cents), 0). Same goes for AVG and MAX on potentially empty groups.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "FILTER — conditional aggregation done right",
      code: `-- Old way: messy CASE inside SUM/COUNT
SELECT count(CASE WHEN status='paid'    THEN 1 END) AS paid,
       count(CASE WHEN status='refunded' THEN 1 END) AS refunded
FROM orders;

-- Modern way: FILTER clause (SQL standard, Postgres-supported)
SELECT count(*) FILTER (WHERE status='paid')     AS paid,
       count(*) FILTER (WHERE status='refunded') AS refunded
FROM orders;`,
    },
    {
      kind: "takeaways",
      items: [
        "count(*) counts rows; count(col) skips NULLs.",
        "sum/avg/min/max ignore NULLs and return NULL on empty input.",
        "COALESCE(SUM(...), 0) defends against empty groups.",
        "Use FILTER (WHERE …) for conditional aggregation — cleaner than CASE.",
      ],
    },
  ],
};

const groupByLesson: LessonContent = {
  slug: "group-by",
  title: "GROUP BY",
  subtitle: "How rows collapse into buckets — and the rule that catches every beginner.",
  sections: [
    {
      kind: "prose",
      heading: "GROUP BY rewires the meaning of a row",
      body: [
        "After GROUP BY, the result row is no longer a single source row — it represents a group of rows. The only things you can SELECT are: the grouping columns themselves, and aggregates over the rest. Everything else is ambiguous and the engine will reject it.",
      ],
    },
    {
      kind: "animation",
      variant: "group-by-agg",
      caption: "From raw rows to group rows",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Revenue per region",
      code: `SELECT region,
       count(*)         AS deals,
       sum(amount)      AS revenue,
       avg(amount)::int AS avg_deal
FROM   sales
GROUP  BY region
ORDER  BY revenue DESC;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Every non-aggregate column must appear in GROUP BY",
      body: "SELECT region, country, sum(amount) FROM sales GROUP BY region; — fails. The engine doesn't know which country to show per region. Add country to GROUP BY, or aggregate it (min(country), array_agg(country)).",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Grouping by an expression",
      code: `-- Group by month — date_trunc gives a TIMESTAMPTZ per bucket
SELECT date_trunc('month', placed_at) AS month,
       count(*)         AS orders,
       sum(total_cents) AS revenue
FROM   orders
GROUP  BY date_trunc('month', placed_at)
ORDER  BY month;`,
    },
    {
      kind: "prose",
      heading: "Cardinality intuition",
      body: [
        "If GROUP BY user_id produces 10,000 rows, you have 10,000 distinct users. The number of result rows = number of distinct combinations of the grouping columns. That's a useful sanity check before running a query that might blow up your client.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "GROUP BY collapses rows into buckets; aggregates summarize each bucket.",
        "Non-aggregate SELECT columns must appear in GROUP BY.",
        "You can GROUP BY an expression — just repeat the expression.",
        "Result row count = distinct combinations of grouping columns.",
      ],
    },
  ],
};

const havingLesson: LessonContent = {
  slug: "having-grouping-sets",
  title: "HAVING & GROUPING SETS",
  subtitle: "Filter groups (not rows) and aggregate multiple ways in a single pass.",
  sections: [
    {
      kind: "prose",
      heading: "HAVING is WHERE for groups",
      body: [
        "WHERE filters individual rows before grouping. HAVING filters whole groups after the aggregates have been computed. Trying to filter on an aggregate in WHERE is a syntax error — that's exactly what HAVING is for.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "WHERE vs HAVING",
      code: `-- Top customers in the last 30 days who placed >= 3 orders
SELECT customer_id,
       count(*)         AS orders,
       sum(total_cents) AS revenue
FROM   orders
WHERE  placed_at >= now() - INTERVAL '30 days'   -- row filter
GROUP  BY customer_id
HAVING count(*) >= 3                              -- group filter
ORDER  BY revenue DESC;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Push filters into WHERE when possible",
      body: "Predicates that don't depend on aggregates belong in WHERE — they shrink the row stream before the expensive group/aggregate step runs. HAVING is for predicates that genuinely need the aggregate value.",
    },
    {
      kind: "prose",
      heading: "GROUPING SETS, ROLLUP, CUBE",
      body: [
        "Sometimes you need totals at multiple granularities — by region, by region+product, and the grand total — all in one query. GROUPING SETS (and its shortcuts ROLLUP and CUBE) compute multiple GROUP BYs in a single pass.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Grand total + per-region in one query",
      code: `SELECT region,
       product,
       sum(amount) AS revenue
FROM   sales
GROUP  BY GROUPING SETS (
  (region, product),   -- detail
  (region),            -- per region subtotal
  ()                   -- grand total
);

-- ROLLUP is shorthand for a hierarchy
GROUP BY ROLLUP (region, product);
-- expands to: (region,product), (region), ()`,
    },
    {
      kind: "table",
      caption: "Which to reach for",
      headers: ["You want", "Use"],
      rows: [
        ["Filter individual rows", "WHERE"],
        ["Filter whole groups", "HAVING"],
        ["Subtotals at picked levels", "GROUPING SETS (...)"],
        ["Hierarchical subtotals + grand total", "ROLLUP (...)"],
        ["All combinations of grouping columns", "CUBE (...)"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "WHERE filters rows; HAVING filters groups.",
        "Push non-aggregate predicates into WHERE for performance.",
        "GROUPING SETS lets you aggregate at multiple levels in one pass.",
        "ROLLUP = hierarchy; CUBE = all combinations.",
      ],
    },
  ],
};

// ---------- JOINS ----------

const innerOuter: LessonContent = {
  slug: "inner-outer-joins",
  title: "INNER & OUTER Joins",
  subtitle: "INNER, LEFT, RIGHT, FULL — pick the join that matches the shape of the question.",
  sections: [
    {
      kind: "prose",
      heading: "A join is a per-row match-and-multiply",
      body: [
        "JOIN takes two relations and produces a third by pairing rows that satisfy the ON predicate. INNER drops unmatched rows on both sides. OUTER joins keep unmatched rows from one or both sides and fill the missing columns with NULL.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "Same data, four different joins",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Four joins, one schema",
      code: `-- INNER: only users with at least one order
SELECT u.name, o.id, o.total
FROM   users u
JOIN   orders o ON o.user_id = u.id;

-- LEFT: every user; NULL on the order side if none
SELECT u.name, o.id, o.total
FROM   users u
LEFT JOIN orders o ON o.user_id = u.id;

-- RIGHT: every order; NULL on the user side if orphaned
SELECT u.name, o.id, o.total
FROM   users u
RIGHT JOIN orders o ON o.user_id = u.id;

-- FULL OUTER: every user AND every order, NULLs on either side
SELECT u.name, o.id, o.total
FROM   users u
FULL OUTER JOIN orders o ON o.user_id = u.id;`,
    },
    {
      kind: "diagram",
      caption: "Join shapes at a glance",
      ascii: `INNER          LEFT           RIGHT          FULL
 ┌─┐ ┌─┐       ┌─┐ ┌─┐       ┌─┐ ┌─┐       ┌─┐ ┌─┐
 │A│∩│B│        │A│⟕│B│       │A│⟖│B│       │A│⟗│B│
 └─┘ └─┘       └─┘ └─┘       └─┘ └─┘       └─┘ └─┘
 matched       all A         all B         all A + all B`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A condition in WHERE undoes a LEFT JOIN",
      body: "WHERE o.status = 'paid' on a LEFT JOIN drops every user without an order (because NULL = 'paid' is UNKNOWN). Put the predicate in the ON clause to preserve the outer row.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Where the predicate lives matters",
      code: `-- BUG: silently turns the LEFT JOIN into an INNER JOIN
SELECT u.name, o.id
FROM   users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE  o.status = 'paid';

-- FIX: move the predicate into ON
SELECT u.name, o.id
FROM   users u
LEFT JOIN orders o
       ON o.user_id = u.id AND o.status = 'paid';`,
    },
    {
      kind: "takeaways",
      items: [
        "INNER keeps only matched rows; OUTER keeps unmatched rows and fills NULLs.",
        "LEFT is the most common OUTER join in app code.",
        "FULL OUTER is the union of LEFT + RIGHT — every row from both sides.",
        "Predicates on the outer table must live in ON, not WHERE, or the outer-ness is lost.",
      ],
    },
  ],
};

const selfCross: LessonContent = {
  slug: "self-cross-joins",
  title: "Self Joins & CROSS JOIN",
  subtitle: "Same table twice, and the every-combination join.",
  sections: [
    {
      kind: "prose",
      heading: "A table joined with itself",
      body: [
        "A self join is the same physical table referenced twice with two different aliases — useful any time rows in a table relate to other rows in the same table: org charts, friend pairs, sequential events.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Employees and their managers",
      code: `-- employees(id, name, manager_id REFERENCES employees(id))
SELECT  e.name      AS employee,
        m.name      AS manager
FROM    employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY manager NULLS FIRST, employee;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Comparing consecutive rows with a self join (without window functions)",
      code: `-- Pairs of orders by the same customer placed 7+ days apart
SELECT a.id AS first_order,
       b.id AS later_order,
       b.placed_at - a.placed_at AS gap
FROM   orders a
JOIN   orders b
       ON b.customer_id = a.customer_id
      AND b.placed_at  >= a.placed_at + INTERVAL '7 days';`,
    },
    {
      kind: "prose",
      heading: "CROSS JOIN — every row paired with every row",
      body: [
        "CROSS JOIN produces the Cartesian product. 100 rows × 100 rows = 10,000 rows. It's intentional for things like generating a calendar × users matrix; accidental when you forget the join condition and watch your query try to return a billion rows.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Intentional CROSS JOIN — a date scaffold per user",
      code: `-- One row per (user, day) for the last 7 days,
-- regardless of whether the user did anything that day.
SELECT u.id, d.day
FROM   users u
CROSS JOIN generate_series(
  date_trunc('day', now()) - INTERVAL '6 days',
  date_trunc('day', now()),
  INTERVAL '1 day'
) AS d(day);`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Forgotten ON = accidental CROSS JOIN",
      body: "FROM a, b without a WHERE that joins them is a Cartesian product. Always prefer explicit JOIN ... ON syntax — it makes a missing condition a syntax error instead of a 10-million-row result.",
    },
    {
      kind: "takeaways",
      items: [
        "Self join = same table, two aliases — for hierarchies and pairings.",
        "CROSS JOIN produces every combination. Useful for scaffolds; dangerous when accidental.",
        "Always use explicit JOIN syntax to make missing conditions impossible.",
        "generate_series + CROSS JOIN is the standard way to build dense time-series rows.",
      ],
    },
  ],
};

const semiAnti: LessonContent = {
  slug: "semi-anti-joins",
  title: "SEMI & ANTI Joins (EXISTS / NOT EXISTS)",
  subtitle: "Filter rows by whether a related row exists — without duplicating them.",
  sections: [
    {
      kind: "prose",
      heading: "Sometimes you don't want the other table's columns",
      body: [
        "A semi join asks 'does at least one matching row exist on the other side?' and returns the left side once. An anti join asks 'does NO matching row exist?'. SQL doesn't spell them SEMI / ANTI — you write them with EXISTS / NOT EXISTS.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Semi join via EXISTS",
      code: `-- Users who have placed at least one order
SELECT u.id, u.email
FROM   users u
WHERE  EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Same question, wrong tool",
      code: `-- BUG: a regular JOIN duplicates users by their order count
SELECT u.id, u.email
FROM   users u
JOIN   orders o ON o.user_id = u.id;
-- A user with 5 orders shows up 5 times.
-- Adding DISTINCT works but is wasteful — the engine builds
-- and then deduplicates a large join.`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Anti join via NOT EXISTS",
      code: `-- Users who have NEVER ordered
SELECT u.id, u.email
FROM   users u
WHERE  NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
    },
    {
      kind: "table",
      caption: "Pick the right tool",
      headers: ["Goal", "Use"],
      rows: [
        ["Filter LEFT by 'at least one match exists'", "EXISTS (semi join)"],
        ["Filter LEFT by 'no matching row exists'", "NOT EXISTS (anti join)"],
        ["Also need columns from the right side", "INNER JOIN"],
        ["Need every left row + matching right columns", "LEFT JOIN"],
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "EXISTS short-circuits",
      body: "EXISTS stops scanning the subquery the instant it finds one matching row. For a user with 10,000 orders, EXISTS reads one. A JOIN + DISTINCT reads all 10,000.",
    },
    {
      kind: "takeaways",
      items: [
        "EXISTS = semi join: keep the left row once if a match exists.",
        "NOT EXISTS = anti join: keep the left row if NO match exists.",
        "EXISTS is NULL-safe; NOT IN is not.",
        "Reach for EXISTS instead of JOIN+DISTINCT when you don't need the right-side columns.",
      ],
    },
  ],
};

// ---------- SUBQUERIES & SET OPS ----------

const scalarCorrelated: LessonContent = {
  slug: "scalar-and-correlated",
  title: "Scalar & Correlated Subqueries",
  subtitle: "A subquery is a query that runs inside another — the where, when, and how-fast.",
  sections: [
    {
      kind: "prose",
      heading: "Three places a subquery can live",
      body: [
        "A scalar subquery returns one row and one column — it can be used anywhere a value is expected (SELECT list, WHERE clause). A derived-table subquery returns a relation and lives in the FROM clause. A correlated subquery references a column from the outer query, so it re-runs once per outer row.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Scalar subquery — one value, used inline",
      code: `-- Each user, plus the global average revenue
SELECT u.id, u.email,
       (SELECT avg(total_cents) FROM orders) AS global_avg
FROM   users u;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Correlated subquery — one query per outer row",
      code: `-- Each user with their most recent order total
SELECT u.id, u.email,
       (SELECT o.total_cents
        FROM   orders o
        WHERE  o.user_id = u.id          -- references outer u
        ORDER  BY o.placed_at DESC
        LIMIT  1) AS last_order_cents
FROM   users u;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Correlated subqueries can become N+1 inside a single query",
      body: "A correlated subquery executes once per outer row. With 1M users, that's 1M subqueries. The planner often rewrites it into a join — but not always. EXPLAIN and look for a 'SubPlan' node executed per row.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Same answer with a LATERAL join — often faster",
      code: `SELECT u.id, u.email, last.total_cents
FROM   users u
LEFT JOIN LATERAL (
  SELECT o.total_cents
  FROM   orders o
  WHERE  o.user_id = u.id
  ORDER  BY o.placed_at DESC
  LIMIT  1
) last ON true;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Derived table — subquery in FROM",
      code: `SELECT region, top_deal
FROM (
  SELECT region, max(amount) AS top_deal
  FROM   sales
  GROUP  BY region
) AS r
WHERE top_deal > 1000;`,
    },
    {
      kind: "takeaways",
      items: [
        "Scalar: returns 1×1; safe in SELECT and WHERE.",
        "Derived table: subquery in FROM; treated as a relation.",
        "Correlated: references the outer row; re-runs per outer row.",
        "LATERAL is the modern, predictable replacement for many correlated subqueries.",
      ],
    },
  ],
};

const existsInLesson: LessonContent = {
  slug: "exists-vs-in",
  title: "EXISTS vs IN vs JOIN",
  subtitle: "Three tools, slightly different behavior — and the NULL trap that picks the winner.",
  sections: [
    {
      kind: "prose",
      heading: "They look interchangeable. They aren't.",
      body: [
        "EXISTS, IN, and JOIN can often express the same question, but they have different NULL behavior and different performance characteristics. Choose deliberately.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Three ways to ask 'users who ordered'",
      code: `-- 1) EXISTS — semi join, NULL-safe
SELECT u.id FROM users u
WHERE  EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 2) IN — also fine here; risky if subquery returns NULLs
SELECT u.id FROM users u
WHERE  u.id IN (SELECT user_id FROM orders);

-- 3) JOIN + DISTINCT — works but materializes the whole join
SELECT DISTINCT u.id
FROM   users u
JOIN   orders o ON o.user_id = u.id;`,
    },
    {
      kind: "table",
      caption: "Decision matrix",
      headers: ["Question", "Best fit", "Why"],
      rows: [
        ["At least one match exists?", "EXISTS", "Short-circuits; NULL-safe"],
        ["Value in a fixed small list?", "IN ('a','b','c')", "Reads cleanly"],
        ["Value NOT in a (possibly NULL) set?", "NOT EXISTS", "NOT IN breaks on NULL"],
        ["Need columns from the other side?", "JOIN", "Only join gives you both projections"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Modern planners often rewrite EXISTS ↔ IN",
      body: "PostgreSQL turns IN (subquery) into a semi-join and EXISTS into a semi-join — they often produce identical plans. The deciding factor is correctness around NULL, not performance.",
    },
    {
      kind: "takeaways",
      items: [
        "EXISTS = semi join; NOT EXISTS = anti join. Both NULL-safe.",
        "IN is fine for fixed lists; risky for subqueries that might return NULL.",
        "JOIN + DISTINCT works but pays for the full join + dedup.",
        "Pick by NULL behavior first, performance second.",
      ],
    },
  ],
};

const unionSetOps: LessonContent = {
  slug: "union-set-ops",
  title: "UNION, INTERSECT, EXCEPT",
  subtitle: "Stack and compare result sets — and remember UNION dedupes, UNION ALL doesn't.",
  sections: [
    {
      kind: "prose",
      heading: "Vertical combination of relations",
      body: [
        "Set operators stack two queries on top of each other. The two queries must have the same number of columns with compatible types — column names come from the first SELECT.",
      ],
    },
    {
      kind: "animation",
      variant: "set-ops",
      caption: "UNION, INTERSECT, EXCEPT side by side",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Three operators, same shape",
      code: `-- UNION removes duplicates (sort/hash pass)
SELECT email FROM customers
UNION
SELECT email FROM leads;

-- UNION ALL keeps duplicates — much faster, use when you know there are none
SELECT email FROM customers
UNION ALL
SELECT email FROM leads;

-- INTERSECT — rows in BOTH queries
SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_subs;

-- EXCEPT — in first query, NOT in second (a.k.a. MINUS)
SELECT email FROM customers
EXCEPT
SELECT email FROM unsubscribed;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "UNION is not free",
      body: "UNION (without ALL) sorts or hashes both sides to deduplicate — O(n log n) at best. If you know there are no duplicates (or you don't care), UNION ALL is always faster.",
    },
    {
      kind: "table",
      caption: "Set ops at a glance",
      headers: ["Operator", "Keeps", "Dedups?"],
      rows: [
        ["UNION", "Rows in A or B", "Yes"],
        ["UNION ALL", "Rows in A or B (incl. duplicates)", "No"],
        ["INTERSECT", "Rows in both A and B", "Yes"],
        ["EXCEPT", "Rows in A but not in B", "Yes"],
      ],
    },
    {
      kind: "prose",
      heading: "Ordering and limits apply to the whole stack",
      body: [
        "ORDER BY and LIMIT bind to the final combined result, not each SELECT — they must appear last. If you need per-side ordering, wrap each SELECT in parentheses (engine-dependent).",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Column counts and types must align across all SELECTs.",
        "UNION dedupes (slow); UNION ALL doesn't (fast).",
        "INTERSECT and EXCEPT also dedupe.",
        "ORDER BY / LIMIT apply to the final combined result.",
      ],
    },
  ],
};

// ---------- TOPIC INDEX ----------

export const QUERYING_TOPICS: Record<string, FoundationTopicMeta> = {
  filtering: {
    slug: "filtering",
    title: "Filtering & Predicates",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "AND/OR/NOT, IN, BETWEEN, LIKE, ILIKE — and the NULL three-valued logic trap that empties result sets.",
    lessons: [booleanLogic, inBetweenLike, nullPitfalls],
  },
  aggregations: {
    slug: "aggregations",
    title: "Aggregations & GROUP BY",
    category: "Querying Data",
    iconKey: "database",
    blurb:
      "COUNT, SUM, AVG, MIN, MAX, FILTER, HAVING — and what GROUP BY actually does to a row.",
    lessons: [aggregateFns, groupByLesson, havingLesson],
  },
  joins: {
    slug: "joins",
    title: "Joins",
    category: "Querying Data",
    iconKey: "table",
    blurb:
      "INNER, LEFT, RIGHT, FULL, SEMI, ANTI, CROSS — pick the right join for the shape of the data.",
    lessons: [innerOuter, selfCross, semiAnti],
  },
  subqueries: {
    slug: "subqueries",
    title: "Subqueries & Set Ops",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "Scalar, correlated, EXISTS, UNION/INTERSECT/EXCEPT — when a subquery beats a join.",
    lessons: [scalarCorrelated, existsInLesson, unionSetOps],
  },
};
