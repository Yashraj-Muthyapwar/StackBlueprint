---
name: patterns-lesson-structure
description: "Create or revamp StackBlueprint Patterns (DSA) lessons, such as two pointers, sliding window, strings, linked lists, recursion or binary search, using the staged lesson structure and the shared pattern UI kit (PatternCanvas, PatternExample, PatternStepper, PatternExercises, global Quiz) so every lesson looks and behaves like Two Pointers Opposite Ends. Use for any lesson under /patterns/<pattern>/<lesson>."
---

# Patterns Lesson Structure

Use this skill to create or revamp a lesson in the Patterns track (`/patterns/<pattern>/<lesson>`). The reference implementation is **Two Pointers: Opposite Ends**:

- Lesson content: `src/lessons/two-pointers/opposite-ends.ts`
- Lesson-owned code: `src/components/dsa/two-pointers/opposite-ends/` (`ArrayStage.tsx`, `array-step.ts`, `problems.tsx`, `OppositeEndsIntuition.tsx`)
- Shared UI kit: `src/components/dsa/shared/`

**The rule:** the *frame and controls* are shared so every pattern lesson has the same UI and UX; what is *drawn inside* is owned by the lesson. A strings lesson, a linked-list lesson and a recursion lesson all use the same canvas, stepper, exercises and quiz, and each draws its own stage.

## 0. Choose the mode

