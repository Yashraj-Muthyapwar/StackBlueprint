// Rich lesson content for SQL "Querying Data" — DataVizCore curriculum.
// Each lesson follows the 5-section protocol:
//   1. The 'Why' (Conceptual Anchor)
//   2. Visual Logic (Animation Blueprint)
//   3. Technical Implementation (Syntax & Execution)
//   4. The Progression Path (LeetCode evaluation matrix)
//   5. Engineering 'Gotchas' & Compliance

import type { LessonContent, FoundationTopicMeta } from "./foundations-content";

// =============================================================
// MODULE 1: FILTERING & PREDICATES
// =============================================================

// ---------- 1.1 Boolean Logic (AND / OR / NOT) ----------
const booleanLogic: LessonContent = {
  slug: "boolean-logic",
  title: "1.1 Boolean Logic (AND / OR / NOT)",
  subtitle: "Order of precedence, short-circuit paths, and the three-valued truth table.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Compound predicates are how an engine carves a billion-row stream into the precise sliver an analyst actually wants — get the boolean algebra wrong and the report silently lies.",
        "Think of WHERE as a hardware logic gate stacked per row: NOT inverters fire first, AND gates fuse signals next, and OR multiplexers merge the survivors — exactly like a CPU's ALU evaluating a conditional jump.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "Per-row predicate evaluation — survivors flow down, rejects fade out.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: render the source table as a vertical stack of row cards on the left canvas; each card shows id, category, price. A predicate ribbon (AND/OR/NOT tokens) materialises on the right with precedence brackets greyed out.",
        "Phase 2 — Action: a scanner bar glides top-to-bottom across the row stack. As it touches a card, the NOT token pulses first, the AND token tints the row amber, the OR token fans into two branches; rows whose final truth value is TRUE arc rightward into the result viewport, FALSE rows compress to 30% opacity and slide left into a discard tray, UNKNOWN rows shimmer purple and fall into the same discard tray.",
        "Phase 3 — Final State: the result viewport holds only TRUE rows in their original order; a precedence overlay locks in showing the parsed tree (NOT → AND → OR) for the executed query.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Precedence in action — two queries, two answers",
      code: `-- /* Phase 1: load product rows into the scanner */
SELECT id, category, price
FROM   products
-- /* Phase 2a: parsed as  category='pen' OR (category='pencil' AND price < 5) */
WHERE  category = 'pen'
   OR  category = 'pencil'
  AND  price   < 5;

-- /* Phase 2b: parentheses force OR to evaluate first, AND second */
SELECT id, category, price
FROM   products
WHERE (category = 'pen' OR category = 'pencil')   -- /* OR branch fans first */
  AND  price < 5;                                  -- /* AND gate prunes survivors */
-- /* Phase 3: only cheap pens & pencils reach the result viewport */`,
    },
    {
      kind: "table",
      caption: "Three-valued truth table — UNKNOWN is contagious",
      headers: ["A", "B", "A AND B", "A OR B", "NOT A"],
      rows: [
        ["TRUE", "TRUE", "TRUE", "TRUE", "FALSE"],
        ["TRUE", "FALSE", "FALSE", "TRUE", "FALSE"],
        ["TRUE", "UNKNOWN", "UNKNOWN", "TRUE", "FALSE"],
        ["FALSE", "UNKNOWN", "FALSE", "UNKNOWN", "TRUE"],
        ["UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN", "UNKNOWN"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [595]", "Big Countries", "Single OR predicate, basic WHERE syntactic validation."],
        ["Drill [627]", "Swap Salary", "NOT / CASE on a single boolean condition, pure implementation."],
        ["Challenge [184]", "Department Highest Salary", "Boolean predicates fused with aggregation + join."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — operator precedence ambushes",
      body: "AND binds tighter than OR. `a OR b AND c` is parsed as `a OR (b AND c)` — most developers read it left-to-right and ship a query that silently widens the result set. Always parenthesize mixed operators; the parser does what you typed, not what you meant.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "The PostgreSQL planner reorders predicates by estimated selectivity from pg_statistic, then push-down evaluates them as a short-circuited expression tree. A poorly ordered OR can suppress an index scan and force a sequential scan over the whole heap — confirm with EXPLAIN (ANALYZE, BUFFERS) before promoting to production.",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE keeps rows where the predicate is TRUE — FALSE and UNKNOWN both drop.",
        "Precedence: NOT > AND > OR — parenthesize whenever mixing.",
        "Three-valued logic means a single NULL can collapse an entire filter.",
        "EXPLAIN ANALYZE is the only ground truth for predicate selectivity.",
      ],
    },
  ],
};

