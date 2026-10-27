---
name: sql-lesson-revamp
description: "Create or rewrite a StackBlueprint SQL lesson from user-supplied content, using the GROUP BY vs Window Functions lesson as the fixed template: numbered WHY / INTUITION / HOW / EXAMPLE / TRADE-OFFS / PRACTICE sections, an intuition animation in section 2, a step-by-step SQL animation in section 4, an inline SQL sandbox practice, takeaways, and a 4-question quiz. Use whenever the user gives SQL lesson content to format, or asks for a new or revamped SQL lesson."
---

# SQL Lesson Template

Every SQL lesson follows the structure of `groupByVsWindow` in `src/lessons/sql/window-functions-content.ts`. The user supplies the content. Your job is to **keep their wording exactly** and format it into this structure. Do not rewrite, summarise, or add filler. Add only what the structure needs (for example a syntax table, a visual, a quiz).

Read `AGENTS.md` (sections 1 to 5) and `.agents/skills/course-creation/SKILL.md` first. Treat both as binding.

## When to use this skill

- The user pastes or describes SQL lesson content and wants it formatted into a lesson.
- The user asks for a new SQL lesson, or to rewrite an existing one to match the standard.

Do not use it for a typo-only change or for a playground-only feature.

## Step 0: Decide the mode and the location

- **New lesson:** find the module and the lessons immediately before and after it. Do not assume later concepts. Do not move or rename other lessons. If the requested placement breaks prerequisite order, say so and ask.
- **Existing placeholder (`sections: []`):** keep its slug, route and progress id, and fill in `sections`.
- **Existing real lesson:** keep slug, route and progress id unless the user asks otherwise.

## Step 1: Section order (fixed)

Use numbered headings in the style `N. NAME: subtitle`, taken from the user's content when they provide them.

| # | Section | Sections to use |
|---|---------|-----------------|
| 1 | `1. WHY: ...` | `prose`, the lesson's data as a `table`, then a `callout` (tone `info`) for the core idea |
| 2 | `2. INTUITION: ...` | `prose`, a **visual** (see Step 3), then a `callout` (tone `info`) titled "The key difference" using the user's wording |
| 3 | `3. HOW: ...` | `prose` with `A.` / `B.` sub-headings. Each approach gets a `code` block (`language: "sql"`, with `caption`). If the lesson introduces new syntax, add a syntax `code` block (`language: "text"`) and a `table` captioned "Reading the syntax" with columns Part / Role / Required?. Explain the conceptual steps in `prose` after the code. No animation in this section |
| 4 | `4. EXAMPLE: ...` | A short `prose` lead-in (user's wording), then the **step-by-step SQL `animation`** (always required, it replays the lesson's example query step by step), then a captioned `table` per result with the row count in the prose before each. Close with the user's "Notice that..." line as `prose` |
| 5 | `5. TRADE-OFFS: ...` | A `table` (Requirement / Preferred approach). A `callout` (tone `warn`) plus `code` blocks (fails / works) for the main pitfall. Then a `list` titled "Important limitations" for the rest. **Never use a table for limitations** |
| 6 | `6. PRACTICE: Your turn` | A `prose` section with `body: []`, then one `sql-practice` section. Do not repeat the task text as prose. Never label practice "Task A" or "Task B" |
| 7 | End | `takeaways` (the last content section), then `quiz` (always the very last section) |

The lesson page adds the mark-complete button. Do not add one yourself.

### Skeleton

```ts
const myLesson: LessonContent = {
  slug: "my-lesson",
  title: "My Lesson",
  subtitle: "short / slash / separated / topics",
  sections: [
    { kind: "prose", heading: "1. WHY: ...", body: ["..."] },
    { kind: "table", caption: "The employees table", headers: [...], rows: [[...]] },
    { kind: "callout", tone: "info", title: "The idea", body: "A **term** helps you ... `GROUP BY`." },
    { kind: "prose", heading: "2. INTUITION: ...", body: ["..."] },
    { kind: "visual", id: "<visual-id>", caption: "..." },
    { kind: "callout", tone: "info", title: "The key difference", body: "..." },
    { kind: "prose", heading: "3. HOW: ...", body: ["A. First approach"] },
    { kind: "code", language: "sql", caption: "...", code: `SELECT ...` },
    { kind: "code", language: "text", caption: "General syntax", code: `...` },
    { kind: "table", caption: "Reading the syntax", headers: ["Part", "Role", "Required?"], rows: [[...]] },
    { kind: "prose", heading: "4. EXAMPLE: ...", body: ["..."] },
    { kind: "animation", variant: "<stage-variant>", caption: "..." },
    { kind: "table", caption: "...", headers: [...], rows: [[...]] },
    { kind: "prose", heading: "5. TRADE-OFFS: ...", body: ["..."] },
    { kind: "table", caption: "Choose by the output you need", headers: ["Requirement", "Preferred approach"], rows: [[...]] },
    { kind: "callout", tone: "warn", title: "...", body: "..." },
    { kind: "code", language: "sql", caption: "Fails: ...", code: `...` },
    { kind: "code", language: "sql", caption: "Works: ...", code: `...` },
    { kind: "list", heading: "Important limitations", items: ["..."] },
    { kind: "prose", heading: "6. PRACTICE: Your turn", body: [] },
    { kind: "sql-practice", challengeId: "...", title: "...", prompt: "...", playgroundHref: "/sql-playground?practice=..." },
    { kind: "takeaways", items: ["..."] },
    { kind: "quiz", questions: [ /* 4 questions */ ] },
  ],
};
```

