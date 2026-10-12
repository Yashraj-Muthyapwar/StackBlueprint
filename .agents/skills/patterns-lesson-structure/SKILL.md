---
name: patterns-lesson-structure
description: Create or revamp StackBlueprint Patterns (DSA) lessons, such as two pointers, sliding window, or binary search, with the staged lesson structure, the shared pattern visualizer, practice exercises, a hardened quiz, and the completion criteria. Use for any lesson under /patterns/<pattern>/<lesson>.
---

# Patterns Lesson Structure

Use this skill to create or revamp a lesson in the Patterns track (`/patterns/<pattern>/<lesson>`). The reference implementation is **Two Pointers: Opposite Ends** (`src/lessons/two-pointers/opposite-ends.ts`). When in doubt, open it and copy its shape.

The goal of every pattern lesson: a learner understands **why** the pattern exists, builds the **intuition**, follows it **step by step**, watches the **code run** with real values, knows **when it works**, and proves it in **practice** and a **quiz** they cannot shortcut.

## 0. Choose the mode

- **Create**: the lesson does not exist. Add the lesson file, register it in `src/lessons/roadmap.ts` (`PATTERNS` → the pattern's `lessons` array), and build its problem set, sections, practice and quiz together.
- **Revamp**: the lesson exists. Keep its `slug`, route, roadmap position and progress id. Replace the content and remove whatever the old version no longer uses (dead canvases, view types, Step fields, helper files), after confirming nothing else imports them.

### Content fidelity

- When the user supplies lesson text, **use it verbatim**. Only add structure: headings, markers, components, ordering. Do not reword, trim or "improve" it.
- Words the user did not write (narrations, quiz explanations, takeaways, exercise feedback, pseudocode) must be original, specific and free of filler.
- Never use em dashes in lesson text you write. If supplied text has headings like `1. WHY — Why do we use this pattern?`, split them into a section marker (`1 · Why`) and a heading (`Why do we use this pattern?`). That is structure, not a content change.

## 1. How a pattern lesson is wired

A pattern lesson is a `LessonBuilder` with a `sections` array. When `sections` is present, `src/routes/patterns/$pattern/$lesson.tsx` renders it with the global `LessonLayout`, which provides the breadcrumb, progress bar, floating table of contents, the "mark complete" button and prev/next navigation. You do not build any of those.

The builder still needs the legacy player fields to satisfy the type. Keep them minimal:

```ts
export const myLesson: LessonBuilder<Record<string, never>> = {
  slug: "my-lesson",
  title: "Pattern Name: Lesson Name",
  subtitle: "One sentence on what the learner will be able to do.",
  problem: "One sentence problem statement.",
  spotIt: ["Interview signals that suggest this pattern."],
  avoidWhen: ["Situations where the pattern is the wrong tool."],
  takeaways: ["Short recap lines (used by Rivet)."],
  variant: "my-lesson",
  view: "array",
  code: canonicalPythonSolution,
  sections: mySections,
  defaultInputs: {},
  inputs: [],
  build: () => [{ line: 1, array: [1, 2, 3], narration: "Use the concept lesson." }],
};
```

The route already listens for the quiz's `quiz-passed` event and marks the lesson complete. Do not add your own completion logic.

## 2. Lesson structure

Use six numbered stages. Each stage opens with a `prose` section that has an `eyebrow` (the section marker) and a `heading`:

```ts
{ kind: "prose", eyebrow: "1 · Why", heading: "Why do we use this pattern?", body: ["..."] },
```

The eyebrow renders as a numbered marker (`01  WHY ────`) and **names the stage in the table of contents**. Only stage-opening sections get an eyebrow; follow-up prose inside a stage has no heading.

| Stage | Eyebrow | Purpose | Typical sections |
|---|---|---|---|
| 1 | `1 · Why` | The problem the pattern solves and the naive approach it beats | `prose`, `code` (the input) |
| 2 | `2 · Intuition` | A physical or visual metaphor | a lesson-specific intuition animation, `prose` |
| 3 | `3 · How` | The exact moves, frame by frame | `code` (starting state), `pointer-steps` |
| 4 | `4 · Example` | The real code running on real values | `pattern-visualizer`, `pattern-example`, `list`, `callout` |
| 5 | `5 · Trade-offs` | When it works, when it does not, the cost | `prose`, `table` |
| 6 | `6 · Practice` | Trace it by hand before coding | `code`, `prose`, a lesson-specific practice component |

Then, in this order, always last:

1. `{ kind: "takeaways", items: [...] }`: 4 to 6 concrete, testable statements.
2. `{ kind: "quiz", questions: [...] }`: see section 6. The quiz is always after the takeaways.

Rules:
- Interview rules or warnings go in a `callout` (`tone: "info"` for rules, `"warn"` for common mistakes).
- Cost tables use `table` with headers like `["Measure", "Cost"]`.
- Show the input array as a `code` section. Runnable code goes in `pattern-example`, not `interactive-code`, so it follows the visualizer's selected problem.

## 3. Shared components and how to use them

All shared pattern-lesson pieces live in `src/components/dsa/shared/`. A lesson supplies **data**; the shared components supply the UI, layout, responsiveness and fixed sizing.

| File | What it is | Used through |
|---|---|---|
| `pattern-trace.ts` | Data contract (`Problem`, `TraceStep`, `Token`) and helpers (`L`, `R`, `V`, `OUT`, `P`, `toItems`, `listText`, `range`, `pointerStats`) | imported by your `problems.ts` |
| `PatternVisualizer.tsx` | The step-through animation: file-name dropdown, presets, custom input, array or bars stage, status card, transport controls, Python / Algorithm toggle with live values | `{ kind: "pattern-visualizer", problemSet: "<id>" }` |
| `PatternExample.tsx` | Runnable Python block that always matches the problem picked in the visualizer | `{ kind: "pattern-example", problemSet: "<id>" }` |
| `PointerSteps.tsx` | A small stepper of array snapshots with `left` / `right` markers | `{ kind: "pointer-steps", steps: [...] }` |
| `problem-store.ts` | Shares the selected problem between the visualizer and the example, keyed by problem set | used internally |
| `problem-sets.ts` | Registry of problem sets by id | add one line per lesson |

### 3.1 Write the problem set

Create `src/components/dsa/<pattern>/<lesson>/problems.ts` and export `Problem[]`. Each problem is pure data plus a `build` function. Copy the structure of `two-pointers/opposite-ends/problems.ts`.

```ts
import { L, OUT, P, R, V, pointerStats, toItems, type Problem, type TraceStep }
  from "@/components/dsa/shared/pattern-trace";

function buildMyProblem(values: number[], target: number): TraceStep[] {
  const items = toItems(values);
  const steps: TraceStep[] = [];
  let left = 0;
  let right = items.length - 1;
  steps.push({
    phase: "Placing pointers",                   // short status, sentence case
    items, left, right,
    codeLines: [2],                              // 1-based lines in `python`
    codeNote: [L("left"), P(" = "), OUT("0")],   // the active line with real values
    algoLine: 1,                                 // 1-based line in `algorithm`
    algoNote: [L("left"), P(" starts at index "), OUT("0")],
    narration: "Plain-English explanation of this single step.",
    stats: [...pointerStats(left, right)],       // keep the SAME labels on every step
  });
  // ...one push per meaningful line of execution
  return steps;
}

export const MY_PROBLEMS: Problem[] = [
  {
    id: "my-problem",
    label: "Human Name",
    file: "my_problem.py",                       // shown as the dropdown trigger
    view: "cells",                               // "cells" or "bars"
    settledStyle: "placed",                      // "placed" | "eliminated" | "none"
    hasTarget: false,
    maxValues: 8,
    presets: [{ label: "Odd length", values: [10, 20, 30, 40, 50] }],
    python: ["def my_problem(arr):", "    ..."],
    algorithm: ["set left to the first index", "..."],
    complexity: { time: "O(n)", space: "O(1)" },
    example: { call: "print(my_problem([1, 2, 3]))", output: "[3, 2, 1]" },
    validate: (values) => (values.length ? null : "Enter at least one number."),
    build: (values) => buildMyProblem(values, 0),
  },
];
```

Then register it in `src/components/dsa/shared/problem-sets.ts`:

```ts
export const PROBLEM_SETS: Record<string, Problem[]> = {
  "opposite-ends": OPPOSITE_ENDS_PROBLEMS,
  "my-lesson": MY_PROBLEMS,
};
```

and use it in the lesson: `{ kind: "pattern-visualizer", problemSet: "my-lesson" }` and later `{ kind: "pattern-example", problemSet: "my-lesson" }`.

### 3.2 `TraceStep` field guide

| Field | Effect |
|---|---|
| `items` | The array for this frame. Keep each value's `id` stable so swaps animate across. Create a new array when values move. |
| `left`, `right` | Pointer positions (`null` before a pointer exists). |
| `focus` | Indices being read (amber). |
| `swapped` | Two indices that just traded places (violet, animated). |
| `settled` | Indices finished with, styled by `settledStyle`: `placed` (mint), `eliminated` (faded, struck through). |
| `found` | Highlights `left` and `right` as the answer. |
| `arc` | Arc between `left` and `right` with a label: `amber` dashed for reading, `violet` for swapping, `mint` for a match, `rose` dashed for a rejected comparison. |
| `bracket` | Shown when there is no arc: a bracket over a range (`muted` for "still to process", `mint` for done). |
| `water` | Bars view only: water above each bar. |
| `codeLines` / `codeNote` | Highlighted Python lines and the live-values row beneath the last one. |
| `algoLine` / `algoNote` | The same for the pseudocode view. |
| `stats` | Variable chips in the status card. |

Colour meaning is fixed across the site: **left = mint, right = blue, reading = amber, swapping = violet, rejected = rose**. Do not repurpose these colours.

### 3.3 Writing good traces

- One step per meaningful line of execution: init, condition check, read, write, move, return. The final step is the return.
- `codeNote` substitutes real values into the line (`while 0 < 4 → True`, `numbers[0] = 50, numbers[4] = 10`). This is the most valuable teaching device in the visualizer; never skip it.
- Keep `algorithm` lines short (at most ~46 characters) so they do not widen the canvas. Keep Python lines short where the language allows.
- Keep the `stats` labels identical on every step of a problem (show `"·"` for "not yet").
- Narrations explain *why*, not just *what*, in one or two sentences. The longest narration of any preset sets the status card height, so do not write paragraphs.
- Provide 2 to 3 presets per problem that cover the edge cases (odd/even length, single value, no answer).
- `validate` must reject inputs the algorithm does not support (for example unsorted input for sorted Two Sum) with a clear message.

### 3.4 What the visualizer guarantees (do not re-implement)

- One fixed canvas size for every step and every problem in the set, at every width. Hidden copies of every listing and of the longest narrations reserve the space.
- Layout by container width: stacked below 54rem (array, controls, code, so the controls sit under the array), side by side above it.
- Code never overflows: it wraps with a hanging indent when stacked and never wraps side by side.
- The toolbar stays on one row on wide screens and splits into presets (scrolling, with an edge fade) plus a full-width input row on phones.
- Keyboard: arrows step, space plays. Speed control hides on narrow widths.

If a new pattern needs a different stage (a matrix, a linked list, a window), extend `PatternVisualizer` with a new `view` instead of building a separate canvas, and keep the same sizing rules.

### 3.5 Lesson-specific components

Put components unique to one lesson (the intuition scene, the practice exercises) in `src/components/dsa/<pattern>/<lesson>/`, add a section kind for each in `src/lessons/types.ts`, and render it in `src/components/python/SectionRenderer.tsx`. Reuse the global UI kit (`Button`, `Input`, `Label`, `Select` from `@/components/ui`) and the same card language: `rounded-2xl border border-hairline bg-slate-50 dark:bg-surface`, a `bg-surface-2/40` header strip, `bg-surface-2/30` control bar.

## 4. Animation rules

- Use `motion` `layout` / `layoutId` for movement and plain CSS transitions for colour, width and height.
- **Do not** use `AnimatePresence mode="wait"` for content that changes on every step; the exit animation can stall and leave stale text. Key the element and use an enter animation (`animate-in fade-in`) instead.
- Use `overflow-clip`, not `overflow-hidden`, on cards that contain focusable controls, so focusing a control cannot scroll the card internally.
- Never put stage size in `vh` or let content decide the canvas height per step. Reserve space for the largest state.
- Intuition scenes should *show* the idea physically (people walking, boxes lifting) and step with the same Play / Previous / Next / Reset controls.

## 5. Practice (stage 6)

- Start with "trace it first" exercises that use inputs, not code: identify the pointers, predict the array after one move, predict the next pointer positions.
- Follow the `ExerciseCard` pattern in `two-pointers/opposite-ends/OppositeEndsPractice.tsx` (copy it into your lesson folder): number label, title, prompt, inputs, **Check answer** and **Reset**, and feedback that says how many are correct and gives a hint. Mark each field mint or rose after checking.
- Array answers use a `grid grid-cols-N` of equal inputs with index labels so they stay on one row on phones.

## 6. Quiz and completion criteria

### Composition
- 3 to 5 multiple-choice questions that test understanding (why the loop condition, complexity, when the pattern applies), plus **one coding challenge**.
- Options are shuffled at runtime, so never write "A.", "B.", or "all of the above".
- Every question has an `explanation`.
- Write complexity as `O(n)`, `O(n²)` (no LaTeX).

### Pass rule (enforced by the shared `Quiz`)
- Four questions: **75%** to pass. Five or more: **80%**. Three or fewer: 80%.
- **Every coding question must pass**, regardless of the overall score.
- Passing fires `quiz-passed`, which marks the lesson complete. The results screen explains why a learner did not pass.

### Coding challenge hardening
A coding answer must not pass by printing the expected output, hardcoding, or using a forbidden shortcut. Use all three layers:

1. **`forbiddenCodePatterns`**: regexes with a learner-facing message each, checked on the code with comments removed. For array work, forbid slicing, `reversed()` / `.reverse()`, `sorted` / `.sort`, new lists (`list(`, `[]`, `.append`, `.copy`), `for` when the lesson teaches `while`, and `import`, `__`, `exec`, `eval`, `globals`, `setattr`, `compile`.
2. **`requiredCodePatterns`** plus `validationMessage`: the function definition and the required loop.
3. **A hidden grader in `testCode`** with `gradeLastLine: true` and a sentinel `expectedOutput` such as `"All hidden tests passed"`:
   - Reference builtins through `import builtins as _sb_b` so a learner who shadows `list` or `print` cannot break or fake it.
   - Pass a tracked `list` subclass that raises on slicing, iteration, `reverse`, `copy`, `+`, `*`, `append`, `extend`, `insert`, `pop`, `remove`, `clear` and `del`, and counts writes.
   - Run fixed edge cases (empty, one value, odd, even, duplicates, negatives) **and** random arrays generated at run time, so answers cannot be hardcoded.
   - Assert the in-place result, the return value contract, and the exact operation count when the lesson teaches it (for example `2 * (n // 2)` writes for `while left < right`).
   - Print one specific failure message, or the sentinel.

`initialCode` should contain the function stub and the test call from the challenge text, so learners can run it while they work.

## 7. Verification checklist

Run all of these before you report the lesson done.

1. `npx tsc --noEmit` and `npx eslint` on every touched file. Run `npx prettier --write` on new files.
2. **Traces**: run each problem's `build` on every preset with `npx tsx` and confirm the final step is correct, and that every `codeLines` and `algoLine` is within its listing.
3. **Examples**: run each `python.join("\n") + example.call` with `python3 -I` and compare to `example.output`.
4. **Grader**: run the `testCode` after a correct solution, an alternative correct solution (temp-variable swap), an off-by-one loop (`<=`), the untouched starter, a slicing answer, a hardcoded `print`, and a copy-based answer. Only the correct ones may print the sentinel.
5. **Browser**, on `/patterns/<pattern>/<lesson>`:
   - At 375, 768, 1024, 1280 and 1440px: no page-level horizontal scroll, no code overflow in the visualizer, the controls directly under the array when stacked, and **one height** for the visualizer across every step of every preset of every problem.
   - The dropdown switches problems and the `pattern-example` caption and code follow it.
   - The table of contents lists exactly the six stage names.
   - No console errors.

The Claude browser pane may be hidden, which freezes `motion` and CSS animations. Verify state through the DOM, and say plainly when smoothness was not observed.

## 8. Do not

- Do not edit `HeroInteractiveDemo.tsx` for a lesson; the shared visualizer is the lesson version.
- Do not add a static code block that duplicates the visualizer's listing.
- Do not build a per-lesson visualizer, store or example block; add a problem set instead.
- Do not leave old player canvases, view types, Step fields or helper files behind after a revamp. Back them up, confirm nothing imports them, then delete them.
- Do not change the global sidebar, Rivet or quiz behaviour for one lesson without asking.