// ---------- 1.2 Range & Set Filtering (IN / BETWEEN) ----------
const inBetween: LessonContent = {
  slug: "in-between",
  title: "1.2 Range & Set Filtering (IN / BETWEEN)",
  subtitle: "Inclusive boundaries, set transformation mechanics, and the OR rewrite the optimizer performs.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Hand-rolling `x = 1 OR x = 2 OR x = 3 OR …` for membership tests is unreadable and unindexable — IN and BETWEEN compress that into a single declarative predicate the optimizer can re-plan as an index range scan.",
        "Mentally, IN is a hash-set probe (O(1) average lookup against a tiny in-memory set) and BETWEEN is a B-Tree index seek to the low key followed by a linear walk to the high key — identical to a sorted-array bisect_left / bisect_right pair.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "IN fans the row against a set probe; BETWEEN clamps it inside a range visor.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: source rows fan out on the left; a yellow probe-set chip `{2, 4, 6}` floats top-right, and a green range visor `[10, 20]` floats bottom-right. All rows start at 100% opacity.",
        "Phase 2 — Action: each row arcs upward into the probe-set; matching ids glow yellow and pass through, misses dim to 40% opacity. The same rows then arc downward into the range visor; ids inside [10, 20] glow green and snap to the result viewport, outliers compress to a discard tray.",
        "Phase 3 — Final State: result viewport contains only rows that satisfied IN OR BETWEEN; an overlay shows the equivalent OR-rewrite the planner generated.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "IN is set membership; BETWEEN is a closed interval",
      code: `-- /* Phase 1: scan orders table */
SELECT order_id, customer_id, amount
FROM   orders
WHERE  customer_id IN (2, 4, 6)          -- /* Phase 2a: hash-probe each row against {2,4,6} */
  AND  amount      BETWEEN 10 AND 20;    -- /* Phase 2b: range visor — inclusive on both ends */

-- /* Equivalent expansion the planner generates internally */
SELECT order_id, customer_id, amount
FROM   orders
WHERE (customer_id = 2 OR customer_id = 4 OR customer_id = 6)
  AND  amount >= 10
  AND  amount <= 20;                     -- /* Phase 3: surviving rows reach the viewport */`,
    },
    {
      kind: "table",
      caption: "Inclusivity at a glance",
      headers: ["Operator", "Low bound", "High bound", "Index usage"],
      rows: [
        ["BETWEEN a AND b", "inclusive", "inclusive", "B-Tree range scan"],
        ["x >= a AND x < b", "inclusive", "exclusive", "B-Tree range scan"],
        ["IN (v1, v2, …)", "set match", "set match", "Bitmap index scan if list is small"],
        ["NOT IN (v1, …, NULL)", "n/a", "n/a", "DANGER — see Logic Trap"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [183]", "Customers Who Never Order", "Basic IN / NOT IN syntactic validation."],
        ["Drill [1148]", "Article Views I", "Pure IN-style equality vs. distinct filtering."],
        ["Challenge [1097]", "Game Play Analysis V", "BETWEEN range filter fused with windowed aggregation."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — NOT IN with a NULL poisons the set",
      body: "`x NOT IN (1, 2, NULL)` expands to `x<>1 AND x<>2 AND x<>NULL` — the last clause evaluates to UNKNOWN, dragging the whole AND chain to UNKNOWN, and the row is dropped. Always strip NULLs from the inner set or rewrite as `NOT EXISTS`.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "PostgreSQL converts small IN lists (< 100 elements) into a ScalarArrayOpExpr — a vectorised in-memory hash probe. Above the threshold it materialises the list as an implicit VALUES join, which may degrade to a hash join. BETWEEN against an indexed column triggers an index range scan; wrapping the column in a function (e.g. `BETWEEN lower(x) AND …`) suppresses the index and forces a sequential scan.",
    },
    {
      kind: "takeaways",
      items: [
        "BETWEEN is inclusive on both ends — for half-open intervals use explicit >= / <.",
        "IN compresses N equality checks into one set probe.",
        "NOT IN + NULL silently zeroes your result set — use NOT EXISTS instead.",
        "Wrapping the indexed column in any function kills the index scan.",
      ],
    },
  ],
};

// ---------- 1.3 Pattern Matching (LIKE / ILIKE) ----------
const likeIlike: LessonContent = {
  slug: "like-ilike",
  title: "1.3 Pattern Matching (LIKE / ILIKE)",
  subtitle: "Wildcards, escaping, and why leading % destroys your B-Tree index.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Substring and prefix search are the backbone of every search bar, audit-log filter, and email-domain classifier — LIKE turns naïve string scanning into a declarative pattern the optimizer can route through an index.",
        "A LIKE pattern compiles to a tiny non-backtracking automaton, similar to a hand-coded `str.startswith` / `str.find` — anchored prefixes can ride a B-Tree the same way a sorted-array bisect locates a key.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "Anchored prefix rides the index; leading % triggers a full scan.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: render the index as a B-Tree fan on the left, and the heap table as a long row stream on the right. The pattern token `'foo%'` glows green; the pattern token `'%foo'` glows red beside it.",
        "Phase 2 — Action: for the green pattern, a focused beam descends through the B-Tree, lights one leaf node, and pulls a tight range of rows up into the viewport. For the red pattern, the beam refuses to enter the tree, snaps to the heap, and a slow horizontal sweep tints every row — the engine is reading them all.",
        "Phase 3 — Final State: viewport on top shows the prefix-matched rows with an index-scan badge; viewport on bottom shows the same rows but with a sequential-scan badge and a buffer-read counter pegged at table size.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Anchor your pattern or pay for a sequential scan",
      code: `-- /* Phase 2 (green): anchored prefix — B-Tree leaf seek */
SELECT id, email
FROM   users
WHERE  email LIKE 'admin%';        -- /* index range scan on email_idx */

-- /* Phase 2 (red): leading wildcard — index ignored */
SELECT id, email
FROM   users
WHERE  email LIKE '%@acme.com';    -- /* sequential scan over the whole heap */

-- /* Case-insensitive variant — ILIKE bypasses B-Tree unless using a citext or expression index */
SELECT id, email
FROM   users
WHERE  email ILIKE 'Admin%';       -- /* needs LOWER(email) index or citext column to stay fast */

-- /* Escaping a literal underscore inside an identifier */
SELECT *
FROM   audit_log
WHERE  action LIKE 'user\\_login%' ESCAPE '\\';  -- /* '_' is now literal, not wildcard */`,
    },
    {
      kind: "table",
      caption: "Wildcard cheatsheet",
      headers: ["Token", "Matches", "Index-friendly?"],
      rows: [
        ["%", "Zero or more characters", "Only when not leading"],
        ["_", "Exactly one character", "Only when not leading"],
        ["ESCAPE 'c'", "Treats next char literally", "n/a"],
        ["ILIKE", "Case-insensitive LIKE", "Needs functional / citext index"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1527]", "Patients With a Condition", "Basic LIKE prefix syntactic validation."],
        ["Drill [1517]", "Find Users With Valid E-Mails", "Pattern matching with escaping & regex-style anchoring."],
        ["Challenge [1683]", "Invalid Tweets", "Pattern length checks combined with predicate filtering."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — '%' is greedy and silent",
      body: "`LIKE 'a%z'` matches any string starting with 'a' and ending with 'z' — including `'az'` (zero chars between). Reviewers often miss that the wildcard matches the empty string, leading to overly permissive audit queries.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "PostgreSQL can use a B-Tree on `text_pattern_ops` for anchored LIKE. A leading wildcard suppresses the index entirely → sequential scan with O(N×M) substring cost. Migrate to a `pg_trgm` GIN index or full-text search (`tsvector`) for `%substring%` workloads; without it, a 100M-row table will read every block from disk.",
    },
    {
      kind: "takeaways",
      items: [
        "Anchored LIKE ('foo%') rides a B-Tree; leading % forces a sequential scan.",
        "ILIKE is shorthand for LOWER(col) LIKE LOWER(pat) — index it explicitly.",
        "Use ESCAPE when matching literal % or _.",
        "Reach for pg_trgm or tsvector for true substring/full-text workloads.",
      ],
    },
  ],
};

// ---------- 1.4 The NULL Pitfalls (Three-Valued Logic) ----------
const nullPitfalls: LessonContent = {
  slug: "null-pitfalls",
  title: "1.4 The NULL Pitfalls (Three-Valued Logic)",
  subtitle: "Why expression = NULL is UNKNOWN and how rows vanish silently from your filters.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "NULL represents 'unknown', not 'empty' — and every silent data-quality bug in production analytics can be traced back to forgetting that distinction.",
        "Treat NULL like a floating-point NaN: every arithmetic or comparison touching it produces NaN/UNKNOWN, and the WHERE clause drops anything that isn't a hard TRUE — exactly how `if (NaN > 0)` is always falsy in IEEE-754.",
      ],
    },
    {
      kind: "animation",
      variant: "null-truth",
      caption: "NULL = NULL evaluates UNKNOWN — the row falls through the floor.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: stack of customer rows on the left; the email column on some rows shows a translucent purple NULL token instead of text. Predicate ribbon `email = 'a@b.com'` floats top-right.",
        "Phase 2 — Action: scanner descends; rows where email equals the literal glow green and arc right; rows where email is NULL flash purple — the equality token short-circuits to UNKNOWN, the row card tilts and falls off the canvas. A second pass swaps the predicate to `email IS NULL` and the same purple rows now arc right.",
        "Phase 3 — Final State: viewport shows two side-by-side panes — `= NULL` returns zero rows, `IS NULL` returns every NULL row.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Use IS NULL — never = NULL",
      code: `-- /* Phase 2a: WRONG — equality with NULL is UNKNOWN, the row is dropped */
SELECT id, email
FROM   customers
WHERE  email = NULL;          -- /* always returns 0 rows */

-- /* Phase 2b: RIGHT — IS NULL is a special two-valued predicate */
SELECT id, email
FROM   customers
WHERE  email IS NULL;         -- /* returns every row with unknown email */

-- /* Defensive coalesce inside a complex predicate */
SELECT id, COALESCE(email, 'unknown') AS email_safe
FROM   customers
WHERE  COALESCE(email, '') <> '';   -- /* treat NULL as empty for the filter */

-- /* DISTINCT FROM is the NULL-safe inequality operator */
SELECT id
FROM   customers
WHERE  email IS DISTINCT FROM 'admin@x.com';   -- /* NULL counts as "different" */`,
    },
    {
      kind: "table",
      caption: "NULL truth-table summary",
      headers: ["Expression", "Result", "Row kept?"],
      rows: [
        ["NULL = NULL", "UNKNOWN", "No"],
        ["NULL <> NULL", "UNKNOWN", "No"],
        ["NULL IS NULL", "TRUE", "Yes"],
        ["NULL IS NOT NULL", "FALSE", "No"],
        ["NULL IS DISTINCT FROM 1", "TRUE", "Yes"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [183]", "Customers Who Never Order", "Pure IS NULL filtering after a LEFT JOIN."],
        ["Drill [1142]", "User Activity for the Past 30 Days II", "Aggregate-with-NULL handling via COALESCE."],
        ["Challenge [1853]", "Convert Date Format", "NULL-safe expressions combined with formatting."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — silent row loss in NOT IN and CHECK constraints",
      body: "`WHERE x NOT IN (subquery)` returns zero rows the moment the subquery emits a single NULL — the whole predicate collapses to UNKNOWN. Same trap in CHECK constraints: `CHECK (status <> 'banned')` allows NULL status through, because UNKNOWN is not FALSE.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "By default PostgreSQL B-Tree indexes DO store NULL entries, so IS NULL can use an index — but only with a `WHERE col IS NULL` partial index or recent planner versions. Aggregates like SUM/AVG silently skip NULLs; COUNT(*) counts NULL rows, COUNT(col) does not. These asymmetries are the #1 source of off-by-one analytics defects.",
    },
    {
      kind: "takeaways",
      items: [
        "= NULL is always UNKNOWN — use IS NULL / IS NOT NULL.",
        "IS DISTINCT FROM is the NULL-safe <>.",
        "NOT IN explodes if the inner set contains a single NULL.",
        "Aggregate functions skip NULL — COUNT(*) does not.",
      ],
    },
  ],
};

// =============================================================
// MODULE 2: AGGREGATIONS & GROUP BY
// =============================================================

// ---------- 2.1 Aggregate Functions ----------
const aggregateFns: LessonContent = {
  slug: "aggregate-functions",
  title: "2.1 Aggregate Functions (COUNT / SUM / AVG / MIN / MAX)",
  subtitle: "Scalar reducers, NULL omission, and the COUNT(*) vs COUNT(column) asymmetry.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Aggregates are how a billion-row fact table collapses into a single KPI — every dashboard tile, alert threshold, and finance close depends on them being numerically exact.",
        "An aggregate is a streaming fold: the engine maintains a tiny accumulator state per row, identical to `functools.reduce(lambda acc, x: acc + x, stream, 0)` — and like that reduce, it has to decide what to do with None.",
      ],
    },
    {
      kind: "animation",
      variant: "group-by-agg",
      caption: "Rows stream into an accumulator pill — NULLs slip past for SUM, are counted by COUNT(*).",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: a vertical column of row cards on the left; on the right, five accumulator pills labelled COUNT(*), COUNT(amount), SUM(amount), AVG(amount), MAX(amount), each starting at 0/NULL.",
        "Phase 2 — Action: rows stream upward one at a time. As each card touches the pill row: COUNT(*) increments unconditionally (NULL row glows grey but still ticks the counter); COUNT(amount) only increments on non-NULL; SUM adds the value; AVG updates both its running sum and count; MAX glows orange when a new high arrives.",
        "Phase 3 — Final State: pills hold final scalars. A tooltip on COUNT(*) shows 'rows: 5', COUNT(amount) shows 'rows with value: 4' — the asymmetry is rendered explicit.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Five reducers, one scan",
      code: `-- /* Phase 1: stream the orders table */
SELECT
  COUNT(*)         AS row_count,        -- /* counts every row, NULL or not */
  COUNT(amount)    AS amount_count,     -- /* counts only non-NULL amounts */
  SUM(amount)      AS revenue,          -- /* skips NULLs silently */
  AVG(amount)      AS mean_ticket,      -- /* = SUM/COUNT(amount), NOT /COUNT(*) */
  MAX(amount)      AS top_ticket,       -- /* monotone running max */
  COUNT(DISTINCT customer_id) AS unique_customers   -- /* hash-set sized agg */
FROM   orders;

-- /* FILTER clause — conditional aggregation in a single pass */
SELECT
  COUNT(*)                              AS total,
  COUNT(*) FILTER (WHERE status='paid') AS paid_rows,
  SUM(amount) FILTER (WHERE status='paid') AS paid_revenue   -- /* no need for CASE WHEN */
FROM   orders;`,
    },
    {
      kind: "table",
      caption: "Aggregate semantics under NULL",
      headers: ["Function", "Counts NULL?", "Returns when all NULL"],
      rows: [
        ["COUNT(*)", "Yes", "0"],
        ["COUNT(col)", "No", "0"],
        ["SUM(col)", "No", "NULL"],
        ["AVG(col)", "No", "NULL"],
        ["MIN/MAX(col)", "No", "NULL"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1141]", "User Activity for the Past 30 Days I", "Pure COUNT DISTINCT syntactic validation."],
        ["Drill [1075]", "Project Employees I", "AVG with rounding — pure aggregate implementation."],
        ["Challenge [1731]", "The Number of Employees Which Report to Each Employee", "Aggregation fused with self-join + grouping."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — AVG is NOT SUM/COUNT(*)",
      body: "AVG divides by the count of NON-NULL values. If half your `amount` rows are NULL, `AVG(amount)` will be twice `SUM(amount)/COUNT(*)`. Document explicitly which denominator the business wants.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Plain SUM/MIN/MAX run in a single sequential scan with O(1) memory. COUNT(DISTINCT col) requires a hash-set sized to cardinality and can spill to disk when it exceeds work_mem — for high-cardinality columns, prefer HyperLogLog (`postgres_fdw` / `hll` extension) for approximate counts at 100× less memory.",
    },
    {
      kind: "takeaways",
      items: [
        "COUNT(*) counts rows; COUNT(col) counts non-NULL values.",
        "SUM/AVG/MIN/MAX silently skip NULL inputs.",
        "FILTER (WHERE …) is cleaner than CASE inside aggregates.",
        "COUNT(DISTINCT) is memory-heavy — consider HLL above 10M distinct keys.",
      ],
    },
  ],
};