## Step 2: Formatting rules

- Put SQL keywords, functions and identifiers in backticks inside `prose`, `callout`, `list` and `takeaways` text: `GROUP BY`, `OVER`, `WHERE`, `SUM(salary)`.
- Use `**bold**` for the key term the lesson teaches, in the first callout, the key-difference callout and takeaways.
- Table cells render plain text. Do not rely on backticks or bold in cells.
- **No em dashes** anywhere in lesson text. Use commas, colons or periods.
- Use `list` for bullets (`{ kind: "list", heading, items }`). Never use `prose` with hyphens or a table for bullets.
- The syntax block uses `language: "text"`. SQL keyword colors come from `highlightSql` in `src/components/sql/SectionRenderer.tsx`. If the lesson introduces keywords or functions that are not highlighted (for example `ROW_NUMBER`, `LAG`), add them to its `KEYWORDS` set.
- Every `table` and `code` section gets a `caption`.
- A heading-only `prose` section needs `body: []` or a short lead-in line from the user's content. Never leave `body` out.
- Do not use ASCII diagrams.

## Step 3: Visuals (pick what fits)

Never use the `diagram` section. Never use a database-table animation for the intuition step.

1. **Intuition visual** (simple, shows the idea with real-world objects). A small React component in `src/components/sql/<topic>/`, modeled on `TwoRoomsVisual.tsx` (people in rooms) or `CalculatorWindowVisual.tsx` (calculators in one shared window). Build it on the shared `VisualPlayer.tsx` (frame, step chip, note and play / back / next / restart bar): pass `steps` (`label` and `note`) and a `renderStep(step)` body. Four steps, dark mode safe, no layout jump between steps, no overflow at 375px.
   - Register it as a `visual` section. Add its `id` to the `visual` section type in `src/lessons/sql/foundations-content.ts`, and add a `case` for it in `SectionRenderer.tsx`. `visual` branches on `section.id` (`window-two-rooms`, `window-calculator`, `window-order-slips`, `window-partition-explorer`), so give each new visual a distinct `id`. A `visual` can also be an interactive control instead of a stepped animation, such as `PartitionExplorer.tsx` (tabs that highlight one partition at a time); use that when the user's content describes an "Explore" control.
2. **Step-by-step SQL animation (required, placed in section 4 EXAMPLE).** An `animation` section using `Stage[]` (see `src/components/sql/window-functions/group-by-vs-window.tsx`). Put the stage file in `src/components/sql/<topic>/` and register the variant in `src/components/sql/animation-registry.ts`. Each step shows one state change.
3. Images, if any, use the zoomable image component with a descriptive `caption`. Multiple related images use `image-carousel`.

Keep animation tables narrow. Do not render more columns or long values than the layout can show without overlap.

Keep every SQL animation short enough that its controls are visible without scrolling: no `canvasMinHeight` (the player already reserves the tallest step), keep the side panel cards (put two cards side by side with `grid grid-cols-2` rather than stacking them), and a step height of about 450 to 600px. Measure the hidden step wrappers (`[aria-hidden="true"]` children of the animation figure) in the browser. All steps should be within about 50px of each other.

Keep the layout still while stepping. The intuition visuals reserve the tallest step automatically through `VisualPlayer`, so the canvas and controls never move. Every stage in one animation must have the same number of SQL lines (pad with a short `--` comment line), and no SQL line may be long enough to wrap in the narrow query panel (about 38 characters), so split long lines. Then measure, step by step, the height of the query panel and the top of the first table row. They must be identical in every step of every stage, and the control bar must not move.

## Step 4: Practice (inline SQL sandbox, not a link to the playground)

