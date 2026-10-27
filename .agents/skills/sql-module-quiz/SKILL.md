---
name: sql-module-quiz
description: "Create or fix the scored final quiz (assessment) lesson of a StackBlueprint SQL module, using the Window Function Foundations quiz as the reference: start screen, tabs A to D plus Results, MCQ only, auto graded, a SQL challenge scored by rules, pass rules, and Rivet hidden until results. Use when asked to create, rebuild or fix a module final quiz or assessment."
---

# SQL Module Final Quiz

Reference implementation (copy its structure, do not invent a new one):
- Config: `src/lessons/sql/window-foundations-assessment.ts`
- Component: `src/components/sql/assessment/FinalAssessment.tsx`
- Lesson entry: `windowFoundationsQuiz` in `src/lessons/sql/window-functions-content.ts`
- Renderer case: `assessment` in `src/components/sql/SectionRenderer.tsx` (lazy loaded)
- Section type: `{ kind: "assessment"; assessmentId: ... }` in `src/lessons/sql/foundations-content.ts`

Read `AGENTS.md` and `.agents/skills/course-creation/SKILL.md` (Final Quiz Contract) first. Both are binding.

## What the lesson is

A test environment, not a teaching page. The lesson has exactly one section, `{ kind: "assessment", assessmentId }`. No intro prose, tables, callouts, Key Takeaways or generic fallback content around it. Only test material taught in earlier lessons of the same module. Map every question to a lesson before writing it.

## Layout

1. Start screen: total points, passing score, a section table (section, what it tests, points), how to pass, a Start button.
2. After Start: tabs A, B, C, D and Results.
3. Results: score per section, pass or fail, a review of every wrong answer with the explanation, and a Retake button.

## Sections (100 points, pass at 80)

Everything is auto graded. Never use free text answers, because a vague answer can look partly right and cannot be graded fairly.
- **A (20)**: mini quiz of multiple choice questions, 4 points each. Include some True/False.
- **B (20)**: output predictions. The learner types numbers, the page checks them. Each prediction has a multiple choice explanation question (4 points). Show the lesson's data table above the code.
- **C (40)**: one SQL challenge run in the inline sandbox. Score by a rule list: `valid` (5), `result` (15, exact columns, rows and values, exact column order), then regex rules for the required constructs (CTE, partition, order, frame, final ORDER BY). Rule points must sum to 40. Show a requirements list and the expected columns table.
- **D (20)**: interview style multiple choice, 5 points each. Cover fundamentals and debugging, with a code block where useful.

## Writing the questions

- Options must be close to each other. The correct one differs in one precise detail (default frame, execution order, which clause does what), so the learner must understand the concept to choose.
- Vary the position of the correct option.
- Every question has a unique `id` and an `explanation` that says why the right option is right and why the closest wrong option fails.
- Verify every number by running the query in the playground or by hand. A wrong expected value is the most common bug.
- No em dashes. No hyphens used as dashes.

## The SQL challenge (C)

1. Add the tables to `src/components/sql-playground/db/dataset.ts` (DDL, seed, `tables` info, `SCHEMA_HINT`) and update the stats in `db/datasets/index.ts`. Reuse tables from earlier lessons when possible.
2. Add a challenge to `src/components/sql-playground/challenges/definitions.ts` with `columnOrder: "exact"`, `forbiddenSql` (for example correlated subquery, `GROUP BY`), `requiredSql`, `requiresOuterOrderBy`, a hand indented `solutionDisplay`, and a result-set validator. The checker must enforce column order against the oracle.
3. Do not weaken `query-policy.ts` or the sandbox (isolated worker, read only transaction, 5 second timeout).

## Pass rules

Pass needs all three, each proven by auto graded evidence:
- total score at or above the pass score,
- valid SQL in the main challenge,
- no critical misconception (a named set of questions that must be correct).

## Events and Rivet

- Rivet must stay hidden until the result screen. `LessonLayout.tsx` treats a lesson whose sections are all `assessment` as quiz pending.
- Fire `quiz-started` on Start and on Retake.
- Call `emitQuizResults(items)` when the Results tab opens, with the review items.
- Fire `quiz-passed` on a pass so the lesson completes.
- Do not show the generic placeholder Key Takeaways box. `LessonLayout.tsx` hides it for `assessment` pages.

## Register

Follow section 4 of `AGENTS.md`: roadmap, track index, content registry, `SectionRenderer`. Add the new `assessmentId` to the section type, the renderer, and the component's config lookup. Then run `npm run rivet:lessons`.

## Verify (do not skip)

1. `npx tsc --noEmit -p .` is clean.
2. Open the lesson in the dev server. Check the start screen, each tab, an all correct run (pass), an all wrong run (fail), and the challenge with a correct query, a wrong column order query and a syntax error.
3. Check Rivet is hidden before Results and visible after.
4. Check dark mode and 375px width (no horizontal overflow).
5. Stop the dev server.

## Report

List the files changed so the user can push them, say what was verified and what was not.