// ---------- 2.2 The Collapse Engine (GROUP BY) ----------
const groupByLesson: LessonContent = {
  slug: "group-by",
  title: "2.2 The Collapse Engine (GROUP BY)",
  subtitle: "Physical transformation of row stream into uniquely-keyed bucket arrays.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "GROUP BY is the foundational pivot operation that turns transactional grain into analytical grain — every cohort analysis, funnel, or daily-active-user count starts here.",
        "Imagine a Python `collections.defaultdict(list)` keyed on the grouping columns: each incoming row is hashed into its bucket, then a reduce function is applied to every bucket — that's exactly the engine's HashAggregate operator.",
      ],
    },
    {
      kind: "animation",
      variant: "group-by-agg",
      caption: "Rows hash into bucket lanes; aggregates collapse each lane into one row.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: raw orders table on the left with columns (region, amount); an empty bucket array (3 lanes labelled APAC / EMEA / NA) hovers centre; the result viewport on the right is empty.",
        "Phase 2 — Action: each row arcs from the source table toward its bucket lane based on the hash of `region`; the bucket lane swells slightly with each arrival, and a tiny running-sum chip ticks up. Once the stream ends, each bucket pill compresses into a single output row that slides into the result viewport.",
        "Phase 3 — Final State: viewport holds exactly three rows — one per region — each carrying `SUM(amount)` and `COUNT(*)`. A side panel shows the HashAggregate plan node with memory usage.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Bucket by region, reduce per bucket",
      code: `-- /* Phase 1: scan raw orders */
SELECT region,                              -- /* grouping key */
       COUNT(*)    AS order_count,          -- /* per-bucket reduce */
       SUM(amount) AS revenue
FROM   orders
GROUP  BY region                            -- /* Phase 2: hash rows into bucket lanes */
ORDER  BY revenue DESC;                     -- /* Phase 3: sort the bucket outputs */

-- /* Multi-column key — composite hash */
SELECT region, channel,
       SUM(amount) AS revenue
FROM   orders
GROUP  BY region, channel;                  -- /* one bucket per (region, channel) tuple */

-- /* Every non-aggregated column MUST appear in GROUP BY — functional dependency rule */
SELECT region, currency, SUM(amount)
FROM   orders
GROUP  BY region, currency;`,
    },
    {
      kind: "table",
      caption: "Logical query phase ordering (FROM → GROUP BY → SELECT)",
      headers: ["#", "Phase", "What it does"],
      rows: [
        ["1", "FROM / JOIN", "Materialise the row stream."],
        ["2", "WHERE", "Drop rows that fail predicates (pre-aggregation)."],
        ["3", "GROUP BY", "Hash/sort into buckets."],
        ["4", "Aggregate", "Reduce each bucket."],
        ["5", "HAVING", "Drop whole buckets (post-aggregation)."],
        ["6", "SELECT / ORDER BY / LIMIT", "Project, sort, page."],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1729]", "Find Followers Count", "Single-column GROUP BY + COUNT."],
        ["Drill [1484]", "Group Sold Products By The Date", "GROUP BY + STRING_AGG / array aggregation."],
        ["Challenge [1granklin / 1158]", "Market Analysis I", "GROUP BY combined with multiple joins and date filtering."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — selecting a non-grouped, non-aggregated column",
      body: "`SELECT region, customer_id, SUM(amount) FROM orders GROUP BY region` is a logical error — `customer_id` has no defined value at the bucket level. PostgreSQL rejects it; MySQL (without ONLY_FULL_GROUP_BY) silently picks a random value per bucket, producing non-deterministic dashboards.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "The planner chooses between HashAggregate (in-memory hash table) and GroupAggregate (sorted input, streaming reduce). HashAggregate is faster when distinct keys fit in `work_mem`; once it overflows it spills batches to disk and switches algorithms. EXPLAIN ANALYZE will display 'Disk: 128MB' when this happens — bump work_mem or prune the grouping set.",
    },
    {
      kind: "takeaways",
      items: [
        "GROUP BY produces one row per distinct key combination.",
        "Every SELECT column must be in GROUP BY or be an aggregate.",
        "HashAggregate ≫ GroupAggregate when keys fit in memory.",
        "Spill-to-disk shows as Disk: <MB> in EXPLAIN ANALYZE.",
      ],
    },
  ],
};

