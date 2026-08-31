# SQL Playground: Query Challenges

## Purpose

Add a practice mode that asks learners to write SQL from a realistic prompt, run it against a known dataset, and receive useful feedback without requiring one exact query. A challenge should turn the existing playground from an example browser into an active learning environment.

This document defines the first production version. It is intentionally focused on the built-in datasets and does not depend on an account, a backend, or an AI service.

## Learner outcome

After completing a challenge, a learner should know:

- what business question they answered;
- which dataset and tables were involved;
- whether their query produced the required result;
- one useful reason their query did not work, if it failed; and
- where to get a hint or review a solution when they are stuck.

The experience must reward correct alternate SQL. A learner who solves an anti-join with `NOT EXISTS` should pass even if the reference solution uses `LEFT JOIN ... IS NULL`.

## First-release scope

### Included

- A `Challenges` section in the SQL Playground sidebar.
- Ten to fifteen challenges for the Cycle Depot dataset, grouped by concept.
- A full-screen-friendly challenge panel above or beside the editor, while keeping Results, Pipeline, Plan, Schema map, and Chart tabs available.
- Business prompt, target dataset, required tables, difficulty, success criteria, progressive hints, and revealable reference solution.
- Result-based validation, progress saved in `localStorage`, and a per-concept completion count.
- Friendly error states, including a precise underline in the editor when the engine can identify an error location.
- Explicit handling when the learner opens a challenge for a different dataset or unsupported engine.
- A read-only query policy for challenge submissions.

### Excluded from the first release

- Accounts, cloud progress, leaderboards, streaks, grading by an LLM, or sharing submissions.
- Challenges over uploaded files or a mixed uploaded/course workspace.
- Scoring query style, formatting, or a single preferred SQL technique.
- Timed tests, hidden anti-cheating mechanisms, or execution of externally supplied challenge content.
- Full course integration links. Challenges should be designed so lesson links can be added later.

## Recommended challenge inventory

Start with Cycle Depot because it loads instantly and has deliberately useful edge cases. Ship the initial set in this order:

| Group | Challenge | Core learning goal | Tables |
| --- | --- | --- | --- |
| Start here | Find US customers | `SELECT`, `WHERE`, `ORDER BY` | `customers` |
| Start here | Customers without a city | `IS NULL`, not `= NULL` | `customers` |
| Start here | Recent delivered orders | filtering and `LIMIT` | `orders` |
| Joins | Show each order with its customer | inner join condition | `orders`, `customers` |
| Joins | Find customers who never ordered | anti-join | `customers`, `orders` |
| Joins | Calculate each order's total | one-to-many join and aggregation | `orders`, `order_items` |
| Aggregation | Revenue by product category | `SUM`, `GROUP BY` | `order_items`, `products` |
| Aggregation | Countries with more than 20 orders | `HAVING` versus `WHERE` | `customers`, `orders` |
| Aggregation | Count missing cities | `COUNT(*)` versus `COUNT(column)` | `customers` |
| CTEs | Find highest-value customers | CTE and multi-stage aggregation | `customers`, `orders`, `order_items` |
| Windows | Rank each customer's orders | `ROW_NUMBER` and `PARTITION BY` | `customers`, `orders` |
| Windows | Month-over-month order change | `LAG` | `orders` |

Use one beginner challenge at a time in the default sidebar view. Do not display every solution or all expected output at once.

## Product experience

### Entry point and layout

Add a `Challenges` heading in the sidebar above `Guided queries`. Each item shows:

- completion mark when passed;
- short title, for example `Customers who never ordered`;
- difficulty chip: `Beginner`, `Intermediate`, or `Advanced`;
- one-line concept label, for example `LEFT JOIN · NULL`.

Clicking a challenge opens a compact challenge card directly above the editor. The card is not a modal so the learner can keep reading the Schema Explorer and query output.

The card contains:

1. **Title and progress:** `Challenge 5 of 12 · Joins`.
2. **Business prompt:** short, concrete, and free of unnecessary jargon.
3. **Requirements:** exact output columns, ordering requirements only when order is part of the lesson, and relevant tables.
4. **Dataset context:** `Cycle Depot · PostgreSQL or DuckDB`.
5. **Actions:** `Run and check`, `Hint`, `Reset query`, `Reveal solution`, and `Exit challenge`.
6. **Feedback region:** initially empty; it receives success, query error, or result-feedback cards.