1. **Data.** Add the lesson's small tables to `DDL`, the seed `statements`, the `tables` info list and `SCHEMA_HINT` in `src/components/sql-playground/db/dataset.ts`. Cycle Depot already has `orders` and `employees` with different columns, so use new names (for example `staff_salaries`, `customer_orders`). Update `stats` and the "N tables" wording in `src/components/sql-playground/db/datasets/index.ts`.
2. **Challenge.** Add one to `src/components/sql-playground/challenges/definitions.ts` (`group: "windows"` for window lessons) with:
   - `starterSql` (comments only, safe in the editor),
   - three `hints`,
   - `solutionSql` for `postgres` and `duckdb`,
   - a hand-indented `solutionDisplay`,
   - `forbiddenSql` when the exercise bans constructs (for example "Do not use GROUP BY, PARTITION BY, or a subquery"): a list of `{ pattern, message }` regexes tested with comments and quotes removed; a match shows the message instead of running the query,
   - `requiredSql` (a list of `{ pattern, message }` regexes the query must match) when the result alone cannot prove the learner used the taught construct, for example an explicit `ROWS` frame where the data has no ties,
   - `requiresOuterOrderBy: true` when the lesson teaches that only the outer `ORDER BY` guarantees display order (the query must then contain its own top-level `ORDER BY`),
   - a `result-set` `validator` (`requiredColumns`, `columnOrder: "exact"`, `rowOrder: "any"` unless order is the point),
   - `success` copy.
   Add a matching entry in `src/components/sql-playground/content/practice.ts`.
3. **Lesson.** Use `{ kind: "sql-practice", challengeId, title, prompt, playgroundHref }`. The prompt is the user's practice wording, minus any "Task" labels. Do not show the table again as a lesson `table`.
4. **Runtime (do not weaken).** The practice runs in `src/components/sql/sandbox/` (isolated Web Worker, in-memory PostgreSQL, read-only transaction, 5 second timeout, 500-row cap). The query check in `src/components/sql-playground/challenges/query-policy.ts` allows a single `SELECT` or `WITH` and blocks writes, `INTO`, and risky functions. Reveal solution stays locked until the learner runs a query once. Learner-typed text uses plain keyboard ASCII.
5. Quiz and practice must agree with the same table and column names.

## Step 5: Quiz (4 questions)

Always include these four kinds:
1. A row-count or output-shape question.
2. A pick-the-right-approach question.
3. A pick-the-correct-query question (one correct query, three plausible wrong ones: misplaced clause, missing required clause, illegal location).
4. The lesson's main pitfall.

Give each question a unique `id` prefixed with the lesson slug (`<slug>-row-count`), `options`, `correctIndex`, and an `explanation`. Questions that mention a table must state its columns, because the lesson does not repeat the practice table.

## Step 6: Registration checklist (AGENTS.md section 4)

- [ ] `src/lessons/roadmap.ts`: slug, title, exact `path`, `icon`.
- [ ] Track index `src/routes/sql/index.tsx`: topic card with `routeBase` and `modules` list. Include `path` data the cards need.
- [ ] Content registry: the lesson is in the module's topic `lessons` array in the right content file (for window lessons, `src/lessons/sql/window-functions-content.ts`, `WINDOW_FUNCTION_TOPICS`).
- [ ] `src/components/sql/SectionRenderer.tsx` renders every section kind used (`visual`, `list`, `sql-practice`, `animation`, `takeaways`, `quiz`).
- [ ] A new module group gets its own route folder under `src/routes/sql/<module>/$topic` and its own content file under `src/lessons/sql/`, like `window-functions`.
- [ ] Placeholders stay `sections: []`.

## Step 7: Verify (all of it)

1. `npx tsc --noEmit -p .` is clean.
2. `npm run rivet:lessons` runs. Commit the regenerated `src/lib/rivet/available-lessons.generated.ts` when it changes.
3. Search the lesson for `—` (em dash). There must be none.
4. Start the dev server (`preview_start` with the `dev` configuration) and open the lesson as a learner:
   - the visual plays through all steps and the SQL animation steps through every stage,
   - keywords are highlighted in code blocks and in text,
   - the practice boots, a **correct query passes**, and a **wrong query** gives sensible feedback (missing column, extra column, wrong approach, typo, write attempt),
   - Reveal solution is locked before the first run and shows indented SQL after,
   - Hint steps through three hints,
   - dark mode and a narrow width look right.
5. Never leave a dev server running. Stop it when done.

## Step 8: Report

Say what was formatted, which files changed (so the user can push them), what was verified and what was not. Name any assumption instead of presenting it as fact. Do not claim a check you did not run.

## Module quiz and cheatsheet

A module's `...-quiz` and `...-cheatsheet` lessons are not teaching lessons. Do not build them with this template. Use `.agents/skills/sql-module-quiz/SKILL.md` and `.agents/skills/sql-module-cheatsheet/SKILL.md`.
