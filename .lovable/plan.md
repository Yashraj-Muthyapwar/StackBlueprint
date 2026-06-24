## Goal
Expand each lesson's animation in **SQL 01 Foundations** and **SQL 02 Querying Data** from a single combined visualization into a **multi-stage sequence** that teaches each sub-concept individually first, then a combined finale.

Example for `boolean-logic` lesson:
- Stage 1: AND only (sample table + `WHERE a AND b`, row-by-row eval)
- Stage 2: OR only (`WHERE a OR b`, short-circuit highlight)
- Stage 3: NOT only (`WHERE NOT a`, complement set)
- Stage 4: Combined `(a AND b) OR NOT c` with precedence parens

Each stage = its own mini-table + its own SQL query + its own step sequence, played sequentially inside the lesson player (or as labeled chapters).

## Approach

### 1. Extend animation engine (`src/components/sql/QueryingAnimations.tsx` + a new `FoundationsAnimations.tsx`)
- Introduce a `MultiStageAnimation` wrapper: takes an array of `Stage` objects `{ title, sql, table, steps[], note }` and renders them as sequential chapters with a stage indicator (Stage 1/4 · AND).
- Existing `QueryBlock` / `MiniTable` / `Note` primitives reused per stage.
- Step counter sums all stages; transitions between stages animate a "Concept N" banner.

### 2. Rewrite each lesson's animation as N stages
Per lesson, decompose into 2–4 atomic concept stages + 1 combined finale stage.

**Foundations (01) — ~12 lessons**, e.g.:
- `select-basics`: project 1 col → project N cols → `*` → aliasing
- `where-clause`: equality → comparison → combined predicate
- `order-by`: ASC → DESC → multi-key → NULLS FIRST/LAST
- `limit-offset`: LIMIT → OFFSET → pagination combined
- `distinct`: single col → multi col → with ORDER BY
- (others mapped similarly from existing `foundations-content.ts`)

**Querying (02) — 16 lessons**, e.g.:
- `boolean-logic`: AND → OR → NOT → combined precedence
- `in-between`: IN list → BETWEEN range → NOT IN (NULL trap) → combined
- `like-ilike`: `%` wildcard → `_` wildcard → ILIKE case → anchored vs unanchored index use
- `null-pitfalls`: `= NULL` fails → `IS NULL` → `NOT IN` with NULL → COALESCE
- `scalar-aggregates`: COUNT(*) → COUNT(col) ignores NULL → SUM/AVG → MIN/MAX
- `group-by`: single key bucket → multi-key bucket → group + aggregate combined
- `having`: WHERE vs HAVING → HAVING with aggregate → both combined
- `multi-dim-agg`: GROUPING SETS → ROLLUP → CUBE → combined lattice
- `inner-outer-joins`: INNER → LEFT → RIGHT → FULL
- `self-joins`: same-table alias → parent-child match → hierarchy traversal
- `semi-anti-joins`: EXISTS → NOT EXISTS → IN vs EXISTS perf
- `join-algorithms`: Nested Loop → Hash → Sort-Merge → cost comparison
- `scalar-vs-correlated`: scalar (constant fold) → correlated (per-row) → rewrite to join
- `existence-checks`: EXISTS → NOT EXISTS → anti-join equivalence
- `set-ops`: UNION ALL → UNION (dedupe) → INTERSECT → EXCEPT

### 3. Registry wiring
- Update `querying-content.ts` and `foundations-content.ts` so each lesson's animation `variant` resolves to a stage-list rather than a single step set.
- Update `LessonAnimation.tsx` step-count map to sum stages.

### 4. Validation
- Build check (`tsgo`) + visual smoke via Playwright on 2 lessons per section (boolean-logic, join-algorithms, where-clause, order-by).

## Scope note
This is a large content expansion (~28 lessons × ~4 stages = ~110 mini-animations). I'll keep each stage compact (3–5 rows, 4–6 steps) and reuse the same primitives so it stays maintainable. No business-logic / routing changes — purely animation content + a small engine extension.