The editor remains fully editable. Clicking a required table opens it in the Schema Explorer; it must not replace the learner's SQL. A `Use starter` button may insert a neutral scaffold, such as `SELECT ... FROM customers`, but must never run it or overwrite a non-empty draft without confirmation.

### Example challenge card

**Customers who never ordered**

> The retention team wants a list of customers who signed up but have not yet placed an order. Return `id`, `name`, `country`, and `signup_date`, ordered by `signup_date` from oldest to newest.

Requirements:

- Use `customers` and `orders`.
- Return exactly the four named columns.
- Include every customer with no matching order.
- Do not include customers who have ordered.

The first hint is available immediately. The second hint becomes available after one unsuccessful submission or when the learner asks for it. The reference solution remains hidden until the learner explicitly reveals it.

## Challenge data model

Keep challenge content as versioned TypeScript data in `src/components/sql-playground/challenges/`. Do not encode challenge behavior in JSX or database-specific ad hoc checks.

```ts
type ChallengeEngine = "postgres" | "duckdb";
type ChallengeDataset = DatasetId;

type ChallengeDefinition = {
  id: string;
  version: number;
  title: string;
  group: "start" | "joins" | "aggregation" | "ctes" | "windows";
  difficulty: "beginner" | "intermediate" | "advanced";
  dataset: ChallengeDataset;
  engines: ChallengeEngine[];
  prompt: string;
  requirements: string[];
  requiredTables: string[];
  starterSql?: string;
  hints: string[];
  solutionSql: Partial<Record<ChallengeEngine, string>>;
  validator: ResultValidator;
  success: SuccessCopy;
};

type ResultValidator =
  | {
      kind: "result-set";
      expectedSql: Partial<Record<ChallengeEngine, string>>;
      requiredColumns: string[];
      columnOrder: "exact" | "any";
      rowOrder: "exact" | "any";
      numericTolerance?: number;
    }
  | {
      kind: "scalar";
      expectedSql: Partial<Record<ChallengeEngine, string>>;
      field: string;
      numericTolerance?: number;
    };

type SuccessCopy = {
  title: string;
  body: string;
  nextConcept?: string;
};
```

`expectedSql` is the oracle used only to calculate the expected result in the local engine. It is not the only accepted solution. Hiding it in client code is not a security objective; challenges are learning material, not an exam.

Use a monotonically increasing `version` on every challenge. Progress keys include the version so a corrected validator or redesigned question does not mistakenly mark an older attempt as complete.

## Submission and validation behavior

### Preconditions

When the learner clicks `Run and check`:

1. Confirm the current challenge is still active and compatible with the active dataset and engine.
2. Trim comments and whitespace. If no executable SQL remains, do not call the engine.
3. Require exactly one read-only `SELECT` or `WITH ... SELECT` statement. `EXPLAIN SELECT` may be permitted later, but not in version one.
4. Reject data-changing and structural statements, multiple statements, and empty scripts before execution.
5. Run the query through the existing database client and show Results as normal.
6. If execution succeeds, validate its fields and rows against the challenge's expected result for the active engine.

The submission validator must never throw into React. It returns a typed outcome:

```ts
type CheckOutcome =
  | { state: "passed"; rowCount: number }
  | { state: "incorrect"; reason: CheckReason; detail?: string }
  | { state: "query-error"; category: QueryErrorCategory; errorSpan?: ErrorSpan }
  | { state: "unavailable"; message: string };
```

### Matching rules

- Field names compare case-insensitively, after normalizing whitespace. The display preserves the learner's casing.
- The required field set must match exactly for first-release challenges. This prevents `SELECT *` from accidentally passing a focused task.
- Field order matters only when the prompt explicitly requires it. Most challenges set `columnOrder: "any"`.
- Result rows compare as an unordered multiset unless ordering is part of the objective. Duplicate rows matter.
- `NULL`, empty strings, booleans, dates, and numeric values are compared by normalized type. Numeric comparisons allow a configured tolerance for rounded aggregates.
- Reject non-finite values consistently.
- A result with the correct row count but different content fails. A result with an extra column fails with a direct explanation.
- Expected SQL must run during challenge registration tests for every declared engine. If it fails at runtime anyway, mark the challenge unavailable; never tell the learner their SQL is wrong.