- **Create**: the lesson does not exist. Add the lesson file, register it in `src/lessons/roadmap.ts` (`PATTERNS` → the pattern's `lessons` array), and build its stage, problems, sections, exercises and quiz together.
- **Revamp**: the lesson exists. Keep its `slug`, route, roadmap position and progress id. Replace the content, then remove what the old version no longer uses (old player canvases, view types, Step fields, helper files) after confirming nothing else imports them. This folder may not be a git repository: copy anything you delete to a backup first.

### Content fidelity

- When the user supplies lesson text, **use it verbatim**. Only add structure (headings, markers, components, order). Do not reword, trim or "improve" it.
- Text the user did not write (narrations, explanations, takeaways, exercise feedback, pseudocode) must be original, specific and free of filler.
- Refer to other lessons by name ("the Opposite Ends lesson", "the Fast & Slow lesson") or as "the previous lesson" and "this lesson", never "Lesson 1", "Module 2" or similar numbering, even when the supplied text uses it.
- Never write em dashes in lesson text. If supplied headings look like `1. WHY — Why do we use this pattern?`, split them into a section marker (`1 · Why`) and a heading (`Why do we use this pattern?`). That is structure, not a content change.

## 1. How a pattern lesson is wired

A pattern lesson is a `LessonBuilder` with a `sections` array. When `sections` is present, `src/routes/patterns/$pattern/$lesson.tsx` renders it with the global `LessonLayout`, which already provides the breadcrumb, progress bar, floating table of contents, the completion button and prev/next navigation. It also listens for the quiz's `quiz-passed` event and marks the lesson complete. Do not rebuild any of that.

The builder still needs the legacy player fields to satisfy its type; keep them minimal:

```ts
export const myLesson: LessonBuilder<Record<string, never>> = {
  slug: "my-lesson",
  title: "Pattern Name: Lesson Name",            // e.g. "Two Pointers: Opposite Ends"; colon, never an em dash
  subtitle: "One sentence on what the learner will be able to do.",
  problem: "One-sentence problem statement.",
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

### 1.1 File layout

```
src/
  lessons/
    roadmap.ts                         # registers the lesson in PATTERNS → lessons
    types.ts                           # Section kinds, incl. pattern-canvas / -example / -stepper / -exercises
    <pattern>/<lesson>.ts              # LessonBuilder + sections + quiz (content only)
  components/
    python/SectionRenderer.tsx         # renders every section kind; register lesson-owned kinds here
    dsa/
      shared/                          # the UI kit; never lesson-specific
        PatternCanvas.tsx
        PatternExample.tsx
        PatternStepper.tsx
        PatternExercises.tsx
        pattern-canvas-types.ts
        problem-sets.ts                # one line per lesson problem set
        problem-store.ts
      <pattern>/
        <lesson>/                      # everything the lesson draws
          <Name>Stage.tsx              # the stage component only
          <name>-step.ts               # step type + helpers (keep non-components out of .tsx)
          problems.tsx                 # PatternProblem[] with listings, builders, inputs, Stage
          <Lesson>Intuition.tsx        # optional lesson-specific scene (+ a section kind)
```

References: `src/components/dsa/two-pointers/opposite-ends/` (`ArrayStage.tsx`, `array-step.ts`, `problems.tsx`, `OppositeEndsIntuition.tsx`) `src/components/dsa/two-pointers/fast-slow/` (`ScanStage.tsx`, `scan-step.ts`, `problems.tsx`, `FastSlowIntuition.tsx`) and `src/components/dsa/two-pointers/dutch-flag/` (`FlagStage.tsx`, `flag-step.ts`, `problems.tsx`, `DutchFlagIntuition.tsx`, three pointers and one builder shared by two problems).

Header rules, so every lesson header looks the same:
- **Title:** `Pattern Name: Lesson Name`, matching the other lessons in the pattern (for example `Two Pointers: Opposite Ends`, `Two Pointers: Same Direction (Slow & Fast)`).
- **Subtitle:** one plain sentence of at most about 95 characters, with no colon, so it stays on one line on desktop. The header balances wrapped text, so a longer subtitle breaks into two short lines and looks unfinished.

## 2. Lesson structure

Six numbered stages. Each opens with a `prose` section that has an `eyebrow` (rendered as a numbered section marker that also names the stage in the table of contents) and a `heading`:

```ts
{ kind: "prose", eyebrow: "1 · Why", heading: "Why do we use this pattern?", body: ["..."] },
```

Only stage-opening sections get an eyebrow. Follow-up prose inside a stage has no heading.

**Stage 4 (Example) always has the same three parts, in this order**, so every lesson reads the same. None of them is optional, even when the supplied text lacks it:
1. **A description line under the heading.** The stage-opening `prose` has the eyebrow, a heading such as "Python implementation" or "Python logic", and a one-sentence lead-in in `body`: `"Read this code. Focus on the pointer positions."` (use it as written unless the supplied text has its own).
2. **The code, live.** `pattern-canvas`, then `pattern-example`. Do not add a "Test it:" or "Example:" line between them; the example block already carries its own "Try it" caption.
3. **A short explanation below the code.** A `list` introduced by one sentence ("There are three important operations:", "Notice three things:", "This is the core decision structure."), followed by a `callout` (`tone: "info"`) for the rule, caveat or stopping condition. Keep it to a few lines. Use the supplied wording; split paragraphs into list items and a callout instead of leaving them as plain prose.

A stage that jumps straight from the heading to the canvas, or follows the code with loose paragraphs, is wrong.

| Stage | Eyebrow | Purpose | Typical sections |
|---|---|---|---|
| 1 | `1 · Why` | The problem the pattern solves and the naive approach it beats | `prose`, `code` (the input) |
| 2 | `2 · Intuition` | A physical or visual metaphor | lesson-owned intuition scene, `prose` |
| 3 | `3 · How` | The exact moves, frame by frame | `code` (starting state), `pattern-stepper` |
| 4 | `4 · Example` | The real code running on real values | `pattern-canvas`, `pattern-example`, `list`, `callout` |
| 5 | `5 · Trade-offs` | When it works, when it does not, the cost | `prose`, `table` |
| 6 | `6 · Practice` | Trace it by hand before coding | `code`, `prose`, `pattern-exercises` |

Then, always last and in this order:

1. `{ kind: "takeaways", items: [...] }`: 4 to 6 concrete, testable statements.
2. `{ kind: "quiz", questions: [...] }`: see section 6.

Also:
- Interview rules go in `callout` with `tone: "info"`; common mistakes in `callout` with `tone: "warn"`.
- Cost tables use `table` with headers such as `["Measure", "Cost"]`.
- Runnable code goes in `pattern-example`, never a static code block that duplicates the canvas listing.

## 3. The shared UI kit (`src/components/dsa/shared/`)

| Component | Section | What it gives every lesson |
|---|---|---|
| `PatternCanvas` | `{ kind: "pattern-canvas", problemSet: "<id>" }` | The interactive canvas: window chrome with a **file-name dropdown**, presets and input fields, the lesson's stage, a status card (phase, narration, variable chips), transport controls (Autoplay, previous, next, reset, `3 / 14`, speed, progress line), and the **Python / Algorithm** listing with live values under the highlighted line. One fixed size for every step and problem; stacked on phones, side by side on wide screens. |
| `PatternExample` | `{ kind: "pattern-example", problemSet: "<id>" }` | A runnable Python block (`Try it · file.py`) that follows the problem chosen in the canvas. |
| `PatternStepper` | `{ kind: "pattern-stepper", steps: [...] }` | Step tabs, cells (numbers, characters or short labels) with any named pointers, a note, and Previous / Next. |
| `PatternExercises` | `{ kind: "pattern-exercises", exercises: [...] }` | Numbered exercise cards with Check answer, Reset and "N of M correct" feedback. |
| `Quiz` (global, `src/components/lesson/Quiz.tsx`) | `{ kind: "quiz", questions: [...] }` | Multiple choice and coding questions, the pass rule and completion. |

Supporting files: `pattern-canvas-types.ts` (the data contract and token helpers), `problem-sets.ts` (registry), `problem-store.ts` (keeps the canvas and example in sync).

Do not copy or fork these components into a lesson. If a lesson needs something they cannot do, extend the shared component so every lesson benefits.

### 3.1 What the lesson writes for the canvas

The canvas is generic over two types the lesson defines: its **step** and its **input**.

**1. A step type and stage** (lesson folder, e.g. `src/components/dsa/<pattern>/<lesson>/`). The step extends `PatternStep` with whatever the stage draws; the stage is a normal React component.

```ts
// my-step.ts
import type { PatternStep } from "@/components/dsa/shared/pattern-canvas-types";

export type StringStep = PatternStep & {
  chars: string[];
  i: number;
  j: number;
  matched: number[];
};
```

```tsx
// StringStage.tsx
import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import type { StringStep } from "./my-step";

export function StringStage({ step, stepKey, problemId }: StageProps<StringStep>) {
  // Draw anything: characters, nodes and arrows, a call tree, a grid.
  // Use `problemId` as a prefix for motion layoutIds and `stepKey` to replay enter animations.
  return <div className="mx-auto w-full">{/* ... */}</div>;
}
```

Keep helpers and types in a `.ts` file and only the component in the `.tsx` file (React fast refresh requires it).

**2. The problems** (`problems.tsx`). Each problem bundles the listings, the step builder, its input and its stage:

```tsx
import { L, OUT, P, R, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";
import { StringStage } from "./StringStage";
import type { StringStep } from "./my-step";

type Input = { text: string };

export const MY_PROBLEMS: PatternProblem<StringStep, Input>[] = [
  {
    id: "palindrome",
    label: "Valid Palindrome",
    file: "is_palindrome.py",                  // shown as the dropdown trigger
    python: ["def is_palindrome(s):", "    i, j = 0, len(s) - 1", "..."],
    algorithm: ["start i at the front and j at the back", "..."],
    complexity: { time: "O(n)", space: "O(1)" },
    example: { call: 'print(is_palindrome("level"))', output: "True" },
    identifiers: { i: "left", j: "right" },     // coloured in both listings
    presets: [
      { label: "Palindrome", input: { text: "level" } },
      { label: "Not one", input: { text: "lever" } },
    ],
    inputFields: [{ key: "text", placeholder: "e.g. racecar", size: "wide" }],
    formatInput: (input) => ({ text: input.text }),
    parseInput: (fields) => (fields.text?.trim() ? { text: fields.text.trim() } : "Enter a word."),
    build: (input) => buildPalindrome(input.text),
    Stage: StringStage,
  },
];
```

- `inputFields` / `formatInput` / `parseInput` are optional; omit them for preset-only problems. Use `size: "narrow"` with a `label` for a short extra value such as `target` or `k`.
- `parseInput` returns the input or an error string, which the canvas shows to the learner. Reject inputs the algorithm does not support (for example unsorted input for sorted Two Sum).
- For several stage variants, pass props through a wrapper: `Stage: (props) => <ArrayStage {...props} view="bars" settledStyle="none" />`.
- With a single problem, the file name shows without a dropdown.

**3. Register the set** in `src/components/dsa/shared/problem-sets.ts`:

```ts
export const PROBLEM_SETS: Record<string, ProblemSet> = {
  "opposite-ends": { problems: OPPOSITE_ENDS_PROBLEMS, stageMinHeight: "20.5rem" },
  "my-lesson": { problems: MY_PROBLEMS, stageMinHeight: "18rem" },
};
```

Set `stageMinHeight` to the height of the **tallest stage any problem in the set draws**, so switching problems never resizes the canvas. Then use `{ kind: "pattern-canvas", problemSet: "my-lesson" }` and `{ kind: "pattern-example", problemSet: "my-lesson" }` in the lesson.

### 3.2 Writing the step builder

Every step fills the shared fields; the canvas renders them.

| Field | Shown as |
|---|---|
| `phase` | Status-card title, sentence case ("Swapping values") |
| `narration` | One or two sentences on what happens and **why** |
| `codeLines`, `codeNote` | Highlighted Python lines, plus the last one rewritten with real values (`while 0 < 4 → True`) |
| `algoLine`, `algoNote` | The same for the pseudocode view |
| `stats` | Variable chips; keep the **same labels on every step** and show `"·"` for "not yet" |

Token helpers for notes: `L()` left / `R()` right / `V()` value / `OUT()` result / `P()` plain.

- One step per meaningful line of execution: init, check, read, write, move, return. The last step is the return; the canvas marks it done.
- The live-values note is the most valuable teaching device on the page. Never skip it.
- Keep algorithm lines short (about 46 characters at most) and Python lines short where the language allows; the longest line of any problem sets the code column width.
- The longest narration of any preset sets the status-card height, so keep narrations to one or two sentences.
- Give each problem 2 or 3 presets covering edge cases (odd and even length, a single value, no answer).

### 3.3 Canvas size budget

The canvas must keep **one size** for every step and problem, and it must also be **short enough that its controls stay on screen**. A canvas taller than the other lessons pushes Autoplay, the arrows and the speed buttons below the fold on laptop screens, which reads as a layout bug.

- **Height budget:** about **725px at desktop width** (Opposite Ends is 722px, Fast & Slow 602px). Measure it; the Autoplay row must end inside an 830px-tall window with the canvas just under the site header.
- **The code listing sets the height.** The supplied code is kept verbatim, so do not trim it. `PatternCanvas` already sets listings of more than 16 lines tighter (12.5px, line height 1.4); a 23-line listing then lands at about 726px. Do not hand-tune font sizes in a lesson, and do not add height anywhere else.
- **The stage must not add height.** Reserve space for the tallest pointer stack and give the cell row a fixed height (for example `h-[5.5rem]`), so presets with different numbers of cells do not move the row. `stageMinHeight` is the tallest stage any problem draws, not a safe-looking large number.
- **Measure, do not guess.** See the browser checks in section 7.

### 3.4 Visual rules for stages

- Colour roles are fixed site-wide: **left / first pointer mint, right / second pointer blue, reading amber, swapping or a third pointer violet, rejected rose, done mint**. Never repurpose them.
- Size the stage with fluid columns (`grid-template-columns: repeat(n, minmax(0, 1fr))`), not fixed widths, so it never overflows on phones. Use container units (`cqi`) for text that must shrink.
- Keep pointer labels attached to what they point at; a stage must not stretch them apart.
- Use `motion` `layout` / `layoutId` for movement and CSS transitions for colour and size. Do **not** use `AnimatePresence mode="wait"` for content that changes every step: the exit can stall and leave stale content. Key the element and use an enter animation instead.
- Use `overflow-clip` instead of `overflow-hidden` on cards with focusable controls.

## 4. Stepper (stage 3)

```ts
{
  kind: "pattern-stepper",
  steps: [
    {
      label: "Step 1",                               // optional; defaults to "Step N" (use "Start" for an initial state)
      title: "Swap the outer elements",
      cells: [10, 20, 30, 40, 50],                   // or ["l", "e", "v", "e", "l"]
      pointers: [
        { index: 0, label: "left", tone: "left" },
        { index: 4, label: "right", tone: "right" }, // tones: left | right | mid | accent
      ],
      note: "Swap `numbers[left]` with `numbers[right]`.",
    },
  ],
}
```

Several pointers can share a cell (for example `low`, `mid` and `high` all at index 0): they stack above one arrow, and the cell takes the colour of the most specific role (`accent`, then `mid`, `left`, `right`). In a stage, reserve room for the tallest stack of pointer labels so the cells never move.

## 5. Exercises (stage 6)

Start with "trace it first" exercises that need no code. Three types: `fields` (labelled answers), `cells` (one answer per index) and `choice` (pick one option). Each card is labelled "Exercise N" unless you set `label` (for example `"Question A"` when the supplied content letters its questions).

```ts
{
  kind: "pattern-exercises",
  exercises: [
    {
      type: "fields",                                  // labelled answers
      title: "Identify the pointers",
      prompt: "Enter the starting index and the value stored at that index.",
      fields: [
        { label: "Left index", answer: 0, tone: "left" },
        { label: "Right value", answer: 21, tone: "right" },
      ],
      success: "Both pointers are in the right place.",
      hint: "Indices start at 0, and the last index is len(numbers) - 1.",
    },
    {
      type: "cells",                                   // one answer per index
      title: "After the first swap",
      prompt: "What does the array look like after you swap the two elements?",
      answers: [21, 8, 12, 17, 3],                     // numbers or strings
      success: "Correct. Only the two outer values changed places.",
      hint: "Only the values at left and right move.",
    },
    {
      type: "choice",                                  // one correct option
      label: "Question A",
      title: "Duplicate or new value?",
      prompt: "When fast = 1, do the pointers detect a duplicate or a new value?",
      options: ["A duplicate", "A new value"],
      answer: 0,                                       // index of the correct option
      success: "Right. numbers[1] equals numbers[0], so slow stays.",
      hint: "Compare numbers[fast] with numbers[slow].",
    },
  ],
}
```

Numbers are compared by value; text answers are trimmed and compared case-insensitively. A wrong check shows "N of M correct." (or "Not quite." for `choice`) followed by your `hint`, so write the hint as the next thing to think about, not the answer.

## 6. Quiz and completion criteria

### Composition
- 3 to 5 multiple-choice questions that test understanding (why the loop condition, complexity, when the pattern applies), plus **exactly one coding challenge as the last question**. A lesson quiz without a coding challenge is incomplete.
- Use the questions the user supplied. **If the supplied content has no coding challenge, write one** and say so in your summary, because the wording is yours.
- Make the challenge a **transfer**, not a repeat: apply the same pattern to a new rule, and never reuse the lesson's own function, which would hand over the answer (for example Dutch National Flag asks for `sort_by_sign`, negatives then zeros then positives, not `sort_colors`).
- With three multiple-choice questions plus the challenge there are four questions, so the bar is 75% and one multiple-choice miss is allowed. Without a challenge a three-question quiz needs every answer right.
- Options are shuffled at runtime, so never write "A.", "B." or "all of the above".
- Every question has an `explanation`. Write complexity as `O(n)`, `O(n²)` (no LaTeX).

### Pass rule (enforced by the global `Quiz`)
- Four questions: **75%** to pass. Five or more: **80%**. Three or fewer: 80%.
- **Every coding question must pass**, regardless of the overall score.
- Passing fires `quiz-passed`, which marks the lesson complete. The results screen explains why a learner did not pass.

### Coding challenge hardening
A coding answer must not pass by printing the expected output, hardcoding, or using a forbidden shortcut. Use all three layers (see the `challenge` in `opposite-ends.ts`):

1. **`forbiddenCodePatterns`**: regexes, each with a learner-facing message, checked on the code with comments removed. Forbid the shortcuts the lesson replaces (slicing, `reversed()`, `.reverse()`, `sorted`, building a new list, `for` when the lesson teaches `while`, built-in helpers that solve the task) and escape hatches (`import`, `__`, `exec`, `eval`, `globals`, `setattr`, `compile`).
2. **`requiredCodePatterns`** with `validationMessage`: the function definition and the required construct.
3. **A hidden grader in `testCode`**, with `gradeLastLine: true` and a sentinel `expectedOutput` such as `"All hidden tests passed"`:
   - Reach builtins through `import builtins as _sb_b`, so a learner who shadows `list` or `print` cannot break or fake it.
   - Pass instrumented inputs (for lists, a `list` subclass that raises on slicing, iteration and copying and counts reads and writes) to prove the method, not just the result.
   - Budget the operations (for example reads at most `6n + 10`, writes at most `2n`) and include one **large** input (around 40 values), so quadratic sorts and nested scans exceed the budget.
   - Run fixed edge cases **and** inputs generated at run time, so answers cannot be hardcoded.
   - Assert the result, the return contract and, when taught, the exact operation count.
   - Print one specific failure message, or the sentinel.

`initialCode` contains the function stub and the test call from the challenge text.

## 7. Verification checklist

Run all of these before you report the lesson done.

1. `npx tsc --noEmit`, `npx eslint` on every touched file, and `npx prettier --write` on new files.
2. **Traces and examples**: with `npx tsx --tsconfig ./tsconfig.json`, build every preset of every problem and check the final step, that every `codeLines` / `algoLine` is inside its listing, that `parseInput(formatInput(preset))` round-trips, and that `python.join("\n") + example.call` run with `python3 -I` prints `example.output`.
3. **Grader**: run `testCode` after a correct solution, an alternative correct solution, an off-by-one solution, the untouched starter, each forbidden shortcut, a hardcoded `print`, a copy-based answer, and an O(n²) sort. Only correct solutions may print the sentinel. The quiz must end with the coding challenge.
4. **Browser**, on `/patterns/<pattern>/<lesson>`:
   - At 375, 768, 1024, 1280 and 1440px: no page-level horizontal scroll, no code overflow in the canvas, controls directly under the stage when stacked, and **one canvas height** across every step of every preset of every problem.
   - **Canvas budget:** at 1280px wide the canvas is about 725px tall or less, and in an 831px-tall window the Autoplay row ends inside the window with the canvas under the header. Compare with Opposite Ends (722px).
   - **Example stage:** description line under the heading, then canvas and example with no "Test it:", then the list and callout.
   - The file-name dropdown switches problems, and the `pattern-example` caption and code follow it.
   - Exercises report correct and wrong answers; the stepper steps.
   - The table of contents lists exactly the six stage names, and there are no console errors.

The Claude browser pane may be hidden, which freezes `motion` and CSS animations. Verify state through the DOM, and say plainly when animation smoothness was not observed.

## 8. Do not

- Do not fork `PatternCanvas`, `PatternExample`, `PatternStepper`, `PatternExercises` or `Quiz` into a lesson; extend the shared component instead.
- Do not put lesson-specific drawing (arrays, strings, nodes, trees) in `src/components/dsa/shared/`.
- Do not edit `HeroInteractiveDemo.tsx` for a lesson.
- Do not add a static code block that duplicates the canvas listing.
- Do not leave old canvases, view types, Step fields or helper files behind after a revamp.
- Do not ship a quiz without a coding challenge, an Example stage without its description line and explanation below the code, or a canvas taller than the budget in section 3.3.
- Do not change the global sidebar, Rivet or quiz behaviour for one lesson without asking.

## 9. Shipping changes

The working folder may not be a git repository; changes often reach the `staging` branch by uploading files to GitHub. Tell the user exactly what to move, because a partial upload breaks the build.

- **List every file**, grouped as *add*, *update* and *delete*, with a one-line reason each. Base the list on file modification times compared with the user's last upload (for example `find src .agents -type f -mmin -<minutes>`), not on memory.
- **Exclude unrelated changes.** If other files (for example Rivet) changed in the same window but not as part of this work, name them and tell the user not to ship them unless they know what they contain.
- **Name the dependencies that must ship together.** For pattern lessons these are:
  - the lesson file, `src/lessons/types.ts`, `src/components/python/SectionRenderer.tsx` and the whole `src/components/dsa/shared/` folder;
  - the lesson's component folder (stage, step helpers, `problems.tsx`) and its entry in `shared/problem-sets.ts`;
  - any player file (`LessonPlayer.tsx`) together with the removal of a canvas it used to import.
- **Upload before deleting.** Add and update files first, then delete the replaced ones, and say that staging can be briefly broken in between when using the web uploader.
- **Give a post-deploy check**: the lesson's canvas dropdown and `Try it` sync, the stepper, the exercises, the table of contents, quiz completion, and that the other lessons in the same pattern still load.
- **Back up deletions.** When deleting files in a folder without version control, copy them somewhere first and tell the user where, and whether that location survives the session.