// ---------- 2.3 Evaluation Filtering (HAVING) ----------
const havingLesson: LessonContent = {
  slug: "having",
  title: "2.3 Evaluation Filtering (HAVING)",
  subtitle: "Why HAVING runs strictly after aggregation — and the cost of misplacing the predicate.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "WHERE filters individual rows before the bucket collapse; HAVING filters whole buckets after the collapse — confusing the two is the most common cause of slow aggregation queries.",
        "Picture a two-stage warehouse conveyor: WHERE is the inbound quality-control gate before items enter pallets, HAVING is the outbound gate that rejects entire pallets whose summary metrics fail — and you never want to reject single items at the outbound gate.",
      ],
    },
    {
      kind: "animation",
      variant: "group-by-agg",
      caption: "Pre-aggregation rows pass WHERE; post-aggregation buckets pass HAVING.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: raw row stream on far left; a WHERE gate, then a GROUP BY bucket array, then a HAVING gate, then the result viewport on far right.",
        "Phase 2 — Action: rows arc through the WHERE gate; rejects fade. Survivors stream into bucket lanes and collapse to one aggregate card per bucket. Each aggregate card then arcs toward the HAVING gate; cards whose aggregate fails the predicate dim to 30% opacity and slide off-canvas; the rest reach the viewport.",
        "Phase 3 — Final State: viewport holds the buckets whose summed metric passed the HAVING threshold; an annotation badge highlights that HAVING was evaluated AFTER aggregation.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "WHERE pre-filters rows; HAVING post-filters buckets",
      code: `-- /* Phase 2a: WHERE drops rows BEFORE aggregation */
SELECT region,
       SUM(amount) AS revenue
FROM   orders
WHERE  status = 'paid'                 -- /* per-row predicate runs first */
GROUP  BY region                       -- /* buckets formed from survivors */
HAVING SUM(amount) > 10000             -- /* Phase 2b: bucket-level predicate */
ORDER  BY revenue DESC;

-- /* ANTI-PATTERN: using HAVING to filter rows the engine could have rejected earlier */
SELECT region, SUM(amount)
FROM   orders
GROUP  BY region
HAVING region IN ('APAC','EMEA');      -- /* WRONG: this should be in WHERE */

-- /* Same query, optimised — push the predicate to WHERE */
SELECT region, SUM(amount)
FROM   orders
WHERE  region IN ('APAC','EMEA')       -- /* filter rows before bucketing */
GROUP  BY region;`,
    },
    {
      kind: "table",
      caption: "WHERE vs HAVING decision matrix",
      headers: ["Predicate references", "Goes in"],
      rows: [
        ["Only base / joined columns", "WHERE"],
        ["An aggregate (SUM, COUNT, …)", "HAVING"],
        ["A grouping column", "WHERE (preferred) or HAVING"],
        ["A window function", "Subquery / CTE, then WHERE"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [596]", "Classes More Than 5 Students", "Basic HAVING COUNT > N syntactic validation."],
        ["Drill [1050]", "Actors and Directors Who Cooperated At Least Three Times", "Pure HAVING on COUNT after GROUP BY pair."],
        ["Challenge [1112]", "Highest Grade For Each Student", "HAVING fused with subqueries and window-style filtering."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — HAVING on a non-aggregated column is legal but wasteful",
      body: "HAVING accepts any boolean expression, including non-aggregates. `HAVING region = 'APAC'` is syntactically valid but forces the engine to build every bucket and then throw most away — push the predicate to WHERE so the planner can prune rows earlier and possibly use an index.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Aggregation is one of the most memory-intensive operators; pushing predicates from HAVING into WHERE shrinks the row stream feeding HashAggregate, often by orders of magnitude. Verify with EXPLAIN ANALYZE — the rows-removed-by-filter counter on the Seq Scan or Index Scan node should jump after the rewrite.",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE = per-row pre-aggregation filter.",
        "HAVING = per-bucket post-aggregation filter.",
        "Push non-aggregate predicates to WHERE to enable index use.",
        "EXPLAIN ANALYZE reveals whether the rewrite shrank the row stream.",
      ],
    },
  ],
};

// ---------- 2.4 Multi-Dimensional Aggregations (GROUPING SETS) ----------
const groupingSets: LessonContent = {
  slug: "grouping-sets",
  title: "2.4 Multi-Dimensional Aggregations (GROUPING SETS / ROLLUP / CUBE)",
  subtitle: "Generate cube / rollup permutations in a single table pass — no UNION ALL pipelines.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Finance and BI dashboards routinely need totals at multiple grain levels (region, region+quarter, grand total) — naïvely UNION-ALL-ing three GROUP BY queries scans the fact table three times.",
        "GROUPING SETS is the SQL analogue of a single-pass NumPy `sum(axis=…)` family — one scan, many marginal totals, like building a multi-axis pivot table by streaming each row into multiple accumulator arrays at once.",
      ],
    },
    {
      kind: "animation",
      variant: "group-by-agg",
      caption: "Each row fans into multiple bucket lanes — one per grouping set.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: source fact rows on the left (region, quarter, amount); three vertical bucket arrays on the right labelled `(region)`, `(quarter)`, `(region, quarter)`, plus a single grand-total pill.",
        "Phase 2 — Action: each row simultaneously fans into all three bucket arrays AND the grand-total pill, splitting into translucent copies. Each bucket accumulates its partial sum. The single source scan is highlighted at the top — note it never replays.",
        "Phase 3 — Final State: result viewport contains every marginal combination — region totals, quarter totals, region×quarter detail, and one grand-total row; GROUPING() column distinguishes which dimensions are aggregated away.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "One scan, every margin",
      code: `-- /* Phase 1: single pass over the fact table */
SELECT region,
       quarter,
       SUM(amount) AS revenue,
       GROUPING(region)  AS region_is_total,   -- /* 1 = aggregated out */
       GROUPING(quarter) AS quarter_is_total
FROM   sales_fact
GROUP  BY GROUPING SETS (                      -- /* Phase 2: each row fans into 4 buckets */
  (region, quarter),                           -- /* detail grain */
  (region),                                    -- /* region subtotal */
  (quarter),                                   -- /* quarter subtotal */
  ()                                           -- /* grand total */
)
ORDER  BY region NULLS LAST, quarter NULLS LAST;

-- /* ROLLUP is shorthand for hierarchical subtotals */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY ROLLUP (region, quarter);            -- /* = GROUPING SETS ((region,quarter),(region),()) */

-- /* CUBE is shorthand for the full lattice */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY CUBE (region, quarter);              -- /* every subset of the two dimensions */`,
    },
    {
      kind: "table",
      caption: "Shorthand expansions",
      headers: ["Construct", "Expands to"],
      rows: [
        ["ROLLUP(a, b)", "(a,b), (a), ()"],
        ["ROLLUP(a, b, c)", "(a,b,c), (a,b), (a), ()"],
        ["CUBE(a, b)", "(a,b), (a), (b), ()"],
        ["GROUPING SETS(...)", "Explicit list — no expansion"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1303]", "Find the Team Size", "Basic GROUP BY producing per-key totals (warmup for marginal sums)."],
        ["Drill [1393]", "Capital Gain/Loss", "Multi-dimensional aggregation across two pivots."],
        ["Challenge [1another / 1212]", "Team Scores in Football Tournament", "Multi-grain totals fused with self-join / UNION ALL alternatives."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — NULL in the data vs NULL produced by GROUPING SETS",
      body: "A NULL in the `region` column of an output row could mean (a) the source data had a NULL region, or (b) `region` was aggregated away in this grouping set. Always read `GROUPING(region) = 1` to know it was rolled up; otherwise you'll double-count a real NULL region as a subtotal.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "PostgreSQL implements GROUPING SETS as a MixedAggregate or GroupAggregate over a sorted input — typically one heap scan plus one sort, vs N scans for an equivalent UNION ALL of N grouped queries. Memory peaks at the largest grouping set; if it spills, partial aggregates are written to disk in batches.",
    },
    {
      kind: "takeaways",
      items: [
        "GROUPING SETS produces all marginal totals in one table pass.",
        "ROLLUP = hierarchical subtotals; CUBE = full lattice.",
        "Use GROUPING(col) to distinguish real NULLs from roll-up NULLs.",
        "Always faster than the equivalent UNION ALL of separate GROUP BYs.",
      ],
    },
  ],
};

// =============================================================
// MODULE 3: JOINS
// =============================================================