### What must not be judged

Do not require a certain keyword, join type, CTE name, alias name, indentation, capitalization, or statement layout. Do not try to infer the learner's intent from SQL text when the result can be checked safely.

## Feedback copy and states

### Default state

Use a neutral callout below the challenge requirements:

> Write your query, then choose **Run and check**. We check the result, not the exact SQL you used.

### Success state

Use a green success card, a check icon, and no confetti that obscures results.

```text
Challenge complete
You found all 14 customers who have not placed an order.

Why this works: your query preserves customers even when no matching order exists.
Next: try “Calculate each order's total” to practice a one-to-many join.
```

The first sentence must mention the business outcome, ideally with a meaningful count. The second sentence explains the transferable concept without exposing a single required technique. Offer `Next challenge` and `Review solution` actions.

### Valid SQL, incorrect answer

This is an amber “Not quite” state, not an error. Keep the user’s Results tab visible.

| Validation finding | Message |
| --- | --- |
| Extra or missing column | `Not quite yet. Return exactly: id, name, country, signup_date.` |
| Required rows missing | `Your query ran, but it leaves out some customers with no orders. Check whether your join keeps unmatched customers.` |
| Unexpected rows included | `Your query includes customers who already placed an order. Look at the condition that identifies a missing match.` |
| Correct values, wrong required order | `The rows are right. Now sort by signup_date from oldest to newest.` |
| Zero rows | `Your query ran but returned no rows. Recheck the filter and whether NULL is tested with IS NULL.` |
| Aggregate mismatch | `The grouping is close, but the totals do not match. Check the join grain before summing values.` |
| Duplicate rows | `Some rows appear more than once. A join may be multiplying records; inspect the join keys and grouping.` |

Show one high-confidence message only. Do not claim an exact cause unless the validator can prove it. Then offer the next appropriate hint.

### Query syntax or execution error

The product must not display the entire raw database/driver error as the primary learner message. Raw errors frequently contain implementation terms, duplicate information, SQL excerpts, and can be inconsistent across engines.

Instead, present a concise error card with this structure:

```text
We could not run this query
The table name after FROM is not available in Cycle Depot.

Check the spelling, or choose one of this challenge's required tables: customers, orders.
```

The offending token is underlined in the editor whenever the engine reports a location. A collapsed `Technical details` disclosure may show a short, sanitized engine message for advanced users. It must be capped in length, rendered as text, and never include stack traces, browser paths, file contents, or a server response.

Use an error mapper above the existing `QueryResult.error` data:

| Error category | Primary message | Helpful action |
| --- | --- | --- |
| Empty query | `Start with a SELECT query for this challenge.` | `Use starter` |
| Multiple statements | `Run one read-only query at a time in Challenges.` | Highlight statement separator |
| DDL/DML attempted | `Challenges check query results, so use SELECT or WITH ... SELECT.` | Keep query editable |
| Syntax near token | `There is a SQL syntax issue near <token>.` | Underline token; `Show hint` |
| Table does not exist | `That table is not available in this workspace.` | List challenge tables; dataset-switch action if relevant |
| Column does not exist | `We could not find the column <name> in <table>.` | Open table in Schema Explorer |
| Ambiguous column | `This column exists in more than one table. Prefix it with its table alias.` | Show example `o.id` |
| Grouping error | `This selected column must be grouped or aggregated.` | Link/open grouping hint |
| Type mismatch | `These values cannot be compared in that form.` | Show column types and relevant hint |
| Query timeout/resource failure | `This query is taking too long for the practice environment.` | Cancel/retry; suggest smaller intermediate result |
| Engine unavailable | `The SQL engine is still loading or could not start.` | `Retry` |
| Unknown error | `We could not run that query.` | `Try again`; optional sanitized details |

The mapper may use well-tested message patterns from PostgreSQL and DuckDB, but it must always have a safe generic fallback. It should never expose an exception object to the UI.

### Challenge configuration or validator failure

If a challenge's expected query, validator, or content definition breaks, it is a product defect, not learner failure. Disable `Run and check` for that challenge and show:

```text
This challenge is temporarily unavailable.
Your query has not been graded. Choose another challenge or return later.
```