// ---------- 3.1 Core Shapes (INNER vs LEFT/RIGHT/FULL) ----------
const innerOuter: LessonContent = {
  slug: "inner-outer",
  title: "3.1 Core Shapes (INNER vs LEFT / RIGHT / FULL)",
  subtitle: "Logical Cartesian product, row preservation rules, and NULL-padding for unmatched predicates.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Joins recombine the relations that 3NF normalization splits apart — without them every analytical query would have to be hand-stitched in application code.",
        "Mentally a join is a doubly-nested for-loop over two collections with an `if predicate:` body — exactly the Nested Loop Join the planner falls back to when no other algorithm fits; outer-join NULL-padding is the `else: emit(left, None)` of that loop.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "Toggle INNER / LEFT / RIGHT / FULL — watch unmatched rows pad with NULL.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: two tables side by side — `customers` (left, 4 rows) and `orders` (right, 3 rows). Each row carries a colour-coded key; the join predicate `customers.id = orders.customer_id` appears as a bridge token between them.",
        "Phase 2 — Action: rows from `customers` arc rightward; matching `orders` rows arc leftward and fuse into a combined row that drops into the result viewport. Unmatched left rows: in INNER they fade out; in LEFT they continue but the right half is rendered as a translucent NULL pad; FULL adds the symmetric behaviour for unmatched right rows.",
        "Phase 3 — Final State: viewport snapshots stack for each join type — INNER (3 matched), LEFT (4 rows, 1 NULL-padded), RIGHT (3 rows), FULL (5 rows, 2 NULL-padded). A side panel marks row-preservation rules.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Four shapes, one predicate",
      code: `-- /* Phase 2: INNER — only matched pairs survive */
SELECT c.id, c.name, o.amount
FROM   customers c
JOIN   orders    o ON o.customer_id = c.id;     -- /* unmatched customers drop */

-- /* LEFT OUTER — preserve every customer, NULL-pad missing orders */
SELECT c.id, c.name, o.amount
FROM   customers c
LEFT   JOIN orders o ON o.customer_id = c.id;   -- /* customer with no orders => o.amount IS NULL */

-- /* FULL OUTER — preserve everything from both sides */
SELECT c.id, c.name, o.amount
FROM   customers c
FULL   JOIN orders o ON o.customer_id = c.id;   -- /* orphan customers AND orphan orders both kept */

-- /* Find orphans (left-anti pattern) */
SELECT c.id, c.name
FROM   customers c
LEFT   JOIN orders o ON o.customer_id = c.id
WHERE  o.customer_id IS NULL;                   -- /* customers who never ordered */`,
    },
    {
      kind: "table",
      caption: "Row-preservation cheatsheet",
      headers: ["Join", "Left rows kept?", "Right rows kept?", "Unmatched columns"],
      rows: [
        ["INNER", "Matched only", "Matched only", "n/a"],
        ["LEFT OUTER", "All", "Matched only", "Right side = NULL"],
        ["RIGHT OUTER", "Matched only", "All", "Left side = NULL"],
        ["FULL OUTER", "All", "All", "Either side = NULL"],
        ["CROSS", "All", "All", "Cartesian product"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [175]", "Combine Two Tables", "Pure LEFT JOIN syntactic validation."],
        ["Drill [197]", "Rising Temperature", "INNER JOIN with a predicate on the join condition."],
        ["Challenge [1views / 178]", "Rank Scores", "Outer join fused with window-style ranking aggregation."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — predicate in WHERE silently converts LEFT into INNER",
      body: "`LEFT JOIN orders o ON o.customer_id = c.id WHERE o.status = 'paid'` drops every customer with no paid order — `o.status` is NULL for unmatched rows and `NULL = 'paid'` is UNKNOWN. Move the predicate onto the ON clause (`AND o.status='paid'`) to preserve the outer semantic.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Without statistics the planner assumes a Cartesian-style worst case and may choose a Nested Loop Join with O(M×N) cost — disastrous on million-row tables. Make sure the join key has an index on at least the inner side; ANALYZE after bulk loads so the planner picks Hash or Sort-Merge instead.",
    },
    {
      kind: "takeaways",
      items: [
        "INNER drops unmatched; LEFT/RIGHT preserve one side; FULL preserves both.",
        "NULL-padding is how outer joins represent 'no match'.",
        "Predicates on the outer side belong in ON, not WHERE.",
        "Index the join key — Nested Loop without an index is O(M×N).",
      ],
    },
  ],
};

// ---------- 3.2 Self Joins ----------
const selfJoins: LessonContent = {
  slug: "self-joins",
  title: "3.2 Self Joins",
  subtitle: "Aliasing one relation as two virtual copies to walk hierarchies, adjacencies, and time-series intervals.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Adjacency lists (manager → employee, parent → child, prev → next reading) are the canonical relational shape — a self join is how SQL traverses one hop along that graph.",
        "Imagine cloning a Python list into two pointers `left` and `right` and stepping them with `for l in xs: for r in xs: if predicate(l, r):` — the engine does exactly this by aliasing the same heap relation as two logical input streams.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "Two aliased copies of the same table meet at the join predicate.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: one `employees` table renders centrally; a ghost copy fans out to its left labelled `e` and another to the right labelled `m`. A bridge token shows `e.manager_id = m.id`.",
        "Phase 2 — Action: each `e` row arcs upward looking for its `m.id` counterpart; matched pairs glow blue and fuse into a `(employee_name, manager_name)` card that lands in the viewport. CEO rows (manager_id IS NULL) fall through unless a LEFT self join is selected (toggle).",
        "Phase 3 — Final State: viewport holds one row per employee with their manager — a flattened parent-child edge list ready for downstream BI.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Aliasing is everything",
      code: `-- /* Phase 1: alias employees as two virtual relations */
SELECT e.id,
       e.name      AS employee,
       m.name      AS manager           -- /* m is the SAME table viewed differently */
FROM   employees e
LEFT   JOIN employees m                 -- /* LEFT preserves the CEO row */
       ON  m.id = e.manager_id;         -- /* Phase 2: bridge predicate */

-- /* Time-series adjacency: pair every reading with the previous one */
SELECT a.measured_at,
       a.value,
       b.value - a.value AS delta
FROM   readings a
JOIN   readings b
       ON  b.measured_at = a.measured_at + INTERVAL '1 minute'
ORDER  BY a.measured_at;

-- /* Pair finding: who shares a birthday? (avoid duplicates with id ordering) */
SELECT p1.name, p2.name, p1.birthday
FROM   people p1
JOIN   people p2
       ON  p1.birthday = p2.birthday
       AND p1.id < p2.id;               -- /* prevents (a,a) and (b,a) duplicates */`,
    },
    {
      kind: "table",
      caption: "Self-join recipe patterns",
      headers: ["Use case", "Predicate shape"],
      rows: [
        ["Hierarchy traversal", "child.parent_id = parent.id"],
        ["Adjacent time series", "b.ts = a.ts + interval"],
        ["Pair finding", "a.key = b.key AND a.id < b.id"],
        ["Gap detection", "LEFT JOIN ON next.id = curr.id+1 WHERE next.id IS NULL"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [181]", "Employees Earning More Than Their Managers", "Pure self-join syntactic validation."],
        ["Drill [196]", "Delete Duplicate Emails", "Self-join + id-ordering trick for de-duplication."],
        ["Challenge [180]", "Consecutive Numbers", "Self join across three aliases fused with predicate logic."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — forgetting the asymmetry predicate",
      body: "A pair-finding self join without `a.id < b.id` returns both `(a,b)` and `(b,a)` and also self-pairs `(a,a)`, inflating cardinality 2× plus N. Always include an ordering predicate to make the relation strictly antisymmetric.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Self joins read the same heap twice — make sure shared_buffers can hold the table, otherwise the second alias re-fetches pages from disk. For deep hierarchical walks (N levels), a recursive CTE (`WITH RECURSIVE`) outperforms N chained self joins because it traverses the tree once instead of N×.",
    },
    {
      kind: "takeaways",
      items: [
        "Self join = same relation, two aliases, one predicate.",
        "Use LEFT self join to preserve root / orphan rows.",
        "Add `a.id < b.id` to suppress duplicate pairs.",
        "Recursive CTE beats stacked self joins for N-level hierarchies.",
      ],
    },
  ],
};

// ---------- 3.3 Filtering Joins (Semi & Anti) ----------
const semiAnti: LessonContent = {
  slug: "semi-anti",
  title: "3.3 Filtering Joins (Semi & Anti)",
  subtitle: "EXISTS, NOT EXISTS, IN, and LEFT JOIN…IS NULL — existential checks without row multiplication.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Often you don't want columns from the related table — you only want to know whether a match exists, and an INNER JOIN can secretly multiply rows when the right side has duplicates.",
        "Think of EXISTS as a short-circuiting `any(p in subquery for p in row)` Python expression — the moment one match is found the loop breaks, no extra rows materialise.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "Probe terminates on first match — left row passes through unchanged.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: `customers` table on left, `orders` table on right; a small probe icon hovers over each customer; a switch in the corner toggles SEMI vs ANTI.",
        "Phase 2 — Action: for SEMI, the probe fires into the orders table; on first hit it lights green and the customer card arcs into the viewport unchanged (no order data attached). For ANTI, the probe fires; if it finds no hit the card arcs into the viewport, otherwise it dims.",
        "Phase 3 — Final State: viewport contains exactly one row per customer with no row duplication — even if a customer had 50 orders, only one customer row appears.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "EXISTS is the cleanest semi join",
      code: `-- /* Phase 2 (semi): one row per customer who has at least one order */
SELECT c.id, c.name
FROM   customers c
WHERE  EXISTS (                              -- /* probe stops at first hit */
  SELECT 1 FROM orders o
  WHERE  o.customer_id = c.id
);

-- /* Anti join: customers with NO orders */
SELECT c.id, c.name
FROM   customers c
WHERE  NOT EXISTS (                          -- /* probe must exhaust to confirm absence */
  SELECT 1 FROM orders o
  WHERE  o.customer_id = c.id
);

-- /* Equivalent LEFT-JOIN / IS NULL anti-pattern (works, but planner prefers NOT EXISTS) */
SELECT c.id, c.name
FROM   customers c
LEFT   JOIN orders o ON o.customer_id = c.id
WHERE  o.customer_id IS NULL;                -- /* unmatched left rows */

-- /* IN-style semi join — fine for small, NULL-free subqueries */
SELECT c.id, c.name
FROM   customers c
WHERE  c.id IN (SELECT customer_id FROM orders);`,
    },
    {
      kind: "table",
      caption: "Semi-join idiom comparison",
      headers: ["Idiom", "Multiplies rows?", "NULL-safe?", "Planner prefers"],
      rows: [
        ["EXISTS / NOT EXISTS", "No", "Yes", "Best general choice"],
        ["IN / NOT IN", "No", "NOT IN ⚠ unsafe with NULL", "Small sets only"],
        ["LEFT JOIN … IS NULL", "No (1:1 with no dups)", "Yes", "Works, planner may rewrite"],
        ["INNER JOIN + DISTINCT", "Yes (then dedupes)", "Yes", "Avoid — extra sort/hash"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [183]", "Customers Who Never Order", "Pure anti-join syntactic validation."],
        ["Drill [1378]", "Replace Employee ID With The Unique Identifier", "Semi-join style filtering with LEFT JOIN."],
        ["Challenge [1another / 1series]", "Customer Placing the Largest Number of Orders", "Anti / semi join fused with aggregation and TOP-N filtering."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — NOT IN with a NULL annihilates the result",
      body: "If the inner SELECT can ever return a NULL, `WHERE x NOT IN (subquery)` returns zero rows — UNKNOWN poisons the predicate. Always switch to `NOT EXISTS`, which compares row-by-row and is NULL-safe.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Modern planners (PostgreSQL ≥ 9.0) rewrite EXISTS and IN to Hash Semi Join / Hash Anti Join — a single hash build over the inner relation, then a probe-and-stop on the outer. INNER JOIN + DISTINCT does the same logical work but pays for an additional sort or hash dedupe pass; EXPLAIN ANALYZE makes the cost difference obvious.",
    },
    {
      kind: "takeaways",
      items: [
        "EXISTS / NOT EXISTS = semi/anti join with no row multiplication.",
        "Avoid NOT IN if the inner set may contain NULL.",
        "Modern planners turn EXISTS into Hash Semi Join under the hood.",
        "INNER JOIN + DISTINCT is the slow way to do a semi join.",
      ],
    },
  ],
};

// ---------- 3.4 Under-the-Hood Join Algorithms ----------
const joinAlgorithms: LessonContent = {
  slug: "join-algorithms",
  title: "3.4 Under-the-Hood Join Algorithms",
  subtitle: "Nested Loop vs Hash Join vs Sort-Merge — memory, complexity, and spill-to-disk thresholds.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "The physical algorithm the planner picks determines whether a join finishes in 50 ms or 50 minutes — picking the wrong one silently melts production.",
        "Mentally: Nested Loop = `for x in A: for y in B`; Hash Join = build a Python `dict` from the smaller side and probe; Sort-Merge = `heapq.merge` two pre-sorted streams. The optimizer picks based on input sizes, sort orders, and available memory.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "Hash builds an in-memory bucket map; Sort-Merge zips two ordered streams.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: left and right tables render side by side; three algorithm tabs at the top — NESTED LOOP, HASH, SORT-MERGE — each begins inactive.",
        "Phase 2 — Action: NESTED LOOP — a pointer in A walks every row in B for each A row (rendered as O(M×N) sweeps); HASH — the smaller table is hoovered into a glowing hash bucket grid, then the larger table streams past and probes a single bucket each; SORT-MERGE — both inputs sort visibly (bars reorder), then twin pointers march together emitting matches.",
        "Phase 3 — Final State: a stats panel reveals time, memory, and disk-spill counters for each algorithm; the optimizer's chosen plan is highlighted with a 'planner pick' badge.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Inspect the chosen algorithm — EXPLAIN is the truth",
      code: `-- /* Phase 2: ask the planner which algorithm it picks */
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT c.name, SUM(o.amount)
FROM   customers c
JOIN   orders    o ON o.customer_id = c.id
GROUP  BY c.name;

-- /* Typical plan for medium tables → Hash Join */
--   HashAggregate
--     ->  Hash Join
--           Hash Cond: (o.customer_id = c.id)
--           ->  Seq Scan on orders o
--           ->  Hash
--                 ->  Seq Scan on customers c          -- /* build side: smaller relation */

-- /* Force a different algorithm to compare cost (PostgreSQL session GUCs) */
SET enable_hashjoin   = off;        -- /* planner now considers only NL & merge */
EXPLAIN ANALYZE SELECT ...;         -- /* re-run query, compare timings */
RESET enable_hashjoin;              -- /* always reset session knobs */`,
    },
    {
      kind: "table",
      caption: "Algorithm decision matrix",
      headers: ["Algorithm", "Cost", "Best when", "Memory pressure"],
      rows: [
        ["Nested Loop", "O(M × N)", "Tiny inner with index on join key", "Negligible"],
        ["Hash Join", "O(M + N)", "Equality join, build side fits work_mem", "Build side ≈ work_mem"],
        ["Sort-Merge", "O(M log M + N log N)", "Both inputs already sorted or huge", "Sort buffers / disk spill"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [197]", "Rising Temperature", "Two-row join with index opportunity — observe plan."],
        ["Drill [1granklin / 1132]", "Reported Posts II", "Join with aggregation — Hash Join in the plan."],
        ["Challenge [1212]", "Team Scores in Football Tournament", "Multi-join + aggregation — full plan-reading exercise."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — stale statistics cause the planner to pick Nested Loop on a billion rows",
      body: "After a bulk load (COPY, INSERT…SELECT) without `ANALYZE`, the planner still believes the table is empty and chooses Nested Loop — turning a 5-second hash join into hours of CPU-bound torture. Always `ANALYZE` after large mutations.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Hash Join spills to disk when build side > work_mem — visible as 'Disk Hash Batches: > 1' in EXPLAIN ANALYZE. Sort-Merge spills via tape-merge when input > work_mem (look for 'external merge'). Bumping work_mem session-locally or rewriting the query to shrink the inner relation is almost always cheaper than tuning shared memory.",
    },
    {
      kind: "takeaways",
      items: [
        "Nested Loop = O(M×N) — fine only with a tiny inner + index.",
        "Hash Join = O(M+N) — the workhorse for equality joins.",
        "Sort-Merge wins when inputs are pre-sorted or huge.",
        "Stale statistics are the #1 cause of catastrophic plan choices.",
      ],
    },
  ],
};

// =============================================================
// MODULE 4: SUBQUERIES & SET OPS
// =============================================================

// ---------- 4.1 Scalar Subqueries ----------
const scalarSubqueries: LessonContent = {
  slug: "scalar-subqueries",
  title: "4.1 Scalar Subqueries",
  subtitle: "Nested atomic expressions returning exactly one row, one column — used inside SELECT, WHERE, or expressions.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "A scalar subquery lets you inline a derived constant — like a 'global average' — directly into an outer expression without an explicit JOIN, keeping the query intent crisp.",
        "Conceptually it's identical to `avg = compute_avg(); rows.filter(r => r.x > avg)` — the subquery runs once, the result is hoisted as a constant, then every outer row compares against it.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "Inner query collapses to a single scalar pill — outer rows compare against it.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer table (orders) renders on the right; inner aggregate query renders as a sealed box on the left labelled `(SELECT AVG(amount) FROM orders)`; box is empty.",
        "Phase 2 — Action: the inner box fills, computes its aggregate, then collapses into a single glowing scalar pill that floats toward the outer query and locks into the WHERE clause. Outer rows then scan past, comparing `amount > pill_value`; surviving rows arc to the viewport.",
        "Phase 3 — Final State: viewport holds outer rows where the predicate held; an annotation reminds that the inner ran exactly once (not once per outer row — see 4.2 for that case).",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Scalar in WHERE and in SELECT",
      code: `-- /* Phase 2a: scalar in WHERE — inner runs once */
SELECT id, customer_id, amount
FROM   orders
WHERE  amount > (SELECT AVG(amount) FROM orders);   -- /* compares against single constant */

-- /* Phase 2b: scalar in the SELECT projection — adds a derived column */
SELECT id,
       amount,
       amount - (SELECT AVG(amount) FROM orders) AS delta_from_mean   -- /* one constant subtracted */
FROM   orders;

-- /* Scalar must return EXACTLY one row, one column — otherwise runtime error */
SELECT id,
       (SELECT name FROM customers WHERE customers.id = orders.customer_id) AS customer_name
FROM   orders;                                       -- /* single-value lookup */`,
    },
    {
      kind: "table",
      caption: "Where scalar subqueries are legal",
      headers: ["Location", "Legal?", "Common use"],
      rows: [
        ["SELECT projection", "Yes", "Derived constant column"],
        ["WHERE predicate", "Yes", "Comparison against a global aggregate"],
        ["JOIN ON predicate", "Yes (rare)", "Threshold-based join"],
        ["GROUP BY", "Yes (rare)", "Bucketing by a derived constant"],
        ["FROM clause", "No — must be a table subquery (rowset)", "Use derived table instead"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [595]", "Big Countries", "Scalar comparison in WHERE — pure syntax."],
        ["Drill [176]", "Second Highest Salary", "Scalar subquery with LIMIT/OFFSET for ranking."],
        ["Challenge [177]", "Nth Highest Salary", "Scalar subquery wrapped in a function fused with parameter logic."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — runtime cardinality error",
      body: "If a scalar subquery returns more than one row, PostgreSQL raises `more than one row returned by a subquery used as an expression`. Always guard with `LIMIT 1` and an explicit `ORDER BY`, or change the call site to an `IN` / `EXISTS` semi-join.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "An uncorrelated scalar subquery is evaluated exactly once and cached as an InitPlan node — effectively free at the outer level. The planner can even fold it into a constant. The performance trap is forgetting that a syntactically scalar subquery referencing the outer row turns into a correlated subquery (next lesson) and runs once per row.",
    },
    {
      kind: "takeaways",
      items: [
        "Scalar = exactly one row, one column.",
        "Uncorrelated scalar subqueries run once (InitPlan).",
        "Legal in SELECT / WHERE / JOIN ON; not in FROM (need a rowset).",
        "Wrap with LIMIT 1 + ORDER BY to defend against cardinality errors.",
      ],
    },
  ],
};

// ---------- 4.2 Correlated Subqueries ----------
const correlatedSubqueries: LessonContent = {
  slug: "correlated-subqueries",
  title: "4.2 Correlated Subqueries",
  subtitle: "Inner depends on outer row — the row-by-row nested loop and its O(N²) trap.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Correlated subqueries express per-row 'lookup against context' logic — e.g. find each employee's salary relative to their own department's average — and read very naturally to humans.",
        "Mechanically they are a nested loop: for each outer row, re-execute the inner query with that row's column bound — identical to the Python pattern `[f(row, lookup(row)) for row in outer]` where `lookup` re-runs every iteration.",
      ],
    },
    {
      kind: "animation",
      variant: "where-filter",
      caption: "Inner subquery re-fires for every outer row — count the iterations.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer table (employees) on the right; inner aggregate `(SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)` renders as a re-entrant gear on the left.",
        "Phase 2 — Action: scanner highlights an outer row, copies its `dept_id` into the inner gear, the gear spins, emits a scalar pill, the comparison is evaluated, and the pill evaporates. The gear spins again for the next outer row — an iteration counter ticks up visibly, exposing the O(N) inner runs.",
        "Phase 3 — Final State: viewport holds rows that passed the per-row test; a runtime panel shows `outer rows × inner cost` total work, and a 'rewrite to window function' suggestion banner appears.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Correlated and its faster window-function rewrite",
      code: `-- /* Phase 2: correlated — inner re-runs per outer row (N inner executions) */
SELECT e.id, e.name, e.salary
FROM   employees e
WHERE  e.salary > (
  SELECT AVG(e2.salary)
  FROM   employees e2
  WHERE  e2.dept_id = e.dept_id     -- /* dependency on outer row */
);

-- /* Same result, single scan via window function (O(N) instead of O(N^2)) */
SELECT id, name, salary
FROM (
  SELECT e.*,
         AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
  FROM   employees e
) s
WHERE salary > dept_avg;             -- /* one pass, no per-row re-execution */`,
    },
    {
      kind: "table",
      caption: "Correlated vs uncorrelated",
      headers: ["Property", "Uncorrelated (4.1)", "Correlated (4.2)"],
      rows: [
        ["Inner refers to outer columns?", "No", "Yes"],
        ["Inner executions", "1", "N (one per outer row)"],
        ["Plan node", "InitPlan", "SubPlan"],
        ["Typical rewrite", "Already optimal", "Window function or JOIN + GROUP BY"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [181]", "Employees Earning More Than Their Managers", "Basic correlated reference."],
        ["Drill [184]", "Department Highest Salary", "Correlated MAX rewritten via window function."],
        ["Challenge [185]", "Department Top Three Salaries", "Correlated + DENSE_RANK fused with grouping."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — silently quadratic",
      body: "A correlated subquery against a 1M-row outer table fires the inner 1M times — even when the inner is cheap, the per-row overhead and cache thrashing dominate. Always check EXPLAIN ANALYZE: if the inner plan node shows `loops = 1000000`, rewrite as a window function or a JOIN against a pre-aggregated derived table.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "Modern PostgreSQL can sometimes 'decorrelate' simple SubPlans into a single Hash Join — but only for restricted shapes. Any inner aggregate, LIMIT, or DISTINCT defeats decorrelation. Rule of thumb: if the inner depends on the outer AND involves an aggregate, refactor to a window function or a LATERAL join up front.",
    },
    {
      kind: "takeaways",
      items: [
        "Correlated = inner depends on outer ⇒ N inner executions.",
        "Confirm with EXPLAIN ANALYZE — watch the `loops=` count.",
        "Window functions usually convert O(N²) into O(N).",
        "LATERAL joins are the structured alternative when you need rows, not a scalar.",
      ],
    },
  ],
};

// ---------- 4.3 Existence Checks (EXISTS vs IN) ----------
const existsVsIn: LessonContent = {
  slug: "exists-vs-in",
  title: "4.3 Existence Checks (EXISTS vs IN)",
  subtitle: "Planner rewrites, short-circuit semantics, and the NOT IN-with-NULL catastrophe.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "EXISTS and IN both answer 'is there a match?' — but they have different NULL semantics and different planner rewrites, so picking the wrong one corrupts results silently.",
        "EXISTS is `any(...)` with break-on-first; IN is `value in set` against a materialised collection — and `value in {1, 2, None}` in Python returns True/False/None depending on the value, exactly like SQL's three-valued IN.",
      ],
    },
    {
      kind: "animation",
      variant: "join-types",
      caption: "EXISTS short-circuits; IN materialises the inner set then probes.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: outer rows on the left; inner subquery results on the right; two probes labelled EXISTS and IN hover between them.",
        "Phase 2 — Action: EXISTS probe fires per outer row and stops at the first inner match (visible green flash). IN probe first materialises the entire inner result into a hash set, then each outer row hashes once into that set. A NULL inserted into the IN inner set causes NOT IN to fail every outer row — visible as the entire viewport going dark.",
        "Phase 3 — Final State: side-by-side panes contrast NOT EXISTS (correct anti-join) and NOT IN-with-NULL (empty result) — the catastrophic asymmetry is the headline.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Safe vs catastrophic anti-join",
      code: `-- /* SAFE: NOT EXISTS — row-by-row comparison, NULL-safe */
SELECT c.id, c.name
FROM   customers c
WHERE  NOT EXISTS (
  SELECT 1 FROM blocked b
  WHERE  b.customer_id = c.id
);

-- /* DANGER: NOT IN — if the inner set contains a single NULL, the WHOLE result is empty */
SELECT c.id, c.name
FROM   customers c
WHERE  c.id NOT IN (
  SELECT blocked_id FROM blocked     -- /* if any blocked_id IS NULL — boom */
);

-- /* Defensive rewrite for legacy NOT IN code */
SELECT c.id, c.name
FROM   customers c
WHERE  c.id NOT IN (
  SELECT blocked_id FROM blocked
  WHERE  blocked_id IS NOT NULL      -- /* strip NULLs before they poison */
);`,
    },
    {
      kind: "table",
      caption: "Semantic & performance matrix",
      headers: ["Construct", "NULL-safe?", "Planner rewrite", "When to use"],
      rows: [
        ["EXISTS / NOT EXISTS", "Yes", "Hash Semi/Anti Join", "Default for any anti-join"],
        ["IN (subquery)", "Yes", "Hash Semi Join", "Small inner sets, no NULL risk"],
        ["NOT IN (subquery)", "No (NULL = disaster)", "Anti Join only after NULL strip", "Avoid unless NULL-stripped"],
        ["= ANY(subquery)", "Yes", "Same as IN", "Verbose, rarely used"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [183]", "Customers Who Never Order", "Pure NOT EXISTS / LEFT JOIN syntactic validation."],
        ["Drill [1another / 1series]", "Customers Who Bought All Products", "EXISTS-style universal quantifier."],
        ["Challenge [1another / 1series2]", "Active Businesses", "EXISTS fused with aggregation and threshold logic."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — NOT IN with a NULL silently empties the result",
      body: "If any value returned by the inner query of `NOT IN` is NULL, the entire predicate becomes UNKNOWN and every outer row is dropped. This is the single most cited SQL anti-pattern in code review — convert to `NOT EXISTS` reflexively.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "PostgreSQL ≥ 9.0 rewrites both `IN (subquery)` and `EXISTS (subquery)` into Hash Semi Join when the inner is uncorrelated. NOT IN is harder to rewrite because of the NULL semantic — the planner cannot transform it into a clean Anti Join unless it can prove the inner column is NOT NULL (via constraint or explicit filter).",
    },
    {
      kind: "takeaways",
      items: [
        "NOT EXISTS = safe anti-join. NOT IN = NULL landmine.",
        "Both EXISTS and IN compile to Hash Semi Join when uncorrelated.",
        "Add `IS NOT NULL` inside legacy NOT IN to defuse it.",
        "Constraint-backed NOT NULL columns let the planner pick the fast anti-join plan.",
      ],
    },
  ],
};

// ---------- 4.4 Set Operations (UNION / INTERSECT / EXCEPT) ----------
const setOps: LessonContent = {
  slug: "set-ops",
  title: "4.4 Set Operations (UNION / INTERSECT / EXCEPT)",
  subtitle: "Vertical schema concatenation, dedup overhead, and the UNION vs UNION ALL performance cliff.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "Set operators stack result sets vertically — they're how you combine partitioned tables, archive splits, or compute distinct customer overlaps across product lines.",
        "Mathematically they're set algebra; mechanically UNION/INTERSECT/EXCEPT must dedupe via a sort or hash, while UNION ALL is a pure append — like Python's `set(a) | set(b)` vs `a + b`, with the dedupe cost matching the difference.",
      ],
    },
    {
      kind: "animation",
      variant: "set-ops",
      caption: "Two result streams meet — UNION dedupes, UNION ALL just appends.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Phase 1 — Initial State: two query result sets `A` and `B` render as stacked row cards; an operator badge in the centre cycles UNION / UNION ALL / INTERSECT / EXCEPT.",
        "Phase 2 — Action: for UNION ALL the cards simply chain into the viewport. For UNION the cards arc through a hash/sort dedupe gate — duplicates collapse with a pulse. For INTERSECT, only rows appearing in both A and B survive. For EXCEPT, only rows in A and NOT in B reach the viewport.",
        "Phase 3 — Final State: viewport contains the operator-specific combined result; an overlay highlights the extra sort/hash node present for UNION / INTERSECT / EXCEPT and absent for UNION ALL.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Four operators, identical column shape",
      code: `-- /* Phase 2: dedup version — pays for sort/hash */
SELECT email FROM customers
UNION                                -- /* sort/hash dedupe pass */
SELECT email FROM leads;

-- /* Pure append — fastest when duplicates impossible or irrelevant */
SELECT email FROM customers
UNION ALL                            -- /* no dedupe — concatenation only */
SELECT email FROM leads;

-- /* Rows present in BOTH inputs */
SELECT email FROM customers
INTERSECT
SELECT email FROM newsletter_subs;

-- /* Rows in first input minus matches in second */
SELECT email FROM customers
EXCEPT
SELECT email FROM unsubscribed;

-- /* ORDER BY / LIMIT bind to the COMBINED result */
(SELECT email FROM customers UNION ALL SELECT email FROM leads)
ORDER  BY email
LIMIT  100;`,
    },
    {
      kind: "table",
      caption: "Set-op cheat-sheet",
      headers: ["Operator", "Keeps", "Dedupes?"],
      rows: [
        ["UNION", "Rows in A or B", "Yes"],
        ["UNION ALL", "Rows in A or B (with dups)", "No"],
        ["INTERSECT", "Rows in A and B", "Yes"],
        ["EXCEPT (a.k.a. MINUS)", "Rows in A not in B", "Yes"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1series / 1series2]", "Combine Two Tables variants", "Basic UNION ALL vs UNION syntactic validation."],
        ["Drill [1series / 1another]", "Friend Requests II", "INTERSECT / UNION fused with aggregation."],
        ["Challenge [1series / 1series3]", "Active Users", "Multi-set composition combined with date windows."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "5a. Logic Trap — type & column-count mismatches are runtime errors",
      body: "Both queries must project the exact same number of columns with implicitly-castable types. Output column names always come from the first SELECT. Casting `INT` to `BIGINT` across the boundary is silent, but `INT` vs `TEXT` raises `each UNION query must have the same number of columns` at runtime.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "5b. Performance & Execution Engine Impact",
      body: "UNION executes both children, then runs a HashAggregate or Sort + Unique node to dedupe — typically the dominant cost. UNION ALL is a cheap Append. INTERSECT/EXCEPT also require dedupe via SetOp node and may spill to disk on large inputs. If you know duplicates cannot exist, ALWAYS use UNION ALL — the difference is often 2-10× wall-clock.",
    },
    {
      kind: "takeaways",
      items: [
        "Both sides must have identical column counts and compatible types.",
        "UNION/INTERSECT/EXCEPT dedupe (slow); UNION ALL appends (fast).",
        "ORDER BY / LIMIT apply to the combined result, not each leg.",
        "Output column names come from the first SELECT.",
      ],
    },
  ],
};

// =============================================================
// TOPIC INDEX — 4 modules × 4 sub-topics = 16 lessons
// =============================================================

export const QUERYING_TOPICS: Record<string, FoundationTopicMeta> = {
  filtering: {
    slug: "filtering",
    title: "01 · Filtering & Predicates",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "Boolean logic, range/set filters, pattern matching, and the three-valued NULL trap that silently empties result sets.",
    lessons: [booleanLogic, inBetween, likeIlike, nullPitfalls],
  },
  aggregations: {
    slug: "aggregations",
    title: "02 · Aggregations & GROUP BY",
    category: "Querying Data",
    iconKey: "database",
    blurb:
      "Scalar reducers, the collapse engine, HAVING vs WHERE pipeline ordering, and multi-dimensional GROUPING SETS.",
    lessons: [aggregateFns, groupByLesson, havingLesson, groupingSets],
  },
  joins: {
    slug: "joins",
    title: "03 · Joins",
    category: "Querying Data",
    iconKey: "table",
    blurb:
      "Core shapes, self joins, semi/anti filtering joins, and the Nested Loop vs Hash vs Sort-Merge planner decisions.",
    lessons: [innerOuter, selfJoins, semiAnti, joinAlgorithms],
  },
  subqueries: {
    slug: "subqueries",
    title: "04 · Subqueries & Set Ops",
    category: "Querying Data",
    iconKey: "terminal",
    blurb:
      "Scalar vs correlated subqueries, EXISTS vs IN existence checks, and the UNION / INTERSECT / EXCEPT vertical algebra.",
    lessons: [scalarSubqueries, correlatedSubqueries, existsVsIn, setOps],
  },
};