In development, log a bounded diagnostic to the console. In production, use an approved error-monitoring event containing challenge id/version and error category only, never submitted SQL or result rows.

## Dataset and engine switching

### Challenge ownership rule

Every challenge belongs to one built-in `dataset` and declares supported `engines`. A challenge only runs in its own engine-and-dataset session. It must never silently query tables from another loaded database.

This means `orders` in Cycle Depot and a table that happens to be named `orders` in another dataset are not interchangeable. Challenge validation always uses the challenge's declared dataset.

### Selecting a challenge for another dataset

If the learner selects a Cycle Depot challenge while Olist is active, show a confirmation sheet before changing anything:

```text
This challenge uses Cycle Depot
You are currently exploring Olist. Challenges run against their own dataset so table names and expected answers stay consistent.

[Switch to Cycle Depot]  [Stay in Olist]
```

`Switch to Cycle Depot` must preserve the current editor text as an unsaved workspace draft. It must not overwrite it with the challenge starter query until the learner chooses `Use starter` or confirms `Replace editor`. Switching back restores the saved draft for that engine-and-dataset combination.

If the challenge requires DuckDB, for example a future TPC-H challenge, the confirmation says `Switch to DuckDB and TPC-H`. It also preserves the draft. Disabled engine buttons must explain why rather than silently changing selection.

### Referencing a table from a different dataset in SQL

Built-in datasets are separate in-memory sessions, not attachable schemas. A query cannot join `Cycle Depot.orders` to `Olist.orders` in the current architecture.

When the engine reports a missing table, the challenge error mapper should check a static table-to-dataset index:

```text
`orders` is available in Cycle Depot, not Olist.
This challenge uses Cycle Depot. Switch datasets to run it there.
[Switch to Cycle Depot]
```

Only provide this guidance when the table name maps unambiguously to one other built-in dataset. Otherwise use the generic table-not-found message. Never guess a dataset from a similarly named table.

### User uploads

For version one, challenges do not include user-uploaded tables. If an upload workspace is active, display:

```text
Challenges use a course dataset with known answers. Switch to Cycle Depot to start this challenge.
```

Do not combine a challenge oracle with volatile user data. A later “challenge against your data” feature needs a different validation model.

## Drafts, progress, and reset

### Draft preservation

The existing single `sqlx.draft` key is insufficient once dataset switching must not discard a learner's work. Store drafts by workspace:

```text
sqlx.draft.<engine>.<dataset>
sqlx.challenge-draft.<challenge-id>.<engine>.<dataset>
```

- Preserve a normal workspace draft when entering a challenge.
- A challenge may have its own draft so leaving and returning restores unfinished work.
- `Reset query` affects only the active challenge draft and requires confirmation if the draft is non-empty and changed from its starter SQL.
- `Exit challenge` returns the normal workspace draft; it does not delete progress or the challenge draft.

### Progress

Store only non-sensitive metadata:

```ts
type ChallengeProgress = {
  version: number;
  completedAt: number;
  attempts: number;
  revealedHintCount: number;
  revealedSolution: boolean;
};
```

Use a key such as `sqlx.challenge-progress.<challenge-id>`. Do not store submitted SQL by default as progress data; the editable local draft already handles continuity. A new challenge version invalidates its prior completion status, but may retain a non-graded “previously completed” indicator later.

## Read-only submission policy

Challenge submissions must accept only one data-reading statement. This protects dataset integrity and makes validation meaningful.

- Allow `SELECT` and `WITH` statements whose final action is `SELECT`.
- Reject `INSERT`, `UPDATE`, `DELETE`, `MERGE`, `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `CALL`, `COPY`, `ATTACH`, `INSTALL`, `LOAD`, and transaction control.
- Reject multiple statements even if they are all reads.
- Parse and inspect statements with a proper SQL-aware splitter, never a naive semicolon split. The project already has statement-range handling that respects quoted strings and comments.
- Use a conservative allow-list. If the first meaningful keyword cannot be classified safely, reject it with the generic read-only message.

The normal playground remains available for deliberate data manipulation. Challenge mode must not change its behavior.

## Component and module design

Suggested structure:

```text
src/components/sql-playground/challenges/
  definitions.ts              // registry and initial Cycle Depot content
  types.ts                    // ChallengeDefinition and outcomes
  validate.ts                 // result normalization and matching
  query-policy.ts             // single-statement read-only check
  error-copy.ts               // sanitized error categorization
  progress.ts                 // localStorage read/write and versioning
  ChallengeList.tsx           // sidebar group and progress
  ChallengePanel.tsx          // prompt, hints, solution, feedback
  DatasetSwitchDialog.tsx     // confirms engine/dataset changes safely
```

Integrate `ChallengeList` in `SchemaExplorer` or the parent sidebar composition, but keep challenge selection state in `SqlPlayground`. The parent already owns active engine, dataset, SQL, result, schema refresh, and tab selection.

The existing `QueryResultTable` remains responsible for normal results. Challenge feedback is an additional card in `ChallengePanel`, not a replacement for the result table.

## Accessibility and interaction requirements

- Challenge items are buttons with an accessible label including completion state and difficulty.
- When a challenge opens, focus moves to its title only after the learner activates it; do not steal focus after a run.
- Feedback has a polite live region. Query errors have an assertive announcement only when submitted.
- Hint and solution controls expose expanded/collapsed state and work entirely by keyboard.
- Never convey passed/incorrect state by color alone; include icon and text.
- The confirmation sheet traps focus, closes with Escape, and clearly identifies the destructive implication of replacing editor text.
- On narrow screens, the challenge card appears above the editor and may collapse requirements, but `Run and check` remains visible without horizontal scrolling.

## Analytics and privacy

No learner SQL, result values, schema names, or raw engine errors are sent off-device.

If anonymous product analytics is approved, restrict it to events such as `challenge_started`, `challenge_passed`, `hint_opened`, `solution_revealed`, and `challenge_error_category`, with challenge id/version and active engine. Do not include query text, table values, result rows, filenames, or error payloads.

## Acceptance criteria

### Core flow

- A Cycle Depot challenge can be opened, started, solved by at least two valid SQL forms, and marked complete locally.
- Correct answers pass even when they use a different valid join or subquery strategy than the reference solution.
- An incorrect but valid query receives an actionable “Not quite” message without being called a syntax error.
- A query engine error is shown with friendly primary copy, a hint where available, and an editor underline when a location is known.
- The UI never renders an uncaught exception, a stack trace, or an unbounded raw engine error.
- Revealing a hint or solution does not replace the learner’s SQL.

### Dataset behavior

- Selecting a challenge for another dataset requires confirmation and preserves the prior dataset draft.
- Challenge validation always runs against the challenge's declared engine and dataset.
- The product does not support joins across different built-in datasets and explains the mismatch clearly.
- User-uploaded tables cannot be used in first-release challenge validation.

### Quality and testing

- Unit tests cover result normalization, unordered duplicate-sensitive matching, ordered matching, `NULL`, date, boolean, and numeric-tolerance comparisons.
- Unit tests cover every query-policy rejection and each error-copy category, including a generic unknown-error fallback.
- Each challenge's `expectedSql` runs successfully for every declared engine in a test fixture.
- Integration tests cover pass, missing required column, extra row, empty result, syntax error, invalid table, dataset switch, engine switch, draft restoration, hint progression, solution reveal, and progress restoration.
- Browser tests verify keyboard-only use, screen-reader labels, narrow viewport layout, and a challenge configuration failure that remains contained.

## Delivery sequence

1. Define types, the Cycle Depot challenge registry, read-only policy, and result validator with tests.
2. Add challenge selection, activation, draft storage by workspace, and the dataset/engine switch confirmation.
3. Add `ChallengePanel`, success/incorrect feedback, progress storage, and the first three beginner challenges.
4. Add sanitized error categorization, editor integration, and remaining Cycle Depot challenges.
5. Perform accessibility, responsive, engine-parity, and regression testing before adding challenges for larger datasets.

## Decisions to confirm

1. Should a completed challenge remain marked complete after the learner reveals its solution, or should the UI distinguish `completed independently` from `completed with solution`?
2. Should challenge mode show a per-group progress bar immediately, or only individual completion checks in version one?
3. Is one neutral starter scaffold per challenge preferable, or should all challenges start from a blank editor to maximize retrieval practice?
4. Do you want the first lesson-to-challenge deep links in the same release, or after the standalone sidebar experience is stable?
